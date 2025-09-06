/**
 * API DTO: типы параметров и ответов для вызовов REST.
 * - CandlesPageParams — параметры запроса /candles.
 * - CandlesPage — страница свечей (ASC) + удобные границы.
 */
import type { Candle, InstrumentKey } from '@/domain/market';

/** Параметры запроса страницы свечей. */
export interface CandlesPageParams extends InstrumentKey {
  limit: number; // сколько баров запрашиваем (PAGE_SIZE)
  from?: number; // левая граница (ms, включительно) — опционально
  to?: number; // правая граница (ms, исключительно) — опционально
  includePartialLatest?: boolean; // включать ли «живую» свечу в ответ (только для UI)
}

/** Результат запроса страницы свечей. */
export interface CandlesPage {
  candles: Candle[]; // массив свечей ASC
  oldestTs?: number; // удобная левая граница (ms)
  newestTs?: number; // удобная правая граница (ms)
}

/** Строка символа в /symbols. */
export interface SymbolRow {
  id: number;
  name: string;
  type: string; // 'spot' | 'futures'
  exchange: string; // 'binance' | ...
}
