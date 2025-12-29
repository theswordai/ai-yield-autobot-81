import { PriceTick, PriceCallback, StatusCallback } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';
const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin';
const POLL_INTERVAL = 8000; // 8 seconds

const ID_TO_SYMBOL: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'binancecoin': 'BNB',
};

export class CoinGeckoPoller {
  private intervalId: NodeJS.Timeout | null = null;
  private onPrice: PriceCallback;
  private onStatus: StatusCallback;
  private isRunning = false;
  private lastFetchTime = 0;

  constructor(onPrice: PriceCallback, onStatus: StatusCallback) {
    this.onPrice = onPrice;
    this.onStatus = onStatus;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.onStatus('connected', 'coingecko-rest');
    
    // Initial fetch
    await this.fetchPrices();
    
    // Start polling
    this.intervalId = setInterval(() => {
      this.fetchPrices();
    }, POLL_INTERVAL);
  }

  private async fetchPrices(): Promise<void> {
    // Throttle: ensure at least 5s between requests
    const now = Date.now();
    if (now - this.lastFetchTime < 5000) return;
    this.lastFetchTime = now;

    try {
      const url = `${COINGECKO_API}?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const ts = Date.now();
      
      Object.entries(data).forEach(([id, values]: [string, any]) => {
        const symbol = ID_TO_SYMBOL[id];
        if (symbol && values.usd) {
          const tick: PriceTick = {
            symbol,
            last: values.usd,
            ts,
            change24h: values.usd_24h_change,
          };
          this.onPrice(tick);
        }
      });
      
      this.onStatus('connected', 'coingecko-rest');
    } catch (error) {
      console.error('[CoinGecko] Fetch error:', error);
      this.onStatus('degraded', 'coingecko-rest');
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
