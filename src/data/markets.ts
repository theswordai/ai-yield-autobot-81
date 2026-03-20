export type Market = {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string;
  imageUrl: string;
  change24h: number;
  featured?: boolean;
  priceHistory: { time: string; yes: number; no: number }[];
  orderBook: {
    bids: { price: number; amount: number }[];
    asks: { price: number; amount: number }[];
  };
};

function generatePriceHistory(baseYes: number, days = 30) {
  const history: { time: string; yes: number; no: number }[] = [];
  let yes = baseYes - 0.15 + Math.random() * 0.1;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    yes = Math.max(0.02, Math.min(0.98, yes + (Math.random() - 0.48) * 0.04));
    history.push({
      time: date.toISOString().split("T")[0],
      yes: Math.round(yes * 100) / 100,
      no: Math.round((1 - yes) * 100) / 100,
    });
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

export const categories = ["All", "Politics", "Sports", "Crypto", "Tech", "Entertainment", "Science", "Finance", "Other"];

export const markets: Market[] = [
  {
    id: "1",
    title: "Will Bitcoin exceed $150K by end of 2026?",
    description: "This market resolves Yes if Bitcoin's price exceeds $150,000 at any point before December 31, 2026.",
    category: "Crypto",
    yesPrice: 0.62, noPrice: 0.38, volume: 12500000, liquidity: 3200000,
    endDate: "2026-12-31", imageUrl: "", change24h: 3.2, featured: true,
    priceHistory: generatePriceHistory(0.62), orderBook: generateOrderBook(0.62),
  },
  {
    id: "2",
    title: "Will AI pass the Turing Test by 2027?",
    description: "Resolves Yes if a generally accepted Turing Test is passed by an AI system before January 1, 2027.",
    category: "Tech",
    yesPrice: 0.45, noPrice: 0.55, volume: 8300000, liquidity: 2100000,
    endDate: "2027-01-01", imageUrl: "", change24h: -1.5, featured: true,
    priceHistory: generatePriceHistory(0.45), orderBook: generateOrderBook(0.45),
  },
];

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol}`;
}

export function formatPrice(price: number): string {
  return `${Math.round(price * 100)}¢`;
}
