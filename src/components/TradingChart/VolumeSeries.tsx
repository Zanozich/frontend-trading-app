import { HistogramSeries, IChartApi, ISeriesApi } from 'lightweight-charts';

/**
 * Добавляет объём над основным графиком как overlay (на той же панели).
 */
export function addVolumeSeries(chart: IChartApi): ISeriesApi<'Histogram'> {
  const volumeSeries = chart.addSeries(
    HistogramSeries,
    {
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
      color: '#26a69a',
    },
    1
  );

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.7,
      bottom: 0,
    },
  });

  return volumeSeries;
}
