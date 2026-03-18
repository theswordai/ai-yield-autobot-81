import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets, PolyMarket } from '@/hooks/usePolymarkets';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Politics', 'Crypto', 'Sports', 'Tech', 'Entertainment', 'Other'];

export default function Predict() {
  const { t, language } = useI18n();
  const langPrefix = language === 'zh' ? '/zh' : '/en';
  const { data: markets = [], isLoading, error } = usePolymarkets();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [markets, category, search]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Helmet>
        <title>{language === 'zh' ? '预测市场 | USD.ONLINE' : 'Prediction Market | USD.ONLINE'}</title>
        <meta name="description" content="Explore prediction markets with real-time data" />
      </Helmet>
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-24 relative z-10">
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {language === 'zh' ? '🔮 预测市场' : '🔮 Prediction Market'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {language === 'zh' ? '基于 Polymarket 实时数据，探索全球热门预测事件' : 'Explore trending prediction events powered by Polymarket'}
          </p>
        </header>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'zh' ? '搜索市场...' : 'Search markets...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/50 border-border"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            {language === 'zh' ? '加载失败，请稍后重试' : 'Failed to load, please try again'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === 'zh' ? '没有找到匹配的市场' : 'No markets found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((market) => (
              <MarketCard key={market.id} market={market} langPrefix={langPrefix} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MarketCard({ market, langPrefix }: { market: PolyMarket; langPrefix: string }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <Link to={`${langPrefix}/predict/${market.id}`}>
      <Card className="bg-card/60 border-border hover:border-primary/40 transition-all duration-200 cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight line-clamp-3 flex-1">{market.title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0">{market.category}</Badge>
          </div>

          {/* Probability Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-accent font-medium">YES {yesPercent}%</span>
              <span className="text-destructive font-medium">NO {noPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-accent h-full transition-all" style={{ width: `${yesPercent}%` }} />
              <div className="bg-destructive h-full transition-all" style={{ width: `${noPercent}%` }} />
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>${market.volume >= 1000000 ? `${(market.volume / 1000000).toFixed(1)}M` : market.volume >= 1000 ? `${(market.volume / 1000).toFixed(1)}K` : market.volume.toFixed(0)}</span>
            {market.featured && <Badge className="ml-auto text-[10px] px-1.5 py-0">🔥 Hot</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
