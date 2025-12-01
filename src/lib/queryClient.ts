import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid performance issues
      refetchOnMount: true, // Refetch on mount only if data is stale
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});
