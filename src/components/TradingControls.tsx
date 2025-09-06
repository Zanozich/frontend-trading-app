/**
 * TradingControls — единая панель управления (dropdown + dropdown).
 *
 * Цель файла:
 * - Показать два выпадающих селектора: инструмент и таймфрейм.
 * - Избавиться от дублей старых контролов и «плиток».
 */

import InstrumentSelect from '@/components/Controls/InstrumentSelect';
import TimeframeSelect from '@/components/Controls/TimeframeSelect';

const TradingControls: React.FC = () => {
  // 1) возвращаем аккуратную липкую панель с тёмным фоном
  return (
    <div className='w-full sticky top-0 z-10 backdrop-blur bg-neutral-950/80 border-b border-neutral-800'>
      <div className='mx-auto max-w-screen-2xl px-4 py-2'>
        <div className='flex items-center gap-3'>
          <InstrumentSelect />
          <TimeframeSelect />
        </div>
      </div>
    </div>
  );
};

export default TradingControls;
