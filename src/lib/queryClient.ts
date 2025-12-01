import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale - fetch fresh on mount
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid performance issues
      refetchOnMount: true, // Always fetch fresh data on mount
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});
