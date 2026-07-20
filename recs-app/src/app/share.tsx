import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar, PrimaryButton, SecondaryButton } from '../components';
import { publicItemUrl } from '../lib/config';
import { useFriends } from '../lib/friends';
import { fetchVolume } from '../lib/googleBooks';
import { ensureItem } from '../lib/items';
import { useSendRecommendations } from '../lib/send';
import { supabase } from '../lib/supabase';
import { colors, fonts, radii, spacing, type } from '../lib/theme';

function firstParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

/** S6 — Share sheet: send a book to friends (+ note), or copy a public link (U6/U6b). */
export default function Share() {
  const router = useRouter();
  const routeId = firstParam(useLocalSearchParams<{ item?: string }>().item);

  // Resolve the route id to a DB item uuid (creating the row for fresh gb: books).
  const resolved = useQuery({
    queryKey: ['resolveItem', routeId],
    enabled: Boolean(routeId),
    queryFn: async (): Promise<{ itemId: string; title: string }> => {
      if (routeId.startsWith('gb:')) {
        const row = await ensureItem(await fetchVolume(routeId.slice(3)));
        return { itemId: row.id, title: row.title };
      }
      const { data, error } = await supabase
        .from('items')
        .select('id, title')
        .eq('id', routeId)
        .single();
      if (error) throw error;
      return { itemId: data.id, title: data.title };
    },
  });

  const { data: friends } = useFriends();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const send = useSendRecommendations();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSend() {
    if (!resolved.data || selected.size === 0) return;
    send.mutate(
      { itemId: resolved.data.itemId, recipientIds: [...selected], note },
      { onSuccess: () => setTimeout(() => router.back(), 1200) },
    );
  }

  async function onCopyLink() {
    if (!resolved.data) return;
    await Clipboard.setStringAsync(publicItemUrl(resolved.data.itemId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (resolved.isLoading) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={colors.primary400} />
      </View>
    );
  }
  if (resolved.isError || !resolved.data) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <Text style={type.body}>Couldn&rsquo;t load this book.</Text>
      </View>
    );
  }

  if (send.isSuccess) {
    const { sent, alreadySent } = send.data;
    return (
      <View style={[styles.safe, styles.centered]}>
        <Text style={styles.toast}>
          {sent > 0 ? `Sent to ${sent} friend${sent === 1 ? '' : 's'}! 🎉` : 'Already sent.'}
          {alreadySent > 0 && sent > 0 ? `\n(${alreadySent} already had it)` : ''}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <Text style={type.cardTitle} numberOfLines={2}>
        Send &ldquo;{resolved.data.title}&rdquo;
      </Text>

      {friends && friends.length > 0 ? (
        <>
          <Text style={styles.label}>To</Text>
          {friends.map((f) => {
            const on = selected.has(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => toggle(f.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={[styles.friendRow, on && styles.friendRowOn]}>
                <Avatar name={f.display_name ?? '?'} uri={f.avatar} size={40} />
                <Text style={styles.friendName}>{f.display_name ?? 'Friend'}</Text>
                <Text style={styles.check}>{on ? '✓' : ''}</Text>
              </Pressable>
            );
          })}

          <TextInput
            style={styles.note}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.font}
            selectionColor={colors.primary400}
            maxLength={140}
            multiline
          />

          <PrimaryButton
            label={send.isPending ? 'Sending…' : `Send${selected.size ? ` (${selected.size})` : ''}`}
            onPress={onSend}
            disabled={selected.size === 0 || send.isPending}
          />
          {send.isError ? <Text style={type.body}>Couldn&rsquo;t send — try again.</Text> : null}
        </>
      ) : (
        <Pressable onPress={() => router.replace('/friends')} accessibilityRole="button">
          <Text style={type.body}>Add a friend first, then you can send them books. →</Text>
        </Pressable>
      )}

      <View style={styles.divider} />
      <SecondaryButton label={copied ? 'Link copied!' : 'Copy public link'} onPress={onCopyLink} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { padding: spacing.lg, gap: spacing.md },
  label: { ...type.action, color: colors.font, marginTop: spacing.sm },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardOutline,
  },
  friendRowOn: { borderColor: colors.primary400 },
  friendName: { ...type.body, flex: 1 },
  check: {
    fontFamily: fonts.action,
    fontSize: 20,
    color: colors.primary400,
    width: 20,
    textAlign: 'center',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.fontOnPrimary,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  divider: { height: 1, backgroundColor: colors.cardOutline, marginVertical: spacing.sm },
  toast: { ...type.heading, textAlign: 'center' },
});
