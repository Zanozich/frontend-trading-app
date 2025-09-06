/**
 * Адаптер доменных свечей => данные для lightweight-charts.
 *
 * Что делает:
 * 1) Берёт массив доменных Candle { timestamp(ms), ohlc, volume }.
 * 2) Конвертирует timestamp в секунды (UTCTimestamp).
 * 3) Возвращает два массива: для свечной серии и для объёмов.
 *
 * Почему отдельно:
 * - Локализуем конвертацию времени в одном месте.
 * - Упрощаем тестирование и повторное использование.
 */

import type { Candle } from '@/domain/market';
import type { ChartCandle, ChartVolume } from './types';

export function mapCandlesToChart(candles: Candle[]): {
  candles: ChartCandle[];
  volumes: ChartVolume[];
} {
  // 1) Мапим каждый доменный объект Candle в формат графика
  const candleSeries: ChartCandle[] = candles.map((c) => ({
    time: (c.timestamp / 1000) as any, // UTCTimestamp по сигнатуре
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));

  // 2) Объёмы — отдельная серия
  const volumeSeries: ChartVolume[] = candles.map((c) => ({
    time: (c.timestamp / 1000) as any,
    value: c.volume,
  }));

  // 3) Возвращаем оба набора
  return { candles: candleSeries, volumes: volumeSeries };
}
