import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookCard, SearchBar } from '../components';
import { useBookSearch } from '../hooks/useBookSearch';
import type { BookVolume } from '../lib/googleBooks';
import { colors, spacing, type } from '../lib/theme';

/** S4 — Search results via Google Books (A4). Canonical works, infinite scroll. */
export default function Search() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const {
    results,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isActive,
  } = useBookSearch(query);

  const openBook = (v: BookVolume) =>
    router.push(`/item/${encodeURIComponent(`gb:${v.volumeId}`)}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={results}
        keyExtractor={(v) => v.volumeId}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={type.heading}>Search</Text>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Title or author…" />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openBook(item)} accessibilityRole="button">
            <BookCard
              title={item.title}
              author={item.authors.join(', ') || undefined}
              coverUri={item.coverUrl}
              tags={item.tags}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <SearchStatus
            isActive={isActive}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
          />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary400} style={styles.footer} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/** The empty-list slot: idle hint, spinner, error, or no-results. */
function SearchStatus({
  isActive,
  isLoading,
  isError,
  onRetry,
}: {
  isActive: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) return <ActivityIndicator color={colors.primary400} style={styles.status} />;
  if (isError)
    return (
      <Pressable onPress={onRetry} style={styles.status} accessibilityRole="button">
        <Text style={type.body}>Couldn’t reach Google Books. Tap to retry.</Text>
      </Pressable>
    );
  if (!isActive)
    return (
      <Text style={[type.body, styles.status]}>Search a book by title or author to get started.</Text>
    );
  return <Text style={[type.body, styles.status]}>No books found.</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  status: { paddingVertical: spacing.xl, textAlign: 'center' },
  footer: { paddingVertical: spacing.md },
});
