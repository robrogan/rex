/**
 * `items`-table helpers shared by the search/detail flow (A4) and the send flow
 * (A5). Kept small and standalone so the two parallel branches reconcile easily.
 *
 * Design: books are written to the DB lazily — only when the user acts on one
 * (add-to-TBR here, send in A5), never merely on view. See the A4 plan.
 */
import { type BookVolume } from './googleBooks';
import { supabase } from './supabase';
import type { Database } from '../types/database';

type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemRow = Database['public']['Tables']['items']['Row'];

/** Map a normalized Google Books volume to an `items` insert. */
export function volumeToItemInsert(v: BookVolume): ItemInsert {
  return {
    category: 'book',
    source: 'google_books',
    source_id: v.volumeId,
    title: v.title,
    authors: v.authors,
    cover_url: v.coverUrl,
    description: v.description,
    tags: v.tags,
  };
}

/**
 * Ensure a book exists in `items` and return its row (incl. the DB uuid).
 * Idempotent via the `items(source, source_id)` unique constraint.
 */
export async function ensureItem(v: BookVolume): Promise<ItemRow> {
  const { data, error } = await supabase
    .from('items')
    .upsert(volumeToItemInsert(v), { onConflict: 'source,source_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Add a book to the current user's own TBR (U7): a self-recommendation
 * (`sender_id = null`). The `handle_new_recommendation` trigger auto-creates the
 * `rec_status('to_read')` row and does not notify on a self-add. Idempotent —
 * the `recommendations_selfadd_unique` partial index makes a repeat a no-op.
 */
export async function addToTbr(v: BookVolume): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('Must be signed in to add to your TBR.');

  const item = await ensureItem(v);
  const { error } = await supabase.from('recommendations').insert({
    item_id: item.id,
    sender_id: null,
    recipient_id: userId,
    note: null,
  });
  // 23505 = unique_violation → already on the TBR, treat as success.
  if (error && error.code !== '23505') throw error;
}
