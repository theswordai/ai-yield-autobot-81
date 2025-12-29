export interface PriceTick {
  symbol: string;
  last: number;
  ts: number;
  change24h?: number;
}

export interface PriceState {
  ticks: Record<string, PriceTick>;
  history: PriceTick[];
  connectionStatus: 'connecting' | 'connected' | 'degraded' | 'disconnected';
  dataSource: 'binance-ws' | 'coingecko-rest' | 'none';
}

export type PriceCallback = (tick: PriceTick) => void;
export type StatusCallback = (status: PriceState['connectionStatus'], source: PriceState['dataSource']) => void;
