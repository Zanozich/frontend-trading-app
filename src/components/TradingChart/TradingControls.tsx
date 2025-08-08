import React from 'react';
import {
  AVAILABLE_SYMBOLS,
  AVAILABLE_TIMEFRAMES,
} from '../../constants/tradingOptions';

interface Props {
  selectedSymbol: string;
  selectedTimeframe: string;
  onSymbolChange: (value: string) => void;
  onTimeframeChange: (value: string) => void;
}

/**
 * Компонент выбора торговой пары и таймфрейма
 */
export const TradingControls: React.FC<Props> = ({
  selectedSymbol,
  selectedTimeframe,
  onSymbolChange,
  onTimeframeChange,
}) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      {/* 🔽 Выпадающий список для выбора символа */}
      <select
        value={selectedSymbol}
        onChange={(e) => onSymbolChange(e.target.value)}
      >
        {AVAILABLE_SYMBOLS.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>

      {/* 🔽 Выпадающий список для выбора таймфрейма */}
      <select
        value={selectedTimeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
      >
        {AVAILABLE_TIMEFRAMES.map((tf) => (
          <option key={tf} value={tf}>
            {tf}
          </option>
        ))}
      </select>
    </div>
  );
};
