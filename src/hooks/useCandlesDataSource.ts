/**
 * useCandlesDataSource — источник данных свечей с постраничной "ленивой" подгрузкой влево.
 *
 * Цель файла:
 * - Дать графику единый плоский массив свечей (ASC), флаги загрузки и функцию догрузки.
 * - Совместить твою текущую реализацию с расширяемостью: допускаем override параметров.
 *
 * Идея:
 * - Первая страница: to = undefined → правый край (до последней закрытой/partial).
 * - Следующие страницы: берём ещё левее → to = oldestTs - 1 (полуоткрытый интервал).
 * - Размер страницы управляется константой PAGE_SIZE.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCandlesPage } from '@/api/candles';
import { useSelection } from '@/state/selectionStore';
import {
  DEFAULT_INCLUDE_PARTIAL_LATEST,
  PAGE_SIZE,
  STALE_TIME_MS,
  GC_TIME_MS,
} from '@/config/constants';
import type { MarketType } from '@/state/selectionStore';
import type { Candle } from '@/domain/market';

/** Переопределения: можно передать конкретные поля, иначе берём из стора. */
type Overrides = Partial<{
  exchange: string;
  marketType: MarketType;
  symbol: string;
  timeframe: string;
}>;

export function useCandlesDataSource(over?: Overrides) {
  // 1) Берём дефолты из стора + применяем переопределения (если заданы).
  const sel = useSelection();
  const exchange = over?.exchange ?? sel.exchange;
  const marketType = over?.marketType ?? sel.marketType;
  const symbol = over?.symbol ?? sel.symbol;
  const timeframe = over?.timeframe ?? sel.timeframe;

  // 2) Настраиваем «бесконечный» запрос (страницы влево).
  const q = useInfiniteQuery({
    // 2.1) Ключ кэша → смена инструмента/ТФ полностью сбрасывает кеш.
    queryKey: ['candles', exchange, marketType, symbol, timeframe, PAGE_SIZE],

    // 2.2) Функция запроса: pageParam — правая граница (исключительно) для конкретной страницы.
    async queryFn({ pageParam }) {
      return fetchCandlesPage({
        exchange,
        marketType,
        symbol,
        timeframe,
        limit: PAGE_SIZE,
        to: pageParam as number | undefined, // undefined на первой странице
        includePartialLatest: DEFAULT_INCLUDE_PARTIAL_LATEST,
      });
    },

    // 2.3) Следующая страница: берём oldestTs и отнимаем 1мс (сохраняем твою семантику).
    getNextPageParam(lastPage) {
      return lastPage.oldestTs ? lastPage.oldestTs - 1 : undefined;
    },

    // 2.4) Начальный pageParam.
    initialPageParam: undefined as number | undefined,

    // 2.5) Политика кэширования/обновления.
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // 3) Склеиваем страницы в один массив свечей (они уже в ASC).
  const candles: Candle[] = (q.data?.pages ?? []).flatMap((p) => p.candles);

  // 4) Публичный интерфейс.
  return {
    candles, // плоский ASC-массив
    isLoading: q.isLoading, // первичная загрузка
    isFetching: q.isFetching, // любые фоновые fetch-и (включая догрузку)
    loadMore: q.fetchNextPage, // подгрузить левее
    hasMore: !!q.hasNextPage, // есть ли ещё страницы
    refetch: q.refetch, // пересвежить текущий ключ
  };
}
