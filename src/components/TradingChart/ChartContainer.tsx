/**
 * ChartContainer — рендер свечного графика + ленивый скролл влево.
 *
 * Цель файла:
 * - Инициализировать график, подключить серии (цена/объём), подписаться на ресайз.
 * - Загружать данные пачками через useCandlesDataSource и отрисовывать их.
 * - При приближении к левому краю — автоматически догружать старшие бары.
 *
 * Примечание:
 * - Пропсы symbol/timeframe оставляем (совместимость), но exchange/marketType берём из стора.
 * - Для наглядности оставлены короткие dev-логи.
 */

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import { addVolumeSeries } from './VolumeSeries';
import { useSelection } from '@/state/selectionStore';
import { useCandlesDataSource } from '@/hooks/useCandlesDataSource';
import { dlog } from '@/utils/devlog';

interface ChartContainerProps {
  symbol: string;
  timeframe: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  timeframe,
}) => {
  // 1) ссылки на DOM и серии
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // 2) общий выбор (биржа/тип) — из стора
  const { exchange, marketType } = useSelection();

  // 3) источник свечей: подмешиваем актуальные symbol/timeframe из пропсов (совместимость)
  const { candles, loadMore, isFetching, hasMore } = useCandlesDataSource({
    symbol,
    timeframe,
  });

  // 4) утилита: ms → sec (UTCTimestamp)
  const toSec = (ms: number) => (ms / 1000) as UTCTimestamp;

  useEffect(() => {
    if (!containerRef.current) return;

    // 1) создаём график
    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#000000' }, textColor: '#ffffff' },
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

    // 2) подключаем свечную серию
    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // 3) подключаем серию объёма
    volumeSeriesRef.current = addVolumeSeries(chart);

    // 4) подписываемся на ресайз
    resizeObserver.current = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });
    resizeObserver.current.observe(containerRef.current);

    // 5) подписка на сдвиг видимого диапазона: если подошли к левому краю — догружаем
    const onRange = () => {
      if (!chartRef.current) return;
      const vr = chartRef.current.timeScale().getVisibleRange();
      if (!vr) return;

      // 1) берём левую видимую границу и самый левый бар в данных
      const left = Number(vr.from as Time);
      const firstMs = candles[0]?.timestamp;
      if (!firstMs) return;

      // 2) переводим в секунды и оценим шаг
      const firstSec = Math.floor(firstMs / 1000);
      const stepSec =
        candles.length > 1
          ? Math.max(
              1,
              Math.round((candles[1].timestamp - candles[0].timestamp) / 1000)
            )
          : 60;

      // 3) если подошли близко (<= 10 шагов) — догружаем слева
      const threshold = firstSec + stepSec * 10;
      if (left <= threshold && hasMore && !isFetching) {
        dlog('chart', 'near left edge → load more', {
          left,
          firstSec,
          stepSec,
        });
        loadMore();
      }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(onRange);

    // 6) очистка
    return () => {
      chart.timeScale().unsubscribeVisibleTimeRangeChange(onRange);
      resizeObserver.current?.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
    // создаём один раз (серии/подписки не пересоздаём лишний раз)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 1) защитные проверки
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    // 2) пустой набор → очищаем серии
    if (!candles.length) {
      candleSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
      return;
    }

    // 3) конвертируем к форматам lws
    const priceData: CandlestickData[] = candles.map((c) => ({
      time: toSec(c.timestamp),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const volumeData = candles.map((c) => ({
      time: toSec(c.timestamp),
      value: c.volume,
      color: c.close >= c.open ? '#26a69a' : '#ef5350',
    }));

    // 4) применяем и устанавливаем видимый диапазон, если нужно
    candleSeriesRef.current.setData(priceData);
    volumeSeriesRef.current.setData(volumeData);

    if (priceData.length) {
      const from = priceData[0].time as UTCTimestamp;
      const to = priceData[priceData.length - 1].time as UTCTimestamp;
      chartRef.current?.timeScale().setVisibleRange({ from, to });
    }
  }, [candles]);

  useEffect(() => {
    // 1) просто лог: сменился инструмент/ТФ (контекст запроса)
    dlog('chart', 'selection', { exchange, marketType, symbol, timeframe });
  }, [exchange, marketType, symbol, timeframe]);

  return (
    <div
      ref={containerRef}
      className='w-full'
      style={{ height: '90vh', position: 'relative' }}
    />
  );
};
