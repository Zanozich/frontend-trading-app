/**
 * Типы, специфичные для отрисовки графика (lightweight-charts).
 *
 * Назначение:
 * - Отделить доменную свечу (domain/Candle с timestamp в миллисекундах)
 *   от свечи графика (ChartCandle с time в секундах).
 * - Избежать конфликтов имён и дублирования типов по всему проекту.
 *
 * Примечание:
 * - "Источник истины" для рынка — src/domain/market.ts (Candle с timestamp(ms)).
 * - Здесь — только представление для библиотеки графика.
 */

import type { UTCTimestamp } from 'lightweight-charts';

export type ChartCandle = {
  time: UTCTimestamp; // секунды Unix
  open: number;
  high: number;
  low: number;
  close: number;
};

export type ChartVolume = {
  time: UTCTimestamp; // секунды Unix
  value: number; // объём
};
