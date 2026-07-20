import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookCard } from '../../components';
import { STATUS_LABEL } from '../../lib/status';
import { useTbr, type TbrEntry } from '../../lib/tbr';
import { colors, fonts, radii, spacing, type } from '../../lib/theme';

const CATEGORIES = [
  { label: 'Books', active: true },
  { label: 'Shows', active: false },
  { label: 'Movies', active: false },
  { label: 'Sites', active: false },
] as const;

/** S3 — Home / TBR list (brief A6, U8/U9). Real data + status entry per card. */
export default function Home() {
  const router = useRouter();
  const { data: entries, isLoading, isError, refetch } = useTbr();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.itemId}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={type.heading}>What&rsquo;s next on your TBR?</Text>
            <View style={styles.pills}>
              {CATEGORIES.map((c) => (
                <View
                  key={c.label}
                  style={[styles.pill, c.active ? styles.pillActive : styles.pillIdle]}>
                  <Text style={[styles.pillLabel, c.active && styles.pillLabelActive]}>
                    {c.label}
                  </Text>
                  {!c.active ? <Text style={styles.soon}>soon</Text> : null}
                </View>
              ))}
            </View>
            <Pressable
              style={styles.searchLink}
              onPress={() => router.push('/search')}
              accessibilityRole="button">
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchText}>Something specific?</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => <TbrRow entry={item} />}
        ListEmptyComponent={
          <TbrStatus isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
        }
      />
    </SafeAreaView>
  );
}

function TbrRow({ entry }: { entry: TbrEntry }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push(`/item/${entry.itemId}`)}
        accessibilityRole="button">
        <BookCard
          title={entry.title}
          author={entry.author ?? undefined}
          coverUri={entry.coverUrl}
          tags={entry.tags}
          recommenders={entry.recommenders}
        />
      </Pressable>
      <Pressable
        style={styles.statusBtn}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/status',
            params: {
              recs: entry.recommendationIds.join(','),
              status: entry.status,
              title: entry.title,
            },
          })
        }>
        <Text style={styles.statusText}>{STATUS_LABEL[entry.status]}</Text>
        <Text style={styles.statusEdit}>Update ›</Text>
      </Pressable>
    </View>
  );
}

function TbrStatus({
  isLoading,
  isError,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) return <ActivityIndicator color={colors.primary400} style={styles.center} />;
  if (isError)
    return (
      <Pressable onPress={onRetry} style={styles.center} accessibilityRole="button">
        <Text style={type.body}>Couldn&rsquo;t load your TBR. Tap to retry.</Text>
      </Pressable>
    );
  return (
    <Text style={[type.body, styles.center]}>
      Nothing here yet — search a book or ask a friend to send you one.
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.xl,
  },
  pillActive: { backgroundColor: colors.primary400 },
  pillIdle: { borderWidth: 1, borderColor: colors.font, opacity: 0.5 },
  pillLabel: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
  pillLabelActive: { color: colors.primary800 },
  soon: { fontFamily: fonts.action, fontSize: 11, color: colors.font },
  searchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  searchIcon: { fontSize: 18 },
  searchText: { fontFamily: fonts.body, fontSize: 18, color: colors.font },
  row: { gap: spacing.xs },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary400,
    borderRadius: radii.md,
  },
  statusText: { fontFamily: fonts.action, fontSize: 16, color: colors.primary400 },
  statusEdit: { fontFamily: fonts.action, fontSize: 14, color: colors.font },
  center: { paddingVertical: spacing.xl, textAlign: 'center' },
});
