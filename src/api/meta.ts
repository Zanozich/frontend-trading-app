/**
 * Метаданные рынка (контроллеры META):
 *
 * - GET /exchanges  -> string[]
 * - GET /timeframes -> string[]
 * - GET /symbols    -> SymbolRow[] (фильтры: exchange?, marketType?, q?, limit?, offset?, activeOnly?)
 *
 * Важно:
 * - Бэкенд может вернуть: [] | {items} | {rows} | {data} | {symbols} | {list} | {result} | {obj}.
 * - Ниже «железобетонная» нормализация форматов + отладочные логи формы.
 */

import { api } from './client';
import { dlog } from '@/utils/devlog';

export interface SymbolRow {
  id: number;
  name: string; // 'BTCUSDT'
  type: string; // 'spot' | 'futures'
  exchange: string; // 'binance' | ...
}

/** Получить список бирж. */
export async function fetchExchanges(): Promise<string[]> {
  // 1) GET /exchanges
  const { data } = await api.get('/exchanges');

  // 2) Если пришёл массив строк — вернём как есть
  if (
    Array.isArray(data) &&
    (data.length === 0 || typeof data[0] === 'string')
  ) {
    return data as string[];
  }

  // 3) Если пришёл массив объектов {code,name} — вернём массив code
  if (Array.isArray(data) && data.length && typeof data[0] === 'object') {
    return (data as any[])
      .map((x) => (x && typeof x.code === 'string' ? x.code : null))
      .filter(Boolean);
  }

  // 4) На всякий случай — пустой массив
  return [];
}

/** Получить список таймфреймов. */
export async function fetchTimeframes(): Promise<string[]> {
  const { data } = await api.get('/timeframes');
  return Array.isArray(data) ? data : [];
}

/**
 * Получить список символов с опциональными фильтрами.
 *
 * Шаги:
 * 1) Собираем query-параметры с дефолтами (limit/offset) и гарантируем exchange/marketType.
 * 2) GET /symbols.
 * 3) Поддерживаем форматы ответа: {items:string[]} | string[].
 * 4) Строим SymbolRow[]: добавляем exchange/marketType из параметров запроса.
 */
export async function fetchSymbols(params?: {
  exchange?: string;
  marketType?: string;
  q?: string;
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
}): Promise<SymbolRow[]> {
  // 1) Параметры с дефолтами + защита от пустых строк
  const p = {
    exchange: params?.exchange || 'binance',
    marketType: params?.marketType || 'spot',
    q: params?.q || undefined,
    limit: params?.limit ?? 1000,
    offset: params?.offset ?? 0,
    activeOnly: params?.activeOnly,
  };

  // 2) Запрос
  const { data } = await api.get('/symbols', { params: p });

  // 3) Достаём массив имён символов из возможных обёрток
  let arr: unknown = (data as any)?.items ?? data;
  const names: string[] = Array.isArray(arr)
    ? (arr as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  // 4) Строим SymbolRow[] (id — индекс, exchange/type — из параметров)
  const out: SymbolRow[] = names.map((name, idx) => ({
    id: idx,
    name,
    exchange: p.exchange!,
    type: p.marketType!,
  }));

  // 5) Отладочный лог формы
  dlog('api/symbols', 'normalized', { count: out.length, sample: out[0] });

  return out;
}
