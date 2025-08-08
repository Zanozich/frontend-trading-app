import { Candle } from '../types/candle';

export async function fetchCandles(
  symbol: string,
  timeframe: string
): Promise<Candle[]> {
  const params = new URLSearchParams({ symbol, timeframe });
  const res = await fetch(`http://localhost:3000/candles?${params}`);
  if (!res.ok) throw new Error('Failed to fetch candles');
  return await res.json();
}
