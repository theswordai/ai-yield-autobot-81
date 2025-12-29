import { ModelConfig, MODEL_CONFIGS, ModelStatus } from './modelConfig';
import { ModelState, NAVPoint, ModelEvent, AllModelsState } from './types';
import { PriceTick } from '../prices/types';

const STORAGE_KEY = 'usd_online_models_store';
const MAX_NAV_POINTS = 10000; // ~14 hours at 5s intervals
const TICK_INTERVAL = 5000; // 5 seconds

// Event message templates
const EVENT_MESSAGES = {
  rebalance: [
    'Portfolio rebalanced for optimal allocation',
    'Dynamic weight adjustment completed',
    'Cross-chain liquidity rebalanced',
  ],
  entry: [
    'New position opened on trend signal',
    'Alpha opportunity detected - entering position',
    'Long entry executed on breakout',
  ],
  exit: [
    'Position closed at target profit',
    'Stop-loss triggered - position exited',
    'Profit taking - partial exit',
  ],
  adjustment: [
    'Risk parameters adjusted',
    'Leverage optimized based on volatility',
    'Correlation hedge applied',
  ],
};

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class ModelSimulator {
  private state: AllModelsState;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(state: AllModelsState) => void> = new Set();
  private lastPrices: Record<string, number> = {};
  private priceReturns: number[] = [];

  constructor() {
    this.state = this.loadFromStorage() || this.initializeState();
  }

  private initializeState(): AllModelsState {
    const models: Record<string, ModelState> = {};
    const now = Date.now();

    MODEL_CONFIGS.forEach(config => {
      // Generate initial history (last 24 hours at 5-minute intervals)
      const navSeries: NAVPoint[] = [];
      const events: ModelEvent[] = [];
      let nav = 1.0;
      
      // Generate 288 points (24 hours * 12 per hour)
      const pointCount = 288;
      const intervalMs = 5 * 60 * 1000; // 5 minutes
      const startTime = now - pointCount * intervalMs;
      
      for (let i = 0; i < pointCount; i++) {
        const ts = startTime + i * intervalMs;
        
        // Simulate return
        const drift = config.baseDrift * (intervalMs / 86400000); // Scale to interval
        const noise = gaussianRandom() * config.volatility * Math.sqrt(intervalMs / 86400000);
        const jump = Math.random() < config.jumpProb ? (Math.random() > 0.5 ? 1 : -1) * config.jumpSize : 0;
        
        const returnPct = drift + noise + jump;
        nav = nav * (1 + returnPct);
        nav = Math.max(nav, 0.5); // Floor at 0.5
        
        navSeries.push({ ts, nav });
        
        // Random events
        if (Math.random() < 0.02) {
          const eventType = randomPick(['rebalance', 'entry', 'exit', 'adjustment'] as const);
          events.push({
            ts,
            type: eventType,
            message: randomPick(EVENT_MESSAGES[eventType]),
          });
        }
      }

      models[config.id] = {
        id: config.id,
        navSeries,
        events: events.slice(-20),
        currentNav: nav,
        status: this.determineStatus(nav, config),
        lastUpdate: now,
      };
    });

    return {
      models,
      lastGlobalUpdate: now,
    };
  }

  private determineStatus(nav: number, config: ModelConfig): ModelStatus {
    // Based on recent performance and volatility
    if (nav > 1.1) return 'ACTIVE';
    if (nav < 0.95) return 'COOLING';
    return Math.random() > 0.7 ? 'SCALING' : 'ACTIVE';
  }

  private loadFromStorage(): AllModelsState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Validate data is recent (within 7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (parsed.lastGlobalUpdate > weekAgo) {
          // Validate each model's NAV is reasonable
          let hasAbnormalData = false;
          for (const modelId of Object.keys(parsed.models)) {
            const model = parsed.models[modelId];
            // Check if NAV is in reasonable range (0.5 to 3.0)
            if (model.currentNav < 0.5 || model.currentNav > 3.0) {
              hasAbnormalData = true;
              break;
            }
          }
          
          if (hasAbnormalData) {
            console.log('[ModelSimulator] Abnormal data detected, resetting...');
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          
          return parsed;
        }
      }
    } catch (e) {
      console.error('[ModelSimulator] Load error:', e);
    }
    return null;
  }

  private saveToStorage(): void {
    try {
      // Trim NAV series before saving
      const trimmedState: AllModelsState = {
        ...this.state,
        models: Object.fromEntries(
          Object.entries(this.state.models).map(([id, model]) => [
            id,
            {
              ...model,
              navSeries: model.navSeries.slice(-MAX_NAV_POINTS),
              events: model.events.slice(-20),
            },
          ])
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedState));
    } catch (e) {
      console.error('[ModelSimulator] Save error:', e);
    }
  }

  updatePrice(tick: PriceTick): void {
    const prevPrice = this.lastPrices[tick.symbol];
    this.lastPrices[tick.symbol] = tick.last;
    
    if (prevPrice && prevPrice > 0) {
      const logReturn = Math.log(tick.last / prevPrice);
      this.priceReturns.push(logReturn);
      if (this.priceReturns.length > 100) {
        this.priceReturns.shift();
      }
    }
  }

  private getMarketReturn(): number {
    if (this.priceReturns.length === 0) return 0;
    return this.priceReturns[this.priceReturns.length - 1] || 0;
  }

  private getMarketVolatility(): number {
    if (this.priceReturns.length < 5) return 0.01;
    const mean = this.priceReturns.reduce((a, b) => a + b, 0) / this.priceReturns.length;
    const variance = this.priceReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / this.priceReturns.length;
    return Math.sqrt(variance);
  }

  private tick(): void {
    const now = Date.now();
    const marketReturn = this.getMarketReturn();

    MODEL_CONFIGS.forEach(config => {
      const model = this.state.models[config.id];
      if (!model) return;

      // Time-scaled parameters
      const dt = TICK_INTERVAL / 86400000; // Fraction of day
      
      // Calculate return components
      const drift = config.baseDrift * dt;
      const marketComponent = config.beta * marketReturn * 0.3; // Dampen market influence more
      const noise = gaussianRandom() * config.volatility * Math.sqrt(dt);
      const meanRevComponent = config.meanReversion * (1.0 - model.currentNav) * dt;
      
      // Jump component (reduced frequency and magnitude)
      let jump = 0;
      if (Math.random() < config.jumpProb * dt * 50) {
        jump = (Math.random() > 0.35 ? 1 : -1) * config.jumpSize * (0.3 + Math.random() * 0.4);
      }
      
      // Total return with smoothing
      let totalReturn = drift + marketComponent + noise + meanRevComponent + jump;
      
      // Limit maximum change per tick to ±1.5%
      const maxTickChange = 0.015;
      totalReturn = Math.max(-maxTickChange, Math.min(maxTickChange, totalReturn));
      
      // Update NAV with tighter bounds
      let newNav = model.currentNav * (1 + totalReturn);
      newNav = Math.max(newNav, 0.7); // Tighter floor
      newNav = Math.min(newNav, 2.5); // Tighter ceiling
      
      model.navSeries.push({ ts: now, nav: newNav });
      model.currentNav = newNav;
      model.lastUpdate = now;
      model.status = this.determineStatus(newNav, config);
      
      // Random events
      if (Math.random() < 0.005) {
        const eventType = randomPick(['rebalance', 'entry', 'exit', 'adjustment'] as const);
        model.events.push({
          ts: now,
          type: eventType,
          message: randomPick(EVENT_MESSAGES[eventType]),
        });
        if (model.events.length > 20) {
          model.events.shift();
        }
      }
      
      // Trim series
      if (model.navSeries.length > MAX_NAV_POINTS) {
        model.navSeries = model.navSeries.slice(-MAX_NAV_POINTS);
      }
    });

    this.state.lastGlobalUpdate = now;
    this.saveToStorage();
    this.notifyListeners();
  }

  start(): void {
    if (this.intervalId) return;
    
    // Immediate tick
    this.tick();
    
    // Start interval
    this.intervalId = setInterval(() => {
      this.tick();
    }, TICK_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getState(): AllModelsState {
    return this.state;
  }

  getModel(id: string): ModelState | undefined {
    return this.state.models[id];
  }

  resetModel(id: string): void {
    const config = MODEL_CONFIGS.find(c => c.id === id);
    if (!config) return;

    const now = Date.now();
    this.state.models[id] = {
      id,
      navSeries: [{ ts: now, nav: 1.0 }],
      events: [],
      currentNav: 1.0,
      status: 'ACTIVE',
      lastUpdate: now,
    };
    
    this.saveToStorage();
    this.notifyListeners();
  }

  subscribe(listener: (state: AllModelsState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Singleton instance
export const modelSimulator = new ModelSimulator();
