import { QueryClient } from '@tanstack/react-query';

/** Shared React Query client (ARCHITECTURE §1: React Query + Supabase JS). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
