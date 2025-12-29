import { useEffect, useState, useRef } from 'react';
import { BinanceWSProvider, CoinGeckoPoller, priceStore, PriceState, PriceTick } from '@/lib/prices';

export function usePriceStream() {
  const [state, setState] = useState<PriceState>(priceStore.getState());
  const wsProviderRef = useRef<BinanceWSProvider | null>(null);
  const pollerRef = useRef<CoinGeckoPoller | null>(null);
  const isDegradedRef = useRef(false);

  useEffect(() => {
    // Subscribe to price store updates
    const unsubscribe = priceStore.subscribe(setState);

    // Handle price updates
    const handlePrice = (tick: PriceTick) => {
      priceStore.updateTick(tick);
    };

    // Handle status changes
    const handleStatus = (status: PriceState['connectionStatus'], source: PriceState['dataSource']) => {
      priceStore.updateStatus(status, source);
      
      // Switch to REST if degraded
      if (source === 'coingecko-rest' && !isDegradedRef.current) {
        isDegradedRef.current = true;
        if (!pollerRef.current) {
          pollerRef.current = new CoinGeckoPoller(handlePrice, handleStatus);
        }
        pollerRef.current.start();
      }
    };

    // Create and connect WebSocket provider
    wsProviderRef.current = new BinanceWSProvider(handlePrice, handleStatus);
    wsProviderRef.current.connect();

    return () => {
      unsubscribe();
      wsProviderRef.current?.disconnect();
      pollerRef.current?.stop();
    };
  }, []);

  return state;
}
