// src/api.ts
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchCandles(): Promise<Candle[]> {
  const res = await fetch('http://localhost:3000/candles');
  if (!res.ok) throw new Error('Failed to fetch candles');
  return await res.json();
}
