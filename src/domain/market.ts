/**
 * ДОМЕН: рыночные типы и свеча (не привязано к REST).
 */
export type MarketType = 'spot' | 'futures';

export interface Candle {
  timestamp: number; // ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface InstrumentKey {
  exchange: string; // 'binance'
  marketType: MarketType; // 'spot' | 'futures'
  symbol: string; // 'BTCUSDT'
  timeframe: string; // '1h' | '5m' | ...
}
