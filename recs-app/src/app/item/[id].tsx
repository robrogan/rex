import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, TagChip } from '../../components';
import { fetchVolume, type BookVolume } from '../../lib/googleBooks';
import { addToTbr } from '../../lib/items';
import { supabase } from '../../lib/supabase';
import { colors, radii, spacing, type } from '../../lib/theme';
import type { Database } from '../../types/database';

type ItemRow = Database['public']['Tables']['items']['Row'];

/** Map a DB `items` row into the same shape the API branch returns. */
function rowToVolume(row: ItemRow): BookVolume {
  return {
    volumeId: row.source_id ?? row.id,
    title: row.title,
    authors: row.authors,
    coverUrl: row.cover_url,
    description: row.description,
    tags: row.tags,
  };
}

/**
 * S5 — Book detail. Resolves two id forms (A4 plan):
 *   `gb:<volumeId>` → fresh Google Books result (not yet in the DB)
 *   `<uuid>`        → a DB-backed `items` row (TBR items, shared links)
 * Also the public web route (S12); dynamic content gets gated in A9.
 * The U15 "Recommended to…" affordance is added in A5.
 */
export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isGb = id?.startsWith('gb:') ?? false;

  const { data: book, isLoading, isError } = useQuery({
    queryKey: ['itemDetail', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<BookVolume> => {
      if (isGb) return fetchVolume(id.slice(3));
      const { data, error } = await supabase.from('items').select().eq('id', id).single();
      if (error) throw error;
      return rowToVolume(data);
    },
  });

  const qc = useQueryClient();
  const addTbr = useMutation({
    mutationFn: () => addToTbr(book!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tbr'] }),
  });

  if (isLoading) {
    return (
      <Centered>
        <ActivityIndicator color={colors.primary400} />
      </Centered>
    );
  }
  if (isError || !book) {
    return (
      <Centered>
        <Text style={type.body}>Couldn’t load this book.</Text>
      </Centered>
    );
  }

  const tbrLabel = addTbr.isSuccess
    ? 'On your TBR ✓'
    : addTbr.isPending
      ? 'Adding…'
      : 'Add to my TBR';

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: book.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.coverImg} contentFit="cover" />
          ) : (
            <Text style={styles.coverEmoji}>📚</Text>
          )}
        </View>

        <Text style={type.cardTitle}>{book.title}</Text>
        {book.authors.length > 0 ? (
          <Text style={type.author}>{book.authors.join(', ')}</Text>
        ) : null}

        {book.tags.length > 0 ? (
          <View style={styles.tags}>
            {book.tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
        ) : null}

        {/* U15 "Recommended to…" / who-recommended-this affordance — added in A5. */}

        {book.description ? <Text style={type.description}>{book.description}</Text> : null}

        {/* Actions (A5/A6 will extend). Add-to-TBR is live; Share/status are stubs. */}
        <View style={styles.actions}>
          <PrimaryButton
            label={tbrLabel}
            onPress={() => addTbr.mutate()}
            disabled={addTbr.isPending || addTbr.isSuccess}
          />
          {addTbr.isError ? (
            <Text style={type.body}>Couldn’t add — try again.</Text>
          ) : null}
          <Link href="/share" style={type.action}>
            → Share (S6)
          </Link>
          <Link href="/status" style={type.action}>
            → Update status (S9)
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={[styles.safe, styles.centered]}>
      <Stack.Screen options={{ title: '' }} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  cover: {
    alignSelf: 'center',
    width: 200,
    height: 300,
    borderRadius: radii.sm,
    backgroundColor: colors.coverPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImg: { width: '100%', height: '100%' },
  coverEmoji: { fontSize: 56, opacity: 0.85 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
