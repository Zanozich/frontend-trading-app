/**
 * Селектор таймфрейма (dropdown).
 *
 * Цель файла:
 * - Загрузить список таймфреймов (`GET /timeframes`) и показать выпадающий список.
 * - По выбору — обновлять глобальный стор (Zustand), чтобы график перестраивался.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTimeframes } from '@/api/meta';
import { useSelection } from '@/state/selectionStore';

const TimeframeSelect: React.FC = () => {
  // 1) берём текущее значение и сеттер из стора
  const { timeframe, setTimeframe } = useSelection();

  // 2) грузим список таймфреймов (кэширует react-query)
  const {
    data: tfs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['timeframes'],
    queryFn: fetchTimeframes,
    staleTime: 5 * 60_000,
  });

  // 3) рендер выпадающего списка
  return (
    <div className='flex items-center gap-2'>
      {/* 1) dropdown таймфреймов */}
      <select
        className='bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100'
        value={timeframe}
        onChange={(e) => {
          // (1) пишем новое значение
          setTimeframe(e.target.value);
        }}
        // не отключаем полностью — иначе «не кликается»
        aria-label='Select timeframe'
      >
        {/* плейсхолдер, если загрузка ещё идёт */}
        {isLoading && <option value={timeframe}>loading…</option>}

        {!isLoading &&
          tfs.map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}

        {!isLoading && !tfs.length && (
          <option value={timeframe}>no timeframes</option>
        )}
      </select>

      {/* 2) мягкая ошибка */}
      {isError && (
        <span className='text-xs text-red-400'>
          {(error as Error)?.message}
        </span>
      )}
    </div>
  );
};

export default TimeframeSelect;
