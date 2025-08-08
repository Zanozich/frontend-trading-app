import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type CandlestickData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { fetchCandles } from '../../api/fetchCandles';
import { addVolumeSeries } from './VolumeSeries';

interface ChartContainerProps {
  symbol: string;
  timeframe: string;
}

/**
 * Обёртка для инициализации графика и рендеринга свечей.
 * Управляет: chart instance, data fetching, responsive resize.
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  timeframe,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 🔧 Создание графика
    const chart = createChart(containerRef.current, {
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
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    // 📊 Добавление свечной серии
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // ⏬ Загрузка данных
    fetchCandles(symbol, timeframe).then((data) => {
      const formatted: CandlestickData[] = data
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
        .sort((a, b) => a.time - b.time);

      candleSeries.setData(formatted);
      const volumeSeries = addVolumeSeries(chart);

      // 🧮 Преобразуем и устанавливаем объём
      const volumeData = data.map((candle) => ({
        time: candle.time as UTCTimestamp,
        value: candle.volume,
        color: candle.close > candle.open ? '#26a69a' : '#ef5350',
      }));

      volumeSeries.setData(volumeData);
    });

    // 📏 Автоматическое масштабирование при изменении размеров
    resizeObserver.current = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    });

    resizeObserver.current.observe(containerRef.current);

    // 🧹 Очистка
    return () => {
      resizeObserver.current?.disconnect();
      chart.remove();
    };
  }, [symbol, timeframe]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '90vh', // Автоматическая адаптация под окно
      }}
    />
  );
};
