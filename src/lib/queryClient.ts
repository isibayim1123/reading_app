import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - data is fresh for 2 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes - cache persists for 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when network reconnects
      // refetchOnMount defaults to true, which means it refetches stale data on mount
    },
  },
});
