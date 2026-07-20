import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from './useDebouncedValue';
import { canonicalize, PAGE_SIZE, searchVolumes, type BookVolume } from '../lib/googleBooks';

const MIN_QUERY_LENGTH = 2;

/**
 * Debounced, paginated Google Books search. Returns canonical works (D5 — one
 * entry per book) flattened across all loaded pages.
 */
export function useBookSearch(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 350);
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const q = useInfiniteQuery({
    queryKey: ['bookSearch', query],
    enabled,
    queryFn: ({ pageParam }) => searchVolumes(query, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.volumes.length, 0);
      const next = allPages.length * PAGE_SIZE;
      return loaded < lastPage.totalItems ? next : undefined;
    },
  });

  const results: BookVolume[] = useMemo(
    () => canonicalize((q.data?.pages ?? []).flatMap((p) => p.volumes)),
    [q.data],
  );

  return {
    results,
    isLoading: q.isLoading && enabled,
    isError: q.isError,
    refetch: q.refetch,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    /** True once a query is long enough to have run. */
    isActive: enabled,
  };
}
