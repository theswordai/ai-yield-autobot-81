import { ModelStatus } from './modelConfig';

export interface NAVPoint {
  ts: number;
  nav: number;
}

export interface ModelEvent {
  ts: number;
  type: 'rebalance' | 'entry' | 'exit' | 'adjustment';
  message: string;
}

export interface ModelState {
  id: string;
  navSeries: NAVPoint[];
  events: ModelEvent[];
  currentNav: number;
  status: ModelStatus;
  lastUpdate: number;
  // Derived metrics (calculated on demand)
  pnlTotalPct?: number;
  pnlDailyPct?: number;
  apy7d?: number;
  return30d?: number;
  volatility30d?: number;
  maxDrawdown?: number;
  winRate?: number;
  tradeCount?: number;
}

export interface AllModelsState {
  models: Record<string, ModelState>;
  lastGlobalUpdate: number;
}
