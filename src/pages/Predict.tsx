import { useState, useMemo, useRef } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { PageWrapper } from '@/components/PageWrapper';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets, PolyMarket } from '@/hooks/usePolymarkets';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, TrendingUp, Loader2, ChevronLeft, ChevronRight, ChevronRight as ChevronR, Bookmark, SlidersHorizontal, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Trending', 'Breaking', 'New', 'Politics', 'Sports', 'Crypto',
  'Iran', 'Finance', 'Geopolitics', 'Tech', 'Culture', 'Weather', 'Science',
];

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export default function Predict() {
  const { language } = useI18n();
  const langPrefix = language === 'zh' ? '/zh' : '/en';
  const { data: markets = [], isLoading, error } = usePolymarkets();
  const [category, setCategory] = useState('Trending');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const featured = useMemo(() => {
    return markets.filter((m) => m.featured).sort((a, b) => b.volume24hr - a.volume24hr).slice(0, 5);
  }, [markets]);

  const breakingNews = useMemo(() => {
    return markets.filter((m) => m.volume24hr > 1000000).sort((a, b) => b.volume24hr - a.volume24hr).slice(0, 5);
  }, [markets]);

  const hotTopics = useMemo(() => {
    return markets.filter((m) => m.volume24hr > 500000).sort((a, b) => b.volume24hr - a.volume24hr).slice(0, 5);
  }, [markets]);

  const filtered = useMemo(() => {
    let list = markets;
    if (category === 'Trending') {
      list = [...markets].sort((a, b) => b.volume24hr - a.volume24hr);
    } else if (category === 'Breaking') {
      list = [...markets].sort((a, b) => b.volume24hr - a.volume24hr);
    } else if (category === 'New') {
      list = markets.filter((m) => m.category === 'New' || !['Politics', 'Sports', 'Crypto', 'Iran', 'Finance', 'Geopolitics', 'Tech', 'Culture', 'Weather', 'Science'].includes(m.category));
    } else {
      list = markets.filter((m) => m.category === category);
    }
    if (search) {
      list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [markets, category, search]);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const [featuredIdx, setFeaturedIdx] = useState(0);
  const featuredMarket = featured[featuredIdx];

  return (
    <PageWrapper>
      <Helmet>
        <title>{language === 'zh' ? '预测市场 | USD.ONLINE' : 'Prediction Markets | USD.ONLINE'}</title>
      </Helmet>

      <main className="container mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-24">
        {/* Category Nav Bar - Polymarket style */}
        <div className="relative mb-6 border-b border-border">
          <button onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/90 hidden sm:block">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div ref={tabsRef} className="flex gap-0 overflow-x-auto scrollbar-hide sm:px-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors relative ${
                  category === cat
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'Trending' && <TrendingUp className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {cat}
                {category === cat && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTabs('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background/90 hidden sm:block">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            {language === 'zh' ? '加载失败' : 'Failed to load'}
          </div>
        ) : (
          <>
            {/* Featured + Sidebar */}
            {category === 'Trending' && !search && featuredMarket && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Featured Card */}
                <div className="lg:col-span-2">
                  <FeaturedHero
                    market={featuredMarket}
                    langPrefix={langPrefix}
                    markets={featured}
                    currentIdx={featuredIdx}
                    onSelect={setFeaturedIdx}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Breaking News */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-sm font-bold text-foreground">Breaking news</h2>
                      <ChevronR className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                      {breakingNews.map((m, i) => (
                        <Link key={m.id} to={`${langPrefix}/predict/${m.id}`} className="flex items-start gap-2 group">
                          <span className="text-xs text-muted-foreground font-medium w-4 shrink-0 pt-0.5">{i + 1}</span>
                          <span className="text-sm text-foreground group-hover:underline leading-tight flex-1 line-clamp-2">{m.title}</span>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-foreground">{Math.round(m.yesPrice * 100)}%</span>
                            {m.volume24hr > 0 && (
                              <div className="text-[10px]" style={{ color: m.yesPrice > 0.5 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))' }}>
                                {m.yesPrice > 0.5 ? '↑' : '↓'} {Math.abs(Math.round((m.yesPrice - 0.5) * 200))}%
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Hot Topics */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-sm font-bold text-foreground">Hot topics</h2>
                      <ChevronR className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="space-y-2.5">
                      {hotTopics.map((m, i) => (
                        <Link key={m.id} to={`${langPrefix}/predict/${m.id}`} className="flex items-center gap-2 group">
                          <span className="text-xs text-muted-foreground font-medium w-4 shrink-0">{i + 1}</span>
                          <span className="text-sm text-foreground group-hover:underline flex-1 line-clamp-1">{m.title}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">{formatVolume(m.volume24hr)} today</span>
                          <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                          <ChevronR className="w-3 h-3 text-muted-foreground shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Markets Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {language === 'zh' ? '所有市场' : 'All markets'}
              </h2>
              <div className="flex items-center gap-2">
                {showSearch ? (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder={language === 'zh' ? '搜索...' : 'Search...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onBlur={() => !search && setShowSearch(false)}
                      className="pl-8 h-8 w-48 text-sm bg-card border-border"
                    />
                  </div>
                ) : (
                  <button onClick={() => setShowSearch(true)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Market Cards Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">
                {language === 'zh' ? '没有找到市场' : 'No markets found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((market) => (
                  <MarketCard key={market.id} market={market} langPrefix={langPrefix} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </PageWrapper>
  );
}

/* ── Featured Hero (Polymarket style) ── */
function FeaturedHero({
  market, langPrefix, markets, currentIdx, onSelect,
}: {
  market: PolyMarket; langPrefix: string; markets: PolyMarket[]; currentIdx: number; onSelect: (i: number) => void;
}) {
  const yesPercent = Math.round(market.yesPrice * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{market.category}</span>
          {market.events[0] && (
            <>
              <span>·</span>
              <span>{market.events[0].title}</span>
            </>
          )}
        </div>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 shrink-0 rounded-lg">
            <AvatarImage src={market.icon} alt="" className="object-cover" />
            <AvatarFallback className="rounded-lg bg-muted text-sm font-bold">{market.title.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link to={`${langPrefix}/predict/${market.id}`} className="hover:underline">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{market.title}</h2>
          </Link>
        </div>

        {/* Outcomes list */}
        <div className="mt-4 space-y-2">
          {market.outcomes.map((outcome, i) => {
            const pct = i === 0 ? yesPercent : 100 - yesPercent;
            return (
              <div key={outcome} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-32 sm:w-40 truncate">{outcome}</span>
                <span className="text-sm font-bold text-foreground w-10">{pct}%</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: i === 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{formatVolume(market.volume)} Vol</span>
          <span className="text-xs text-muted-foreground">
            {market.endDate ? `Ends ${new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
          </span>
        </div>
      </div>

      {/* Pagination dots */}
      {markets.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {markets.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`rounded-full transition-all ${
                i === currentIdx ? 'w-5 h-1.5 bg-foreground' : 'w-1.5 h-1.5 bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Market Card (Polymarket style grid card) ── */
function MarketCard({ market, langPrefix }: { market: PolyMarket; langPrefix: string }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <Link to={`${langPrefix}/predict/${market.id}`}>
      <div className="rounded-xl border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors h-full flex flex-col">
        {/* Header: icon + title */}
        <div className="flex items-start gap-2.5 mb-3">
          <Avatar className="w-8 h-8 shrink-0 rounded-lg">
            <AvatarImage src={market.icon} alt="" className="object-cover" />
            <AvatarFallback className="rounded-lg bg-muted text-xs font-bold">{market.title.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 flex-1">{market.title}</h3>
        </div>

        {/* Outcomes with bars */}
        <div className="space-y-2 flex-1">
          {market.outcomes.slice(0, 2).map((outcome, i) => {
            const pct = i === 0 ? yesPercent : noPercent;
            return (
              <div key={outcome} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate flex-1">{outcome}</span>
                <span className="text-xs font-bold text-foreground">{pct}%</span>
                <div className="flex gap-1">
                  <button className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    i === 0
                      ? 'bg-accent/15 text-accent hover:bg-accent/25'
                      : 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                  }`}>
                    {i === 0 ? 'Yes' : 'No'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground">{formatVolume(market.volume)} Vol.</span>
          <div className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}
