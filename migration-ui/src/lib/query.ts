import { QueryClient } from '@tanstack/react-query';
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 0, retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
