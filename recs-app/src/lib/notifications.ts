/**
 * Notifications data layer — brief A7 (U11/U12) + Expo push registration.
 *
 * In-app inbox reads the `notifications` table (written by the DB triggers on
 * rec insert / status change). Push *delivery* additionally needs a development
 * build + the `push-fanout` Edge Function + platform push creds (A8) — remote
 * push tokens can't be minted inside Expo Go on SDK 53+, so registration below
 * fails soft there. The inbox works fully without any of that.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationType } from '../types/database';
import { useAuth } from './auth';
import { embedOne } from './embed';
import { supabase } from './supabase';

export interface InboxItem {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  itemId: string | null;
  itemTitle: string | null;
}

interface RawNotifRow {
  id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  actor: { id: string; display_name: string | null; avatar: string | null } | null;
  recommendation: {
    item_id: string;
    items: { title: string } | { title: string }[] | null;
  } | null;
}

/** My inbox, newest first (U11). */
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<InboxItem[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select(
          'id, type, read, created_at, ' +
            'actor:users!notifications_actor_id_fkey(id, display_name, avatar), ' +
            'recommendation:recommendations!notifications_recommendation_id_fkey(item_id, items(title))',
        )
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .returns<RawNotifRow[]>();
      if (error) throw error;

      return (data ?? []).map((row) => {
        const item = embedOne(row.recommendation?.items ?? null);
        return {
          id: row.id,
          type: row.type,
          read: row.read,
          createdAt: row.created_at,
          actorId: row.actor?.id ?? null,
          actorName: row.actor?.display_name ?? null,
          actorAvatar: row.actor?.avatar ?? null,
          itemId: row.recommendation?.item_id ?? null,
          itemTitle: item?.title ?? null,
        };
      });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user!.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/**
 * Register this device's Expo push token against the user row. Fails soft:
 * no-ops on web, on simulators/emulators, and inside Expo Go (no remote token).
 * Full delivery needs a dev build (A8).
 */
export async function registerForPushNotificationsAsync(userId: string): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  const { error } = await supabase
    .from('users')
    .update({ expo_push_token: token })
    .eq('id', userId);
  if (error) throw error;
}

/** Mount once behind auth; registers the push token when a user is present. */
export function usePushRegistration() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    registerForPushNotificationsAsync(user.id).catch((e) => {
      if (__DEV__) console.warn('[push] registration skipped (needs a dev build):', e);
    });
  }, [user]);
}
