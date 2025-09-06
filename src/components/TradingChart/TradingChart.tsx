/**
 * TradingChart — страница с панелью и графиком (стрелочная версия).
 *
 * Цель файла:
 * - Отрисовать TradingControls и ChartContainer.
 * - Брать symbol/timeframe из Zustand; фон страницы — тёмный.
 */

import React from 'react';
import TradingControls from '@/components/TradingControls';
import { ChartContainer } from './ChartContainer';
import { useSelection } from '@/state/selectionStore';

const TradingChart: React.FC = () => {
  // 1) читаем текущий выбор из стора
  const { symbol, timeframe } = useSelection();

  // 2) панель + график
  return (
    <div className='min-h-screen bg-neutral-950 text-neutral-100'>
      <TradingControls />
      <div className='mx-auto max-w-screen-2xl px-4'>
        <ChartContainer symbol={symbol} timeframe={timeframe} />
      </div>
    </div>
  );
};

export default TradingChart;
