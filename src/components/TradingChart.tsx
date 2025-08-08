import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  UTCTimestamp,
  type IChartApi,
  type CandlestickData,
} from 'lightweight-charts';
import { fetchCandles } from '../api';

const TradingChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    fetchCandles().then((data) => {
      const formatted = data
        .filter(
          (candle) =>
            candle &&
            candle.time &&
            candle.open != null &&
            candle.high != null &&
            candle.low != null &&
            candle.close != null
        )
        .map((candle) => ({
          time: candle.time as UTCTimestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }))
        .sort((a, b) => a.time - b.time); // сортировка по времени

      candleSeries.setData(formatted);
    });

    return () => chart.remove();
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '400px' }} />;
};

export default TradingChart;
