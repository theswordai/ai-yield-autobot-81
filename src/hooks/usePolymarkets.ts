import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PolyMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  volume24hr: number;
  liquidity: number;
  featured: boolean;
  image: string;
  icon: string;
  slug: string;
  endDate: string;
  outcomes: string[];
  groupItemTitle: string;
  events: { title: string; slug: string }[];
}

function categorize(question: string): string {
  const q = question.toLowerCase();
  if (/trump|biden|election|president|congress|senate|vote|politic|government|democrat|republican|iran|cuba|tariff|executive order|white house|governor|mayor|kamala|desantis|rfk|vivek|haley|pence|newsom/.test(q)) return 'Politics';
  if (/bitcoin|ethereum|crypto|btc|eth|token|blockchain|defi|nft|solana|xrp|doge|cardano|polygon|avalanche|arbitrum|base chain/.test(q)) return 'Crypto';
  if (/nba|nfl|soccer|football|tennis|sport|game|match|championship|world cup|super bowl|ncaa|ufc|boxing|f1|formula|mlb|nhl|ucl|premier league|la liga|bundesliga|serie a|wimbledon|olympics/.test(q)) return 'Sports';
  if (/ai |apple|google|microsoft|openai|tech|software|chip|gpu|nvidia|tesla|spacex|amazon|meta|tiktok|twitter|robot|quantum|semiconductor/.test(q)) return 'Tech';
  if (/oscar|movie|music|grammy|film|celebrity|tv|show|entertainment|emmy|golden globe|spotify|netflix|disney|album|song|taylor swift|drake/.test(q)) return 'Entertainment';
  return 'Other';
}

async function fetchMarkets(): Promise<PolyMarket[]> {
  const { data, error } = await supabase.functions.invoke('polymarket-proxy');
  if (error) throw error;

  const markets = Array.isArray(data) ? data : [];

  return markets.map((m: any) => {
    let yesPrice = 0.5;
    let noPrice = 0.5;
    try {
      if (m.outcomePrices) {
        const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
        if (Array.isArray(prices) && prices.length >= 2) {
          yesPrice = parseFloat(prices[0]) || 0.5;
          noPrice = parseFloat(prices[1]) || 0.5;
        }
      }
    } catch {}

    let outcomes: string[] = ['Yes', 'No'];
    try {
      if (m.outcomes) {
        const parsed = typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
        if (Array.isArray(parsed) && parsed.length >= 2) {
          outcomes = parsed;
        }
      }
    } catch {}

    let events: { title: string; slug: string }[] = [];
    try {
      if (m.events && Array.isArray(m.events)) {
        events = m.events.map((e: any) => ({ title: e.title || '', slug: e.slug || '' }));
      }
    } catch {}

    const volume = m.volumeNum || m.volume || 0;
    const volume24hr = m.volume24hr || 0;
    const liquidity = m.liquidityNum || m.liquidity || 0;

    return {
      id: m.id || m.conditionId || String(Math.random()),
      title: m.question || 'Unknown Market',
      description: m.description || '',
      category: categorize(m.question || ''),
      yesPrice,
      noPrice,
      volume,
      volume24hr,
      liquidity,
      featured: volume > 1000000,
      image: m.image || '',
      icon: m.icon || m.image || '',
      slug: m.slug || '',
      endDate: m.endDate || '',
      outcomes,
      groupItemTitle: m.groupItemTitle || '',
      events,
    };
  });
}

export function usePolymarkets() {
  return useQuery({
    queryKey: ['polymarkets'],
    queryFn: fetchMarkets,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
