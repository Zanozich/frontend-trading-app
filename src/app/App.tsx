/**
 * App — корневой layout приложения.
 *
 * Что делает:
 * 1) Оборачивает всё в QueryProvider (включает React Query кэш).
 * 2) Рендерит шапку с контролами выбора инструмента/ТФ.
 * 3) Рендерит основной экран с графиком.
 *
 * Примечание:
 * - Пока у нас один экран (Chart). Router добавим позже, когда появятся backtest/strategies/stats.
 */

import QueryProvider from './providers/QueryProvider';
import TradingChart from '@/components/TradingChart/TradingChart';
import InstrumentSelect from '@/components/Controls/InstrumentSelect';
import TimeframeSelect from '@/components/Controls/TimeframeSelect';

export default function App() {
  // 1) Оборачиваем весь UI в QueryProvider — теперь useQuery/useInfiniteQuery готовы к работе
  return (
    <QueryProvider>
      {/* 2) Базовый каркас — тёмная тема и панель управления */}
      <div className='min-h-screen bg-neutral-950 text-neutral-100'>
        <header className='border-b border-neutral-800'>
          <div className='mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-3 items-center'>
            <div className='text-lg font-semibold'>Crypto Analytics</div>
            <div className='flex gap-2 ml-auto'></div>
          </div>
        </header>
        <main className='mx-auto max-w-7xl px-4 py-4'>
          <TradingChart />
        </main>
      </div>
    </QueryProvider>
  );
}
