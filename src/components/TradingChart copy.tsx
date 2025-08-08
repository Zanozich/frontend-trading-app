import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  UTCTimestamp,
} from 'lightweight-charts';

const TradingChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#000000' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#485c7b' },
      timeScale: { borderColor: '#485c7b', timeVisible: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const data = [
      {
        time: 1710000000 as UTCTimestamp,
        open: 30000,
        high: 30500,
        low: 29500,
        close: 30200,
      },
      {
        time: 1710003600 as UTCTimestamp,
        open: 30200,
        high: 31000,
        low: 30100,
        close: 30800,
      },
      {
        time: 1710007200 as UTCTimestamp,
        open: 30800,
        high: 31500,
        low: 30500,
        close: 31200,
      },
      {
        time: 1710010800 as UTCTimestamp,
        open: 31200,
        high: 32000,
        low: 31000,
        close: 31800,
      },
      {
        time: 1710014400 as UTCTimestamp,
        open: 31800,
        high: 32200,
        low: 31600,
        close: 31950,
      },
    ];

    candleSeries.setData(data);

    return () => chart.remove();
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '400px' }} />;
};

export default TradingChart;
