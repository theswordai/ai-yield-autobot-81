import { PriceTick, PriceCallback, StatusCallback } from './types';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade/bnbusdt@trade';

const SYMBOL_MAP: Record<string, string> = {
  'BTCUSDT': 'BTC',
  'ETHUSDT': 'ETH',
  'SOLUSDT': 'SOL',
  'BNBUSDT': 'BNB',
};

export class BinanceWSProvider {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private onPrice: PriceCallback;
  private onStatus: StatusCallback;
  private debounceTimers: Record<string, NodeJS.Timeout> = {};

  constructor(onPrice: PriceCallback, onStatus: StatusCallback) {
    this.onPrice = onPrice;
    this.onStatus = onStatus;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    this.isManualClose = false;
    this.onStatus('connecting', 'binance-ws');
    
    try {
      this.ws = new WebSocket(BINANCE_WS_URL);
      
      this.ws.onopen = () => {
        console.log('[BinanceWS] Connected');
        this.reconnectAttempts = 0;
        this.onStatus('connected', 'binance-ws');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.stream && data.data) {
            const trade = data.data;
            const symbolRaw = trade.s?.toUpperCase();
            const symbol = SYMBOL_MAP[symbolRaw];
            
            if (symbol) {
              // Debounce updates to 250ms per symbol
              if (this.debounceTimers[symbol]) {
                clearTimeout(this.debounceTimers[symbol]);
              }
              
              this.debounceTimers[symbol] = setTimeout(() => {
                const tick: PriceTick = {
                  symbol,
                  last: parseFloat(trade.p),
                  ts: Date.now(),
                };
                this.onPrice(tick);
              }, 250);
            }
          }
        } catch (e) {
          console.error('[BinanceWS] Parse error:', e);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('[BinanceWS] Error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('[BinanceWS] Closed');
        if (!this.isManualClose) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error('[BinanceWS] Connection error:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[BinanceWS] Max reconnect attempts reached, switching to REST');
      this.onStatus('degraded', 'coingecko-rest');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`[BinanceWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.onStatus('connecting', 'binance-ws');
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
    this.debounceTimers = {};
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatus('disconnected', 'none');
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
