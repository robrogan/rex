/**
 * Send-a-rec data layer — brief A5 (U6/U15). React Query over Supabase.
 *
 * Insert one `recommendations` row per recipient (RLS requires sender = me and a
 * friendship). The DB triggers create `rec_status('to_read')`, a `rec_received`
 * notification, and fanout the Expo push. Re-sending the same book to the same
 * friend hits the `recommendations_sent_unique` index (23505) — treated as
 * "already sent" rather than an error.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './auth';
import { supabase } from './supabase';

export interface SendResult {
  sent: number;
  alreadySent: number;
}

export interface SendInput {
  itemId: string;
  recipientIds: string[];
  note: string | null;
}

export function useSendRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, recipientIds, note }: SendInput): Promise<SendResult> => {
      const me = user!.id;
      let sent = 0;
      let alreadySent = 0;
      for (const recipientId of recipientIds) {
        const { error } = await supabase.from('recommendations').insert({
          item_id: itemId,
          sender_id: me,
          recipient_id: recipientId,
          note: note && note.trim() ? note.trim() : null,
        });
        if (!error) sent += 1;
        else if (error.code === '23505') alreadySent += 1;
        else throw error;
      }
      return { sent, alreadySent };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recommendedTo'] });
      void queryClient.invalidateQueries({ queryKey: ['recsBetween'] });
    },
  });
}

export interface RecipientSummary {
  id: string;
  name: string;
  uri?: string | null;
}

interface RawRecipientRow {
  recipient: { id: string; display_name: string | null; avatar: string | null } | null;
}

/** Who I've already recommended this book to (U15 "Recommended to…"). */
export function useRecommendedTo(itemId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['recommendedTo', user?.id, itemId],
    enabled: Boolean(user) && Boolean(itemId),
    queryFn: async (): Promise<RecipientSummary[]> => {
      const { data, error } = await supabase
        .from('recommendations')
        .select('recipient:users!recommendations_recipient_id_fkey(id, display_name, avatar)')
        .eq('sender_id', user!.id)
        .eq('item_id', itemId!)
        .returns<RawRecipientRow[]>();
      if (error) throw error;

      const seen = new Set<string>();
      const out: RecipientSummary[] = [];
      for (const row of data ?? []) {
        const r = row.recipient;
        if (r && !seen.has(r.id)) {
          seen.add(r.id);
          out.push({ id: r.id, name: r.display_name ?? 'Friend', uri: r.avatar });
        }
      }
      return out;
    },
  });
}
