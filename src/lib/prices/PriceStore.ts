import { PriceTick, PriceState } from './types';

const STORAGE_KEY = 'usd_online_price_store';
const MAX_HISTORY = 1000;

interface StoredPriceData {
  ticks: Record<string, PriceTick>;
  history: PriceTick[];
  lastUpdate: number;
}

export class PriceStore {
  private state: PriceState;
  private listeners: Set<(state: PriceState) => void> = new Set();

  constructor() {
    const stored = this.loadFromStorage();
    this.state = {
      ticks: stored?.ticks || {},
      history: stored?.history || [],
      connectionStatus: 'disconnected',
      dataSource: 'none',
    };
  }

  private loadFromStorage(): StoredPriceData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Only use data from last 24 hours
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (parsed.lastUpdate > dayAgo) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[PriceStore] Load error:', e);
    }
    return null;
  }

  private saveToStorage(): void {
    try {
      const data: StoredPriceData = {
        ticks: this.state.ticks,
        history: this.state.history.slice(-MAX_HISTORY),
        lastUpdate: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[PriceStore] Save error:', e);
    }
  }

  updateTick(tick: PriceTick): void {
    const existingTick = this.state.ticks[tick.symbol];
    
    // Preserve 24h change if new tick doesn't have it
    if (!tick.change24h && existingTick?.change24h) {
      tick.change24h = existingTick.change24h;
    }
    
    this.state.ticks[tick.symbol] = tick;
    this.state.history.push(tick);
    
    // Trim history
    if (this.state.history.length > MAX_HISTORY) {
      this.state.history = this.state.history.slice(-MAX_HISTORY);
    }
    
    this.saveToStorage();
    this.notifyListeners();
  }

  updateStatus(status: PriceState['connectionStatus'], source: PriceState['dataSource']): void {
    this.state.connectionStatus = status;
    this.state.dataSource = source;
    this.notifyListeners();
  }

  getState(): PriceState {
    return { ...this.state };
  }

  getTick(symbol: string): PriceTick | undefined {
    return this.state.ticks[symbol];
  }

  getAllTicks(): Record<string, PriceTick> {
    return { ...this.state.ticks };
  }

  getHistoryForSymbol(symbol: string, limit = 100): PriceTick[] {
    return this.state.history
      .filter(t => t.symbol === symbol)
      .slice(-limit);
  }

  subscribe(listener: (state: PriceState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

// Singleton instance
export const priceStore = new PriceStore();
