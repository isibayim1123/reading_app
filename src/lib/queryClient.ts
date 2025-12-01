import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - balance between freshness and performance
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid freezing
      refetchOnMount: false, // Don't automatically refetch on mount
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});
