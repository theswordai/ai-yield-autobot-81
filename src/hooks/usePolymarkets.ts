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
  featured: boolean;
  image: string;
  endDate: string;
}

function categorize(question: string): string {
  const q = question.toLowerCase();
  if (/trump|biden|election|president|congress|senate|vote|politic|government|democrat|republican/.test(q)) return 'Politics';
  if (/bitcoin|ethereum|crypto|btc|eth|token|blockchain|defi|nft/.test(q)) return 'Crypto';
  if (/nba|nfl|soccer|football|tennis|sport|game|match|championship|world cup|super bowl/.test(q)) return 'Sports';
  if (/ai|apple|google|microsoft|openai|tech|software|chip|gpu/.test(q)) return 'Tech';
  if (/oscar|movie|music|grammy|film|celebrity|tv|show|entertainment/.test(q)) return 'Entertainment';
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

    const volume = m.volumeNum || m.volume24hr || 0;

    return {
      id: m.id || m.conditionId || String(Math.random()),
      title: m.question || 'Unknown Market',
      description: m.description || '',
      category: categorize(m.question || ''),
      yesPrice,
      noPrice,
      volume,
      featured: volume > 1000000,
      image: m.image || '',
      endDate: m.endDate || '',
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
