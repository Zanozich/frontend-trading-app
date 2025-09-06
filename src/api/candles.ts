/**
 * Клиент для работы со свечами (`GET /candles`) с ЖЕСТКОЙ нормализацией типов.
 *
 * Что делаем сверх обычного:
 * 1) Поддерживаем разные формы ответа: [ ... ] | { candles } | { rows }.
 * 2) Нормализуем ВСЕ числовые поля через Number(...).
 * 3) Время берём из c.timestamp ИЛИ c.time ИЛИ c.ts, а если пришла ISO-строка — парсим Date.parse(...).
 * 4) Сортируем ASC.
 * 5) Печатаем "shape" первых 2 строк, чтобы быстро видеть фактический формат (можно потом убрать).
 */

import { api } from './client';
import { DEFAULT_INCLUDE_PARTIAL_LATEST } from '@/config/constants';
import type { CandlesPageParams, CandlesPage } from '@/api/dto/dto';

// ── утилита: привести любое значение времени к ms:number
function toMs(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    // чистые цифры → Number
    if (/^\d+$/.test(v)) return Number(v);
    // ISO-дата → Date.parse
    const t = Date.parse(v);
    return Number.isNaN(t) ? undefined : t;
  }
  return undefined;
}

export async function fetchCandlesPage(
  p: CandlesPageParams
): Promise<CandlesPage> {
  // 1) Собираем query-параметры
  const params = {
    exchange: p.exchange,
    marketType: p.marketType,
    symbol: p.symbol,
    timeframe: p.timeframe,
    limit: p.limit,
    from: p.from,
    to: p.to,
    includePartialLatest:
      p.includePartialLatest ?? DEFAULT_INCLUDE_PARTIAL_LATEST,
  };

  // 2) Запрос
  const { data } = await api.get('/candles', { params });

  // 3) Достаём массив независимо от формы
  const raw: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.candles)
    ? (data as any).candles
    : Array.isArray((data as any)?.rows)
    ? (data as any).rows
    : [];

  // 4) ЛЁГКАЯ ТЕЛЕМЕТРИЯ формата (первые 2 строки)
  if (raw.length) {
    const a = raw[0],
      b = raw[1];
    // eslint-disable-next-line no-console
    console.debug('[candles] sample#1', a);
    // eslint-disable-next-line no-console
    console.debug('[candles] sample#2', b);
  } else {
    // eslint-disable-next-line no-console
    console.debug('[candles] empty array');
  }

  // 5) Нормализация полей
  const normalized = raw.map((c) => {
    // время может называться timestamp | time | ts
    const ts = toMs(c?.timestamp ?? c?.time ?? c?.ts);
    return {
      timestamp: ts as number, // допустим undefined → станет NaN при Number(...) ниже — отфильтруем
      open: Number(c?.open),
      high: Number(c?.high),
      low: Number(c?.low),
      close: Number(c?.close),
      volume: Number(c?.volume),
    };
  });

  // 6) Убираем явно битые строки (NaN timestamp или отсутствуют цены/объем)
  const sane = normalized.filter(
    (c) =>
      Number.isFinite(c.timestamp) &&
      Number.isFinite(c.open) &&
      Number.isFinite(c.high) &&
      Number.isFinite(c.low) &&
      Number.isFinite(c.close) &&
      Number.isFinite(c.volume)
  );

  // 7) ASC
  sane.sort((a, b) => a.timestamp - b.timestamp);

  // 8) Границы
  const oldestTs = sane[0]?.timestamp;
  const newestTs = sane.length ? sane[sane.length - 1]?.timestamp : undefined;

  return { candles: sane, oldestTs, newestTs };
}
