import { PriceTick } from '@/lib/prices';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerProps {
  ticks: Record<string, PriceTick>;
}

const SYMBOL_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  BNB: '⬡',
};

export function MarketTicker({ ticks }: MarketTickerProps) {
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2">
      {symbols.map(symbol => {
        const tick = ticks[symbol];
        const price = tick?.last || 0;
        const change = tick?.change24h || 0;
        const isPositive = change >= 0;

        return (
          <div
            key={symbol}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm min-w-[180px]"
          >
            <span className="text-2xl opacity-60">{SYMBOL_ICONS[symbol]}</span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">{symbol}/USDT</span>
              <span className="text-lg font-bold text-foreground">
                ${price > 0 ? price.toLocaleString(undefined, { 
                  minimumFractionDigits: price < 10 ? 2 : 0,
                  maximumFractionDigits: price < 10 ? 4 : 2 
                }) : '---'}
              </span>
            </div>
            <div className={`flex items-center gap-1 ml-auto ${isPositive ? 'text-accent' : 'text-destructive'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {change !== 0 ? `${isPositive ? '+' : ''}${change.toFixed(2)}%` : '---'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
