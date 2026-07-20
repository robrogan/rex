/**
 * TBR (home) data layer — brief A6 (U8/U10). React Query over Supabase.
 *
 * A user's TBR is every recommendation where they are the recipient (including
 * self-adds, `sender_id = null`, from A4's `addToTbr`). Multiple friends can
 * recommend the same book → multiple `recommendations` rows for one `item_id`;
 * we group them into a single card with a combined recommender badge ("Nick +1"),
 * per ARCHITECTURE §2. Status is per-recommendation in the schema, so a status
 * change writes every `recommendation_id` for that item to keep the card coherent.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Reaction, RecStatusValue } from '../types/database';
import { useAuth } from './auth';
import { embedOne } from './embed';
import { supabase } from './supabase';

export interface TbrEntry {
  itemId: string;
  /** Every recommendation of this book to me — a status change writes all of them. */
  recommendationIds: string[];
  title: string;
  author: string | null;
  coverUrl: string | null;
  tags: string[];
  /** Friends who recommended it (self-adds contribute no badge). */
  recommenders: { name: string; uri?: string | null }[];
  status: RecStatusValue;
  reaction: Reaction | null;
  note: string | null;
}

interface RawTbrRow {
  id: string;
  item_id: string;
  sender_id: string | null;
  note: string | null;
  created_at: string;
  items: { title: string; authors: string[]; cover_url: string | null; tags: string[] } | null;
  rec_status: { status: RecStatusValue; reaction: Reaction | null } | { status: RecStatusValue; reaction: Reaction | null }[] | null;
  sender: { display_name: string | null; avatar: string | null } | null;
}

/** My TBR (U8) — one entry per book, newest first, recommenders grouped. */
export function useTbr() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tbr', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<TbrEntry[]> => {
      const { data, error } = await supabase
        .from('recommendations')
        .select(
          'id, item_id, sender_id, note, created_at, ' +
            'items(title, authors, cover_url, tags), ' +
            'rec_status(status, reaction), ' +
            'sender:users!recommendations_sender_id_fkey(display_name, avatar)',
        )
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false })
        .returns<RawTbrRow[]>();
      if (error) throw error;

      const byItem = new Map<string, TbrEntry>();
      for (const row of data ?? []) {
        const status = embedOne(row.rec_status);
        const existing = byItem.get(row.item_id);
        if (!existing) {
          byItem.set(row.item_id, {
            itemId: row.item_id,
            recommendationIds: [row.id],
            title: row.items?.title ?? 'Untitled',
            author: row.items?.authors?.[0] ?? null,
            coverUrl: row.items?.cover_url ?? null,
            tags: row.items?.tags ?? [],
            recommenders: row.sender?.display_name
              ? [{ name: row.sender.display_name, uri: row.sender.avatar }]
              : [],
            status: status?.status ?? 'to_read',
            reaction: status?.reaction ?? null,
            note: row.note,
          });
        } else {
          existing.recommendationIds.push(row.id);
          if (row.sender?.display_name) {
            existing.recommenders.push({ name: row.sender.display_name, uri: row.sender.avatar });
          }
          if (!existing.note && row.note) existing.note = row.note;
        }
      }
      return [...byItem.values()];
    },
  });
}

export interface SetStatusInput {
  recommendationIds: string[];
  status: RecStatusValue;
  reaction?: Reaction | null;
  reactionNote?: string | null;
}

/**
 * Update status for a TBR book (U10/U12). Writes every recommendation row for the
 * item. Moving to `finished` (or `not_for_me`) can carry a reaction. The DB
 * `handle_status_change` trigger fanouts the "ping" to the sender — no client work.
 */
export function useSetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recommendationIds, status, reaction, reactionNote }: SetStatusInput) => {
      const patch: {
        status: RecStatusValue;
        reaction?: Reaction | null;
        reaction_note?: string | null;
      } = { status };
      // Only attach a reaction on the terminal states that carry one.
      if (status === 'finished' || status === 'not_for_me') {
        patch.reaction = reaction ?? null;
        patch.reaction_note = reactionNote ?? null;
      }
      const { error } = await supabase
        .from('rec_status')
        .update(patch)
        .in('recommendation_id', recommendationIds);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tbr'] });
      void queryClient.invalidateQueries({ queryKey: ['recsBetween'] });
    },
  });
}
