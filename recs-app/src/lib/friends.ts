/**
 * Friends data layer (brief A5 — U3/U4/U14). React Query hooks over Supabase.
 * The send-a-rec flow (S6) lives elsewhere and depends on A4's book detail — not here.
 *
 * Relies entirely on things A3 already shipped and seeded:
 *  - RPC `redeem_invite_code(code)` (SECURITY DEFINER) inserts the friendship + notifies.
 *  - RLS: users_select_self_or_friend, friendships_select_member, recs_select_party,
 *    recstatus_select_party — so every read below is scoped to the signed-in user.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Reaction, RecStatusValue } from '../types/database';
import { useAuth } from './auth';
import { embedOne } from './embed';
import { supabase } from './supabase';

export interface MyProfile {
  id: string;
  display_name: string | null;
  avatar: string | null;
  invite_code: string;
}

export interface FriendSummary {
  id: string;
  display_name: string | null;
  avatar: string | null;
}

/** One recommendation between me and a friend, flattened for the S11 list. */
export interface RecBetween {
  id: string;
  note: string | null;
  createdAt: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  status: RecStatusValue | null;
  reaction: Reaction | null;
}

export interface RecsBetween {
  /** What I recommended to this friend. */
  sent: RecBetween[];
  /** What this friend recommended to me. */
  received: RecBetween[];
}

/** My own row — powers the invite-code card on S7. */
export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['myProfile', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<MyProfile> => {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, avatar, invite_code')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** My connected friends (U4). Two-step: read my friendship rows, then the other users. */
export function useFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['friends', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<FriendSummary[]> => {
      const me = user!.id;
      const { data: rows, error } = await supabase
        .from('friendships')
        .select('user_a, user_b');
      if (error) throw error;

      const otherIds = (rows ?? []).map((f) => (f.user_a === me ? f.user_b : f.user_a));
      if (otherIds.length === 0) return [];

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, avatar')
        .in('id', otherIds);
      if (usersError) throw usersError;

      return (users ?? []).sort((a, b) =>
        (a.display_name ?? '').localeCompare(b.display_name ?? ''),
      );
    },
  });
}

/**
 * Connect by invite code (U3). Returns the friend's user row on success.
 * The RPC raises friendly Postgres exceptions ("invalid invite code",
 * "you cannot add yourself") — surfaced to the caller via `error.message`.
 */
export function useRedeemInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string): Promise<FriendSummary> => {
      const { data, error } = await supabase.rpc('redeem_invite_code', {
        code: code.trim().toUpperCase(),
      });
      if (error) throw error;
      return { id: data.id, display_name: data.display_name, avatar: data.avatar };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

// Raw shape of the nested select below (typed via `.returns<>()` so we avoid casts).
interface RawRecRow {
  id: string;
  sender_id: string | null;
  recipient_id: string;
  note: string | null;
  created_at: string;
  items: { title: string; authors: string[]; cover_url: string | null } | null;
  rec_status: RecStatusEmbed | RecStatusEmbed[] | null;
}

interface RecStatusEmbed {
  status: RecStatusValue;
  reaction: Reaction | null;
}

function toRecBetween(row: RawRecRow): RecBetween {
  const statusRow = embedOne(row.rec_status);
  return {
    id: row.id,
    note: row.note,
    createdAt: row.created_at,
    title: row.items?.title ?? 'Untitled',
    author: row.items?.authors?.[0] ?? null,
    coverUrl: row.items?.cover_url ?? null,
    status: statusRow?.status ?? null,
    reaction: statusRow?.reaction ?? null,
  };
}

/**
 * "Recs between us" (U14) — everything I sent this friend and everything they sent me,
 * each with its current status/reaction. RLS already limits rows to my own party.
 */
export function useRecsBetween(friendId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['recsBetween', user?.id, friendId],
    enabled: Boolean(user) && Boolean(friendId),
    queryFn: async (): Promise<RecsBetween> => {
      const me = user!.id;
      const { data, error } = await supabase
        .from('recommendations')
        .select(
          'id, sender_id, recipient_id, note, created_at, ' +
            'items(title, authors, cover_url), rec_status(status, reaction)',
        )
        .or(
          `and(sender_id.eq.${me},recipient_id.eq.${friendId}),` +
            `and(sender_id.eq.${friendId},recipient_id.eq.${me})`,
        )
        .order('created_at', { ascending: false })
        .returns<RawRecRow[]>();
      if (error) throw error;

      const rows = data ?? [];
      return {
        sent: rows.filter((r) => r.sender_id === me).map(toRecBetween),
        received: rows.filter((r) => r.sender_id === friendId).map(toRecBetween),
      };
    },
  });
}
