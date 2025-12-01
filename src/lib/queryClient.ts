import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds (shorter to avoid stale data)
      gcTime: 1000 * 60 * 5, // 5 minutes (shorter garbage collection)
      retry: 1,
      refetchOnWindowFocus: true, // Refetch on window focus to ensure fresh data
      refetchOnMount: true, // Always refetch on mount
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});
