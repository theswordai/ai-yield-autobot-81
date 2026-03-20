import { useState, useMemo, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets, PolyMarket } from '@/hooks/usePolymarkets';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, TrendingUp, Loader2, Flame, ChevronLeft, ChevronRight, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['🔥 Trending', 'Politics', 'Crypto', 'Sports', 'Tech', 'Entertainment', 'Other'];

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function Predict() {
  const { language } = useI18n();
  const langPrefix = language === 'zh' ? '/zh' : '/en';
  const { data: markets = [], isLoading, error } = usePolymarkets();
  const [category, setCategory] = useState('🔥 Trending');
  const [search, setSearch] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);

  const featured = useMemo(() => {
    return markets.filter((m) => m.featured).slice(0, 3);
  }, [markets]);

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (category !== '🔥 Trending' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.volume - a.volume);
  }, [markets, category, search]);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Cyberpunk background grid */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <Helmet>
        <title>{language === 'zh' ? '预测市场 | USD.ONLINE' : 'Prediction Markets | USD.ONLINE'}</title>
        <meta name="description" content="Explore prediction markets with real-time data from Polymarket" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-24 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: 'hsl(180 100% 70%)' }} />
              {language === 'zh' ? '预测市场' : 'Prediction Markets'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Activity className="w-3 h-3" style={{ color: 'hsl(180 100% 70%)' }} />
              {language === 'zh' ? '实时数据 · 每30秒刷新' : 'Live data · Refreshes every 30s'}
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(142 71% 45%)' }} />
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'zh' ? '搜索市场...' : 'Search markets...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-card border-border text-sm cyberpunk-glow"
              style={{ borderColor: 'hsl(180 100% 70% / 0.3)' }}
            />
          </div>
        </div>

        {/* Featured Hero Cards */}
        {!search && category === '🔥 Trending' && featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {featured.map((m) => (
              <FeaturedCard key={m.id} market={m} langPrefix={langPrefix} language={language} />
            ))}
          </div>
        )}

        {/* Category Tabs */}
        <div className="relative mb-6">
          <button onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/80 rounded-full border border-border hidden sm:block">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div ref={tabsRef} className="flex gap-1 overflow-x-auto scrollbar-hide px-0 sm:px-6 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all shrink-0 ${
                  category === cat
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                style={category === cat ? {
                  background: 'hsl(180 100% 70% / 0.15)',
                  border: '1px solid hsl(180 100% 70% / 0.5)',
                  boxShadow: '0 0 10px hsl(180 100% 70% / 0.2)',
                } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTabs('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/80 rounded-full border border-border hidden sm:block">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Stats bar */}
        {!isLoading && !error && (
          <div className="flex items-center gap-4 mb-4 px-1 text-[11px] text-muted-foreground">
            <span>{language === 'zh' ? `共 ${filtered.length} 个市场` : `${filtered.length} markets`}</span>
            <span className="w-px h-3 bg-border" />
            <span>{language === 'zh' ? `总计 ${markets.length} 个活跃市场` : `${markets.length} active markets total`}</span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(180 100% 70%)' }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'hsl(180 100% 70%)' }} />
            </div>
            <span className="text-sm text-muted-foreground">{language === 'zh' ? '正在同步数据...' : 'Syncing data...'}</span>
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
          <div className="space-y-2">
            {filtered.map((market) => (
              <MarketRow key={market.id} market={market} langPrefix={langPrefix} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Featured Hero Card ── */
function FeaturedCard({ market, langPrefix, language }: { market: PolyMarket; langPrefix: string; language: string }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  return (
    <Link to={`${langPrefix}/predict/${market.id}`}>
      <Card className="cyberpunk-card hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group">
        {market.image && (
          <div className="h-28 overflow-hidden relative">
            <img src={market.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}
        <CardContent className="p-3 relative">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 shrink-0" style={{ color: 'hsl(180 100% 70%)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(180 100% 70%)' }}>
              {language === 'zh' ? '热门' : 'TRENDING'}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-foreground mb-3">{market.title}</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 px-3 text-xs font-bold border-0" style={{
              background: 'hsl(142 71% 45% / 0.2)',
              color: 'hsl(142 71% 45%)',
            }}>
              {market.outcomes[0]} {yesPercent}¢
            </Button>
            <Button size="sm" className="h-7 px-3 text-xs font-bold border-0" style={{
              background: 'hsl(0 84% 60% / 0.2)',
              color: 'hsl(0 84% 60%)',
            }}>
              {market.outcomes[1]} {100 - yesPercent}¢
            </Button>
            <span className="ml-auto text-[10px] text-muted-foreground">{formatVolume(market.volume)} Vol.</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── Market Row ── */
function MarketRow({ market, langPrefix }: { market: PolyMarket; langPrefix: string }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <Link to={`${langPrefix}/predict/${market.id}`}>
      <div className="cyberpunk-card flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer group hover:scale-[1.005]"
        style={{ borderColor: 'hsl(180 100% 70% / 0.15)' }}
      >
        {/* Icon */}
        <Avatar className="w-10 h-10 shrink-0 rounded-lg ring-1" style={{ ringColor: 'hsl(180 100% 70% / 0.3)' }}>
          <AvatarImage src={market.icon} alt="" className="object-cover" />
          <AvatarFallback className="rounded-lg bg-muted text-xs font-bold">
            {market.title.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-tight line-clamp-1 text-foreground group-hover:text-foreground transition-colors">
            {market.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">{formatVolume(market.volume)} Vol.</span>
            {market.volume24hr > 0 && (
              <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'hsl(180 100% 70% / 0.8)' }}>
                <TrendingUp className="w-3 h-3" />
                {formatVolume(market.volume24hr)} 24h
              </span>
            )}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 border" style={{
              borderColor: 'hsl(180 100% 70% / 0.3)',
              background: 'hsl(180 100% 70% / 0.1)',
              color: 'hsl(180 100% 70%)',
            }}>{market.category}</Badge>
          </div>
        </div>

        {/* YES / NO */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">{market.outcomes[0]}</span>
            <div className="px-3 py-1 rounded-md text-xs font-bold" style={{
              background: yesPercent >= 50 ? 'hsl(142 71% 45% / 0.2)' : 'hsl(142 71% 45% / 0.1)',
              color: 'hsl(142 71% 45%)',
              boxShadow: yesPercent >= 50 ? '0 0 8px hsl(142 71% 45% / 0.2)' : 'none',
            }}>
              {yesPercent}¢
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">{market.outcomes[1]}</span>
            <div className="px-3 py-1 rounded-md text-xs font-bold" style={{
              background: noPercent >= 50 ? 'hsl(0 84% 60% / 0.2)' : 'hsl(0 84% 60% / 0.1)',
              color: 'hsl(0 84% 60%)',
              boxShadow: noPercent >= 50 ? '0 0 8px hsl(0 84% 60% / 0.2)' : 'none',
            }}>
              {noPercent}¢
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
