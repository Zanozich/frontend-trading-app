/**
 * Глобальный стор выбора инструмента c persist (localStorage).
 *
 * Зачем:
 * 1) Даем безопасные дефолты, чтобы первый рендер не бил 400 на /symbols.
 * 2) Сохраняем выбор между перезагрузками.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MarketType = 'spot' | 'futures';

interface SelectionState {
  exchange: string;
  marketType: MarketType;
  symbol: string;
  timeframe: string;
  setExchange: (v: string) => void;
  setMarketType: (v: MarketType) => void;
  setSymbol: (v: string) => void;
  setTimeframe: (v: string) => void;
}

export const useSelection = create<SelectionState>()(
  persist(
    (set) => ({
      // 1) безопасные дефолты
      exchange: 'binance',
      marketType: 'spot',
      symbol: 'BTCUSDT',
      timeframe: '1h',

      // 2) сеттеры
      setExchange: (v) => set({ exchange: v }),
      setMarketType: (v) => set({ marketType: v }),
      setSymbol: (v) => set({ symbol: v }),
      setTimeframe: (v) => set({ timeframe: v }),
    }),
    {
      name: 'selection-store', // ключ в localStorage
      version: 1,
    }
  )
);
