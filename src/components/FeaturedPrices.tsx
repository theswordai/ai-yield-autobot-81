import { useEffect, useMemo, useRef, useState } from "react";
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

type HistoryPoint = { value: number };

type PriceCardConfig = {
  key: string;
  label: string;
  symbol: string;
  data: PriceData | null;
  fallbackPrice: string;
  color: string;
  history: HistoryPoint[];
  extra?: React.ReactNode;
};

const USDV_CACHE_KEY = "usdv_price_cache";
const BTC_CACHE_KEY = "btc_price_cache";
const TRUMP_CACHE_KEY = "trump_price_cache";
const CACHE_DURATION = 5 * 60 * 1000;

export function FeaturedPrices() {
  const [usdvData, setUsdvData] = useState<PriceData | null>(() => loadCache(USDV_CACHE_KEY));
  const [btcData, setBtcData] = useState<PriceData | null>(() => loadCache(BTC_CACHE_KEY));
  const [trumpData, setTrumpData] = useState<PriceData | null>(() => loadCache(TRUMP_CACHE_KEY));
  const [usdvBalance, setUsdvBalance] = useState<bigint>(BigInt(0));
  const [usdvPriceHistory, setUsdvPriceHistory] = useState<HistoryPoint[]>([]);
  const [btcPriceHistory, setBtcPriceHistory] = useState<HistoryPoint[]>([]);
  const [trumpPriceHistory, setTrumpPriceHistory] = useState<HistoryPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const { account } = useWeb3();
  const { contracts } = useUSDVContracts();

  const fetchPrices = async () => {
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
          saveCache(USDV_CACHE_KEY, newData);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch USDV price:", e);
    }

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
        saveCache(BTC_CACHE_KEY, newData);
      }
    } catch (e) {
      console.warn("Failed to fetch BTC price:", e);
    }

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
          saveCache(TRUMP_CACHE_KEY, newData);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch TRUMP price:", e);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && contracts) {
        try {
          const balance = await contracts.usdv.balanceOf(account);
          setUsdvBalance(balance);
        } catch (error) {
          console.error("Failed to fetch USDV balance:", error);
        }
      } else {
        setUsdvBalance(BigInt(0));
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [account, contracts]);

  useEffect(() => {
    fetchPrices();
    fetchUSDVHistory(setUsdvPriceHistory);
    fetchBTCHistory(setBtcPriceHistory);
    fetchTRUMPHistory(setTrumpPriceHistory);

    const priceInterval = setInterval(fetchPrices, 30000);
    const historyInterval = setInterval(() => {
      fetchUSDVHistory(setUsdvPriceHistory);
      fetchBTCHistory(setBtcPriceHistory);
      fetchTRUMPHistory(setTrumpPriceHistory);
    }, 300000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(historyInterval);
    };
  }, []);

  const cards = useMemo<PriceCardConfig[]>(() => [
    {
      key: "usdv",
      label: "USDV Token",
      symbol: "USDV",
      data: usdvData,
      fallbackPrice: "0.0100",
      color: "hsl(var(--primary))",
      history: usdvPriceHistory,
      extra: account ? (
        <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Wallet</div>
          <div className="mt-1 text-base font-semibold text-foreground">{formatBalance(usdvBalance)} USDV</div>
          <div className="mt-1 text-xs text-muted-foreground">≈ ${calculateUsdValue(usdvBalance, usdvData)}</div>
        </div>
      ) : undefined,
    },
    {
      key: "btc",
      label: "Bitcoin",
      symbol: "BTC",
      data: btcData,
      fallbackPrice: "--",
      color: "hsl(var(--accent))",
      history: btcPriceHistory,
    },
    {
      key: "trump",
      label: "TRUMP",
      symbol: "TRUMP",
      data: trumpData,
      fallbackPrice: "--",
      color: "hsl(var(--primary))",
      history: trumpPriceHistory,
    },
  ], [account, btcData, btcPriceHistory, trumpData, trumpPriceHistory, usdvBalance, usdvData, usdvPriceHistory]);

  const total = cards.length;
  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="mx-auto mb-10 max-w-6xl">
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market Focus</p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">热点行情</h2>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {cards.map((card) => (
          <PriceCard key={card.key} {...card} compact={false} />
        ))}
      </div>

      <div className="relative md:hidden">
        <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {cards.map((card) => (
              <div key={card.key} className="w-full shrink-0 px-1">
                <PriceCard {...card} compact />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-card/80 text-foreground shadow-card"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 translate-x-1 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-card/80 text-foreground shadow-card"
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="mt-4 flex justify-center gap-2">
          {cards.map((card, index) => (
            <button
              key={card.key}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to ${card.label}`}
              className={`h-2.5 rounded-full transition-all ${index === currentIndex ? "w-7 bg-primary" : "w-2.5 bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceCard({ label, symbol, data, fallbackPrice, color, history, extra, compact }: PriceCardConfig & { compact: boolean }) {
  const metrics = getMetrics(history, data);

  return (
    <Card className={`overflow-hidden border-border/40 bg-card/55 backdrop-blur-xl shadow-card ${compact ? "rounded-[28px] p-5" : "rounded-[24px] p-5 lg:p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{symbol}</p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">{label}</h3>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${data?.isPositive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
          {data?.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{data ? `${data.isPositive ? "+" : ""}${data.change24h}%` : "--"}</span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[2rem] font-black leading-none tracking-normal text-foreground">${data?.price || fallbackPrice}</div>
          <p className="mt-2 text-sm text-muted-foreground">{compact ? "24H 实时变动" : "24H market tracking"}</p>
        </div>
      </div>

      <div className={`mt-5 rounded-[24px] border border-border/30 bg-background/40 p-3 ${compact ? "h-44" : "h-36 lg:h-40"}`}>
        <MiniKChart color={color} data={history} />
      </div>

      {extra && <div className="mt-4">{extra}</div>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-border/30 bg-background/35 p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{metric.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getMetrics(history: HistoryPoint[], data: PriceData | null) {
  const values = history.map((item) => item.value).filter((value) => Number.isFinite(value));
  const high = values.length ? Math.max(...values) : null;
  const low = values.length ? Math.min(...values) : null;
  const last = values.length ? values[values.length - 1] : null;

  return [
    { label: "24H", value: data ? `${data.isPositive ? "+" : ""}${data.change24h}%` : "--" },
    { label: "30D High", value: formatMetric(high) },
    { label: "30D Low", value: formatMetric(low) },
    { label: "Trend", value: last !== null && low !== null ? (last >= low ? "Active" : "Flat") : "--" },
  ];
}

function formatMetric(value: number | null) {
  if (value === null) return "--";
  if (value >= 1000) return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

function formatBalance(balance: bigint) {
  const formatted = formatUnits(balance, 18);
  const num = parseFloat(formatted);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateUsdValue(usdvBalance: bigint, usdvData: PriceData | null) {
  if (!usdvData) return "0.00";
  const balance = parseFloat(formatUnits(usdvBalance, 18));
  const value = balance * parseFloat(usdvData.price);
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function loadCache(key: string): PriceData | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    return Date.now() - timestamp < CACHE_DURATION ? data : null;
  } catch (e) {
    console.warn(`Failed to load cached value for ${key}:`, e);
    return null;
  }
}

function saveCache(key: string, data: PriceData) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore cache failures
  }
}

async function fetchUSDVHistory(setter: (value: HistoryPoint[]) => void) {
  try {
    const res = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x9a88bdcf549c0ae0ddb675abb22680673010bdb0/ohlcv/day?limit=30"
    );
    if (res.ok) {
      const json = await res.json();
      if (json.data?.attributes?.ohlcv_list) {
        setter(json.data.attributes.ohlcv_list.map((item: number[]) => ({ value: item[4] })).reverse());
      }
    }
  } catch (e) {
    console.warn("Failed to fetch USDV history:", e);
  }
}

async function fetchBTCHistory(setter: (value: HistoryPoint[]) => void) {
  try {
    const res = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30");
    if (res.ok) {
      const json = await res.json();
      setter(json.map((item: (string | number)[]) => ({ value: parseFloat(item[4] as string) })));
    }
  } catch (e) {
    console.warn("Failed to fetch BTC history:", e);
  }
}

async function fetchTRUMPHistory(setter: (value: HistoryPoint[]) => void) {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/official-trump/market_chart?vs_currency=usd&days=30&interval=daily",
      { signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.prices) {
        setter(json.prices.map((point: [number, number]) => ({ value: point[1] })));
      }
    }
  } catch (e) {
    console.warn("Failed to fetch TRUMP history:", e);
  }
}
