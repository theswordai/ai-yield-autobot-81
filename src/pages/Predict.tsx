import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { usePolymarkets } from "@/hooks/usePolymarkets";
import { markets as fallbackMarkets, categories, formatVolume, formatPrice } from "@/data/markets";
import type { Market } from "@/data/markets";

export default function Predict() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = location.pathname.startsWith("/en") ? "en" : "zh";

  const { data: liveMarkets, isLoading, isError } = usePolymarkets();
  const marketData: Market[] = liveMarkets && liveMarkets.length > 0 ? liveMarkets : fallbackMarkets;

  const filtered = useMemo(() => {
    return marketData.filter((m) => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [marketData, search, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Prediction Market
            </span>
          </h1>
          <p className="text-muted-foreground">Trade on real-world event outcomes powered by Polymarket</p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        )}

        {/* Markets Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((market) => (
              <Card
                key={market.id}
                className="bg-card/80 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/${currentLang}/predict/${market.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    {market.imageUrl && (
                      <img src={market.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {market.title}
                      </h3>
                      <Badge variant="outline" className="mt-1 text-[10px]">{market.category}</Badge>
                    </div>
                  </div>

                  {/* YES / NO bars */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-accent font-medium">YES {formatPrice(market.yesPrice)}</span>
                      <span className="text-destructive font-medium">NO {formatPrice(market.noPrice)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                      <div className="bg-accent h-full transition-all" style={{ width: `${market.yesPrice * 100}%` }} />
                      <div className="bg-destructive h-full transition-all" style={{ width: `${market.noPrice * 100}%` }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {formatVolume(market.volume)}
                    </span>
                    <span className={`flex items-center gap-0.5 ${market.change24h >= 0 ? "text-accent" : "text-destructive"}`}>
                      {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {market.change24h > 0 ? "+" : ""}{market.change24h}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No markets found.</p>
        )}
      </div>
    </div>
  );
}
