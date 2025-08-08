import React, { useState } from 'react';
import { TradingControls } from './TradingControls';
import { ChartContainer } from './ChartContainer';

const TradingChart: React.FC = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');

  return (
    <>
      <TradingControls
        selectedSymbol={symbol}
        selectedTimeframe={timeframe}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
      />
      <ChartContainer symbol={symbol} timeframe={timeframe} />
    </>
  );
};

export default TradingChart;
