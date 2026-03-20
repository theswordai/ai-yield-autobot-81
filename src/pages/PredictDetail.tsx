import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Clock, Droplets } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePolymarkets } from "@/hooks/usePolymarkets";
import { markets as fallbackMarkets, formatVolume, formatPrice } from "@/data/markets";
import type { Market } from "@/data/markets";

export default function PredictDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: liveMarkets } = usePolymarkets();
  const allMarkets = liveMarkets && liveMarkets.length > 0 ? liveMarkets : fallbackMarkets;

  const market = allMarkets.find((m) => m.id === id) || allMarkets[0];

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [outcome, setOutcome] = useState<"yes" | "no">("yes");
  const [shares, setShares] = useState("");

  const price = outcome === "yes" ? market.yesPrice : market.noPrice;
  const total = shares ? (parseFloat(shares) * price).toFixed(2) : "0.00";

  const relatedMarkets = useMemo(
    () => allMarkets.filter((m) => m.id !== market.id && m.category === market.category).slice(0, 3),
    [allMarkets, market]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-32">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {market.imageUrl && <img src={market.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                  <div>
                    <h1 className="text-xl font-bold text-foreground mb-2">{market.title}</h1>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{market.category}</Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Ends {new Date(market.endDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Big prices */}
                <div className="flex gap-8 mt-6">
                  <div>
                    <span className="text-xs text-muted-foreground">YES</span>
                    <p className="text-3xl font-bold text-accent">{formatPrice(market.yesPrice)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">NO</span>
                    <p className="text-3xl font-bold text-destructive">{formatPrice(market.noPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={market.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `${Math.round(v * 100)}¢`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="yes" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="YES" />
                      <Line type="monotone" dataKey="no" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="NO" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-accent font-medium mb-2">Bids</p>
                    {market.orderBook.bids.map((b, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-border/30">
                        <span className="text-accent">{formatPrice(b.price)}</span>
                        <span className="text-muted-foreground">{b.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-destructive font-medium mb-2">Asks</p>
                    {market.orderBook.asks.map((a, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-border/30">
                        <span className="text-destructive">{formatPrice(a.price)}</span>
                        <span className="text-muted-foreground">{a.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {market.description && (
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{market.description}</p></CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trade Panel */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Trade (Simulated)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-2">
                  <Button size="sm" variant={outcome === "yes" ? "default" : "outline"} onClick={() => setOutcome("yes")} className="flex-1">
                    YES {formatPrice(market.yesPrice)}
                  </Button>
                  <Button size="sm" variant={outcome === "no" ? "destructive" : "outline"} onClick={() => setOutcome("no")} className="flex-1">
                    NO {formatPrice(market.noPrice)}
                  </Button>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Shares</label>
                  <Input type="number" placeholder="0" value={shares} onChange={(e) => setShares(e.target.value)} className="bg-background" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-medium text-foreground">${total}</span>
                </div>

                <Button className="w-full" disabled={!shares || parseFloat(shares) <= 0}>
                  {side === "buy" ? "Buy" : "Sell"} {outcome.toUpperCase()} Shares
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">Paper trading only — no real funds</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Volume</span>
                  <span className="font-medium">{formatVolume(market.volume)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3" /> Liquidity</span>
                  <span className="font-medium">{formatVolume(market.liquidity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24h Change</span>
                  <span className={market.change24h >= 0 ? "text-accent" : "text-destructive"}>
                    {market.change24h > 0 ? "+" : ""}{market.change24h}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related */}
            {relatedMarkets.length > 0 && (
              <Card className="bg-card/80 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Related Markets</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {relatedMarkets.map((rm) => (
                    <div
                      key={rm.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/${location.pathname.split("/")[1]}/predict/${rm.id}`)}
                    >
                      <p className="text-xs font-medium text-foreground line-clamp-2">{rm.title}</p>
                      <div className="flex gap-3 mt-1 text-[10px]">
                        <span className="text-accent">YES {formatPrice(rm.yesPrice)}</span>
                        <span className="text-destructive">NO {formatPrice(rm.noPrice)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
