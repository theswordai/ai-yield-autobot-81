import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { MiniKChart } from "@/components/MiniKChart";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUSDVContracts } from "@/hooks/useUSDVContracts";
import { formatUnits } from "ethers";

type PriceData = {
  price: string;
  change24h: string;
  isPositive: boolean;
};

const USDV_CACHE_KEY = "usdv_price_cache";
const BTC_CACHE_KEY = "btc_price_cache";
const TRUMP_CACHE_KEY = "trump_price_cache";
const CACHE_DURATION = 5 * 60 * 1000;

export function FeaturedPrices() {
  const [usdvData, setUsdvData] = useState<PriceData | null>(() => {
    try {
      const cached = localStorage.getItem(USDV_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
    } catch (e) { console.warn("Failed to load cached USDV price:", e); }
    return null;
  });

  const [btcData, setBtcData] = useState<PriceData | null>(() => {
    try {
      const cached = localStorage.getItem(BTC_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
    } catch (e) { console.warn("Failed to load cached BTC price:", e); }
    return null;
  });

  const [trumpData, setTrumpData] = useState<PriceData | null>(() => {
    try {
      const cached = localStorage.getItem(TRUMP_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
    } catch (e) { console.warn("Failed to load cached TRUMP price:", e); }
    return null;
  });

  const [usdvBalance, setUsdvBalance] = useState<bigint>(BigInt(0));
  const [usdvPriceHistory, setUsdvPriceHistory] = useState<{ open: number; close: number; value: number }[]>([]);
  const [btcPriceHistory, setBtcPriceHistory] = useState<{ open: number; close: number; value: number }[]>([]);
  const [trumpPriceHistory, setTrumpPriceHistory] = useState<{ open: number; close: number; value: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const { account } = useWeb3();
  const { contracts } = useUSDVContracts();

  const fetchPrices = async () => {
    // USDV from GeckoTerminal
    try {
      const usdvRes = await fetch(
        "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x9a88bdcf549c0ae0ddb675abb22680673010bdb0",
        { signal: AbortSignal.timeout(10000) }
      );
      if (usdvRes.ok) {
        const usdvJson = await usdvRes.json();
        const attributes = usdvJson.data?.attributes;
        if (attributes) {
          const price = parseFloat(attributes.base_token_price_usd);
          const change = parseFloat(attributes.price_change_percentage?.h24 || "0");
          const newData = { price: price.toFixed(4), change24h: change.toFixed(2), isPositive: change >= 0 };
          setUsdvData(newData);
          try { localStorage.setItem(USDV_CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() })); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { console.warn("Failed to fetch USDV price:", e); }

    // BTC from Binance
    try {
      const [tickerRes, statsRes] = await Promise.all([
        fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
        fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"),
      ]);
      if (tickerRes.ok && statsRes.ok) {
        const tickerJson = await tickerRes.json();
        const statsJson = await statsRes.json();
        const price = parseFloat(tickerJson.price);
        const change = parseFloat(statsJson.priceChangePercent);
        const newData = {
          price: new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price),
          change24h: change.toFixed(2),
          isPositive: change >= 0,
        };
        setBtcData(newData);
        try { localStorage.setItem(BTC_CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() })); } catch (e) { /* ignore */ }
      }
    } catch (e) { console.warn("Failed to fetch BTC price:", e); }

    // TRUMP from CoinGecko
    try {
      const trumpRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=official-trump&vs_currencies=usd&include_24hr_change=true",
        { signal: AbortSignal.timeout(10000) }
      );
      if (trumpRes.ok) {
        const trumpJson = await trumpRes.json();
        const data = trumpJson["official-trump"];
        if (data) {
          const price = data.usd;
          const change = data.usd_24h_change || 0;
          const newData = {
            price: price >= 1 ? price.toFixed(2) : price.toFixed(4),
            change24h: change.toFixed(2),
            isPositive: change >= 0,
          };
          setTrumpData(newData);
          try { localStorage.setItem(TRUMP_CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() })); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { console.warn("Failed to fetch TRUMP price:", e); }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && contracts) {
        try {
          const balance = await contracts.usdv.balanceOf(account);
          setUsdvBalance(balance);
        } catch (error) { console.error("Failed to fetch USDV balance:", error); }
      } else {
        setUsdvBalance(BigInt(0));
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [account, contracts]);

  const fetchUSDVHistory = async () => {
    try {
      const res = await fetch(
        "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x9a88bdcf549c0ae0ddb675abb22680673010bdb0/ohlcv/day?limit=30"
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data?.attributes?.ohlcv_list) {
          const history = json.data.attributes.ohlcv_list.map((item: number[]) => ({ open: item[1], close: item[4], value: item[4] }));
          setUsdvPriceHistory(history.reverse());
        }
      }
    } catch (e) { console.warn("Failed to fetch USDV history:", e); }
  };

  const fetchBTCHistory = async () => {
    try {
      const res = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30");
      if (res.ok) {
        const json = await res.json();
        setBtcPriceHistory(json.map((item: (string | number)[]) => ({ open: parseFloat(item[1] as string), close: parseFloat(item[4] as string), value: parseFloat(item[4] as string) })));
      }
    } catch (e) { console.warn("Failed to fetch BTC history:", e); }
  };

  const fetchTRUMPHistory = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/official-trump/market_chart?vs_currency=usd&days=30&interval=daily",
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.prices) {
          setTrumpPriceHistory(json.prices.map((p: [number, number], i: number, arr: [number, number][]) => ({ open: i > 0 ? arr[i - 1][1] : p[1], close: p[1], value: p[1] })));
        }
      }
    } catch (e) { console.warn("Failed to fetch TRUMP history:", e); }
  };

  useEffect(() => {
    fetchPrices();
    fetchUSDVHistory();
    fetchBTCHistory();
    fetchTRUMPHistory();

    const priceInterval = setInterval(fetchPrices, 30000);
    const historyInterval = setInterval(() => {
      fetchUSDVHistory();
      fetchBTCHistory();
      fetchTRUMPHistory();
    }, 300000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(historyInterval);
    };
  }, []);

  const formatBalance = (balance: bigint) => {
    const formatted = formatUnits(balance, 18);
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateUsdValue = () => {
    if (!usdvData) return "0.00";
    const balance = parseFloat(formatUnits(usdvBalance, 18));
    const value = balance * parseFloat(usdvData.price);
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cards = [
    {
      key: "usdv",
      tag: "STABLE LP",
      label: "USDV Token",
      data: usdvData,
      fallbackPrice: "0.0100",
      color: "hsl(var(--primary))",
      history: usdvPriceHistory,
      extra: account ? (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="text-xs text-muted-foreground mb-1">Your Balance</div>
          <div className="text-base font-semibold text-foreground">{formatBalance(usdvBalance)} USDV</div>
          <div className="text-xs text-muted-foreground mt-0.5">≈ ${calculateUsdValue()}</div>
        </div>
      ) : null,
    },
    {
      key: "btc",
      tag: "BENCHMARK",
      label: "Bitcoin",
      data: btcData,
      fallbackPrice: "--",
      color: "hsl(var(--accent))",
      history: btcPriceHistory,
      extra: null,
    },
    {
      key: "trump",
      tag: "CONVICTION",
      label: "TRUMP",
      data: trumpData,
      fallbackPrice: "--",
      color: "hsl(38 92% 60%)",
      history: trumpPriceHistory,
      extra: null,
    },
  ];

  const total = cards.length;

  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div className="max-w-5xl mx-auto mb-8">
      {/* Desktop: grid layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mb-4">
        {cards.map((card) => (
          <PriceCard key={card.key} {...card} />
        ))}
      </div>

      {/* Mobile: carousel */}
      <div className="md:hidden relative mb-4">
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {cards.map((card) => (
              <div key={card.key} className="w-full flex-shrink-0 px-1">
                <PriceCard {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-card/80 border border-border flex items-center justify-center shadow-md"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-card/80 border border-border flex items-center justify-center shadow-md"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-3">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-primary" : "bg-muted-foreground/40"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceCard({
  tag,
  label,
  data,
  fallbackPrice,
  color,
  history,
  extra,
}: {
  tag?: string;
  label: string;
  data: PriceData | null;
  fallbackPrice: string;
  color: string;
  history: { open: number; close: number; value: number }[];
  extra?: React.ReactNode;
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40 p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
      {/* Tag */}
      {tag && (
        <p className="text-[10px] tracking-[0.15em] uppercase text-primary font-semibold mb-1">{tag}</p>
      )}
      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-4">{label}</h3>
      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
          ${data?.price || fallbackPrice}
        </span>
      </div>
      {/* Chart */}
      <div className="h-20 mb-4">
        <MiniKChart color={color} data={history} />
      </div>
      {/* Footer: change + volume */}
      <div className="flex items-center justify-between text-xs font-mono">
        {data ? (
          <span className={data.isPositive ? "text-accent" : "text-destructive"}>
            {data.isPositive ? "+" : ""}{data.change24h}% (24H)
          </span>
        ) : (
          <span className="text-muted-foreground">--</span>
        )}
        <span className="text-muted-foreground">
          VOL: --
        </span>
      </div>
      {extra}
    </Card>
  );
}
