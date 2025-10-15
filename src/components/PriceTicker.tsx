import { useEffect, useMemo, useRef, useState } from "react";

type Item = { symbol: string; price: string; change: string };

const CG_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  SOL: "solana",
  USDT: "tether",
  BNB: "binancecoin",
  DOGE: "dogecoin",
};

const ORDER: Array<keyof typeof CG_IDS | "USD1" | "USDV"> = [
  "BTC",
  "ETH", 
  "SOL",
  "USDT",
  "USD1",
  "USDV",
  "BNB",
  "DOGE",
];

export function PriceTicker() {
  const [items, setItems] = useState<Item[] | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetchPrices = async () => {
    try {
      const ids = Object.values(CG_IDS).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn("CoinGecko API response not ok:", res.status);
        throw new Error("price fetch failed");
      }
      const data = await res.json() as Record<string, { usd: number; usd_24h_change: number }>;

      const formatPrice = (n: number, decimals = 2) => {
        const d = n >= 1000 ? 0 : n >= 100 ? 2 : n >= 1 ? 2 : 4;
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        }).format(n);
      };

      const toItem = (symbol: string): Item => {
        if (symbol === "USD1") {
          return { symbol, price: "1.0000", change: "+0.0%" };
        }
        if (symbol === "USDV") {
          return { symbol, price: "0.01", change: "+0.0%" };
        }
        const id = CG_IDS[symbol];
        const p = data[id]?.usd ?? 0;
        const ch = data[id]?.usd_24h_change ?? 0;
        const sign = ch >= 0 ? "+" : "";
        return {
          symbol,
          price: formatPrice(p),
          change: `${sign}${ch.toFixed(2)}%`,
        };
      };

      const newItems = ORDER.map((s) => toItem(s));
      // Only update if we got valid data
      if (newItems.some(item => item.price !== "0" && item.price !== "--")) {
        setItems(newItems);
      }
    } catch (e) {
      console.warn("Failed to fetch crypto prices, keeping previous data:", e);
      // Keep old data on error; if none, set a minimal fallback
      if (!items) {
        setItems(ORDER.map(symbol => {
          if (symbol === "USD1") return { symbol, price: "1.0000", change: "+0.0%" };
          if (symbol === "USDV") return { symbol, price: "0.01", change: "+0.0%" };
          return { symbol, price: "--", change: "--" };
        }));
      }
    }
  };

  useEffect(() => {
    fetchPrices();
    timerRef.current = window.setInterval(fetchPrices, 30000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doubled = useMemo(() => (items ? [...items, ...items] : []), [items]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur animate-fade-in">
      <style>{`
        @keyframes ticker-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent pulse" aria-hidden />
        <span className="text-xs text-muted-foreground">Live</span>
      </div>
      <div
        className="flex gap-8 whitespace-nowrap py-3 pl-16"
        style={{ width: "200%", animation: "ticker-marquee 28s linear infinite" }}
        role="list"
        aria-label="实时行情"
      >
        {doubled.map((item, idx) => {
          const positive = item.change.startsWith("+");
          return (
            <div key={idx} className="flex items-center gap-3 px-3 hover-scale" role="listitem">
              <span className="text-xs text-muted-foreground font-mono">{item.symbol}</span>
              <span className="text-sm font-semibold">${item.price}</span>
              <span className={`text-xs font-medium ${positive ? "text-accent" : "text-primary"}`}>
                {item.change}
              </span>
            </div>
          );
        })}
        {!items && (
          <div className="text-xs text-muted-foreground px-3">加载实时行情…</div>
        )}
      </div>
    </div>
  );
}
