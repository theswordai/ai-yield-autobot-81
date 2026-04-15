import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from '@/components/PageWrapper';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets } from '@/hooks/usePolymarkets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, TrendingUp, Loader2, Droplets, Calendar, ExternalLink, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_BALANCE = 10000;

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function PredictDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  const langPrefix = language === 'zh' ? '/zh' : '/en';
  const { data: markets = [], isLoading } = usePolymarkets();
  const market = markets.find((m) => m.id === id);

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [positions, setPositions] = useState<{ side: string; amount: number; price: number }[]>([]);

  const handleTrade = (side: string, price: number) => {
    const num = parseFloat(amount);
    if (!num || num <= 0 || num > balance) return;
    setBalance((b) => b - num);
    setPositions((p) => [...p, { side, amount: num, price }]);
    setAmount('');
  };

  if (isLoading) {
    return (
      <PageWrapper>
        
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (!market) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 pt-8 text-center">
          <p className="text-muted-foreground">{language === 'zh' ? '未找到市场' : 'Market not found'}</p>
          <Link to={`${langPrefix}/predict`} className="mt-4 inline-block text-primary hover:underline">
            {language === 'zh' ? '返回列表' : 'Back to list'}
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <PageWrapper>
      <Helmet>
        <title>{market.title} | USD.ONLINE</title>
      </Helmet>

      <main className="container mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-24">
        <Link to={`${langPrefix}/predict`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {language === 'zh' ? '返回市场' : 'Back to Markets'}
        </Link>

        {/* Banner */}
        {market.image && (
          <div className="rounded-xl overflow-hidden mb-6 h-40 sm:h-56 relative border border-border">
            <img src={market.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              {/* Title */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-12 h-12 shrink-0 rounded-xl">
                  <AvatarImage src={market.icon} alt="" className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-muted text-sm font-bold">{market.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">{market.category}</Badge>
                    {market.slug && (
                      <a href={`https://polymarket.com/event/${market.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold leading-tight text-foreground">{market.title}</h1>
                  {market.groupItemTitle && <p className="text-xs text-muted-foreground mt-1">{market.groupItemTitle}</p>}
                </div>
              </div>

              {/* Probability bar */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-accent">{market.outcomes[0]} {yesPercent}%</span>
                  <span className="text-destructive">{market.outcomes[1]} {noPercent}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full rounded-l-full transition-all duration-500 bg-accent" style={{ width: `${yesPercent}%` }} />
                  <div className="h-full rounded-r-full transition-all duration-500 bg-destructive" style={{ width: `${noPercent}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={<TrendingUp className="w-4 h-4" />} label={language === 'zh' ? '总交易量' : 'Volume'} value={formatVolume(market.volume)} />
                <StatBox icon={<TrendingUp className="w-4 h-4" />} label={language === 'zh' ? '24h交易量' : '24h Vol.'} value={formatVolume(market.volume24hr)} />
                <StatBox icon={<Droplets className="w-4 h-4" />} label={language === 'zh' ? '流动性' : 'Liquidity'} value={formatVolume(market.liquidity)} />
                <StatBox icon={<Calendar className="w-4 h-4" />} label={language === 'zh' ? '结束时间' : 'End Date'} value={market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A'} />
              </div>

              {/* Description */}
              {market.description && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h2 className="text-sm font-semibold text-foreground mb-2">{language === 'zh' ? '详情' : 'Description'}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{market.description.slice(0, 1000)}</p>
                </div>
              )}

              {/* Events */}
              {market.events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h2 className="text-sm font-semibold text-foreground mb-2">{language === 'zh' ? '相关事件' : 'Related Events'}</h2>
                  <div className="flex flex-wrap gap-2">
                    {market.events.map((e, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{e.title}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  {language === 'zh' ? '模拟交易' : 'Paper Trading'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-muted p-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{language === 'zh' ? '虚拟余额' : 'Virtual Balance'}</p>
                  <p className="text-2xl font-bold text-primary">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>

                <Input
                  type="number"
                  placeholder={language === 'zh' ? '输入金额' : 'Enter amount'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleTrade(market.outcomes[0], market.yesPrice)}
                    className="font-bold bg-accent/20 text-accent hover:bg-accent/30 border-0"
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  >
                    {market.outcomes[0]} {yesPercent}¢
                  </Button>
                  <Button
                    onClick={() => handleTrade(market.outcomes[1], market.noPrice)}
                    className="font-bold bg-destructive/20 text-destructive hover:bg-destructive/30 border-0"
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  >
                    {market.outcomes[1]} {noPercent}¢
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {[10, 50, 100, 500].map((v) => (
                    <Button key={v} variant="outline" size="sm" className="text-xs h-7" onClick={() => setAmount(String(v))}>
                      ${v}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Positions */}
            {positions.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{language === 'zh' ? '持仓记录' : 'Positions'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {positions.map((pos, i) => {
                    const isYes = pos.side === market.outcomes[0];
                    return (
                      <div key={i} className="flex justify-between items-center text-sm bg-muted rounded-lg px-3 py-2.5">
                        <Badge className={`text-xs border-0 ${isYes ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                          {pos.side}
                        </Badge>
                        <span className="font-medium text-foreground">${pos.amount.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">@ {Math.round(pos.price * 100)}¢</span>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground text-right">
                    {language === 'zh' ? '总投入' : 'Total'}: ${positions.reduce((s, p) => s + p.amount, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 text-center">
      <div className="flex justify-center mb-1 text-primary">{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
