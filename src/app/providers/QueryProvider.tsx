/**
 * QueryProvider — корневой провайдер кэша серверных данных (React Query).
 *
 * Назначение:
 * - Дедупликация сетевых запросов, кэширование, отмена, ретраи.
 * - Единые "политики" свежести/очистки кэша для всего приложения.
 *
 * Использование:
 * 1) Оборачиваем всё приложение в <QueryProvider> (см. App.tsx).
 * 2) Внутри компонентов используем useQuery/useInfiniteQuery.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useMemo } from 'react';
import { STALE_TIME_MS, GC_TIME_MS } from '@/config/constants';

export default function QueryProvider({ children }: PropsWithChildren) {
  // 1) Создаём QueryClient один раз
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME_MS, // из констант
            gcTime: GC_TIME_MS, // из констант
            retry: 2,
          },
        },
      }),
    []
  );

  // 2) Оборачиваем потомков провайдером
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
