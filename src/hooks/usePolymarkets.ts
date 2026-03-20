import { useQuery } from "@tanstack/react-query";
import type { Market } from "@/data/markets";

interface PolymarketRawMarket {
  id: string;
  question: string;
  description: string;
  category: string;
  slug: string;
  outcomePrices: string;
  volume: number;
  volumeNum: number;
  volume24hr: number;
  liquidity: number;
  liquidityNum: number;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  oneDayPriceChange: number;
  events?: { title?: string; slug?: string }[];
}

function parseOutcomePrices(raw: string | undefined): [number, number] {
  if (!raw) return [0.5, 0.5];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      return [Number(parsed[0]), Number(parsed[1])];
    }
  } catch {}
  return [0.5, 0.5];
}

function mapCategory(raw: PolymarketRawMarket): string {
  const text = [raw.question, raw.category, raw.events?.[0]?.title, raw.events?.[0]?.slug]
    .filter(Boolean).join(" ").toLowerCase();
  if (/trump|biden|election|president|congress|senate|democrat|republican|vote|politic|nato|war|ceasefire|tariff/.test(text)) return "Politics";
  if (/bitcoin|btc|ethereum|eth|solana|sol|crypto|token|defi|nft|blockchain/.test(text)) return "Crypto";
  if (/nba|nfl|nhl|mlb|soccer|football|basketball|baseball|tennis|ufc|champion|league|cup/.test(text)) return "Sports";
  if (/ai\b|gpt|openai|apple|google|microsoft|meta|tesla|spacex|tech|software/.test(text)) return "Tech";
  if (/fed\b|rate|gdp|inflation|recession|stock|s&p|nasdaq|treasury|bond|bank|economy/.test(text)) return "Finance";
  if (/oscar|grammy|movie|film|album|music|netflix|disney|celebrity/.test(text)) return "Entertainment";
  if (/climate|nasa|space|mars|moon|fusion|quantum|vaccine|virus|science/.test(text)) return "Science";
  return "Other";
}

function generatePriceHistory(baseYes: number, days = 30) {
  const history: { time: string; yes: number; no: number }[] = [];
  let yes = baseYes - 0.15 + Math.random() * 0.1;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    yes = Math.max(0.02, Math.min(0.98, yes + (Math.random() - 0.48) * 0.04));
    history.push({ time: date.toISOString().split("T")[0], yes: Math.round(yes * 100) / 100, no: Math.round((1 - yes) * 100) / 100 });
  }
  return history;
}

function generateOrderBook(yesPrice: number) {
  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: Math.round((yesPrice - (i + 1) * 0.01) * 100) / 100,
    amount: Math.floor(Math.random() * 5000) + 500,
  }));
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: Math.round((yesPrice + (i + 1) * 0.01) * 100) / 100,
    amount: Math.floor(Math.random() * 5000) + 500,
  }));
  return { bids, asks };
}

function toMarket(raw: PolymarketRawMarket, index: number): Market {
  const [yesPrice, noPrice] = parseOutcomePrices(raw.outcomePrices);
  return {
    id: raw.id || String(index + 1),
    title: raw.question || "Untitled Market",
    description: raw.description || "",
    category: mapCategory(raw),
    yesPrice, noPrice,
    volume: raw.volumeNum || raw.volume || 0,
    liquidity: raw.liquidityNum || raw.liquidity || 0,
    endDate: raw.endDate || new Date().toISOString(),
    imageUrl: raw.image || raw.icon || "",
    change24h: raw.oneDayPriceChange ? Math.round(raw.oneDayPriceChange * 100 * 10) / 10 : Math.round((Math.random() - 0.5) * 10 * 10) / 10,
    featured: index < 3,
    priceHistory: generatePriceHistory(yesPrice),
    orderBook: generateOrderBook(yesPrice),
  };
}

async function fetchMarkets(): Promise<Market[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/polymarket-proxy?limit=20`;
  const response = await fetch(url, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
  });
  if (!response.ok) throw new Error("Failed to fetch markets from Polymarket");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid response from Polymarket API");
  return data.filter((m: PolymarketRawMarket) => m.question && m.outcomePrices)
    .map((m: PolymarketRawMarket, i: number) => toMarket(m, i));
}

export function usePolymarkets() {
  return useQuery({
    queryKey: ["polymarkets"],
    queryFn: fetchMarkets,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 2,
  });
}
