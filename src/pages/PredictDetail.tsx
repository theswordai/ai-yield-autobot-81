import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PageWrapper } from '@/components/PageWrapper';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets } from '@/hooks/usePolymarkets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, TrendingUp, Loader2, Droplets, Calendar, ExternalLink, Zap, Gift, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '@/hooks/useWeb3';
import { usePredictionAccount } from '@/hooks/usePredictionAccount';
import { callPredictionAction } from '@/lib/predictionAction';
import { toast } from '@/hooks/use-toast';

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

  const { account, connect } = useWeb3();
  const { data: acctData, loading: acctLoading, refresh } = usePredictionAccount(account);

  const [amount, setAmount] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [placing, setPlacing] = useState<number | null>(null);

  const marketOrders = useMemo(() =>
    (acctData?.orders || []).filter((o) => o.market_id === id),
  [acctData, id]);

  const marketPositions = useMemo(() =>
    (acctData?.positions || []).filter((p) => p.market_id === id),
  [acctData, id]);

  const balance = Number(acctData?.account?.balance ?? 0);
  const claimed = !!acctData?.account?.claimed_initial_balance_at;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await callPredictionAction("account.claim_initial_balance");
      toast({ title: language === 'zh' ? '已领取 10,000 模拟 USDV' : 'Claimed 10,000 simulated USDV' });
      await refresh();
    } catch (e: any) {
      toast({ title: language === 'zh' ? '领取失败' : 'Claim failed', description: e?.message, variant: 'destructive' });
    } finally {
      setClaiming(false);
    }
  };

  const handleTrade = async (outcomeIndex: number, price: number) => {
    if (!market) return;
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    if (num > balance) {
      toast({ title: language === 'zh' ? '余额不足' : 'Insufficient balance', variant: 'destructive' });
      return;
    }
    setPlacing(outcomeIndex);
    try {
      await callPredictionAction("trade.place", {
        market: {
          market_id: market.id,
          title: market.title,
          slug: market.slug,
          description: market.description,
          category: market.category,
          outcomes: market.outcomes,
          end_date: market.endDate || null,
          yes_price: market.yesPrice,
          no_price: market.noPrice,
          volume: market.volume,
          volume_24hr: market.volume24hr,
          liquidity: market.liquidity,
          image: market.image,
          icon: market.icon,
        },
        outcome_index: outcomeIndex,
        outcome_label: market.outcomes[outcomeIndex],
        amount: num,
        price: Math.max(0.01, Math.min(0.99, price)),
      });
      toast({ title: language === 'zh' ? '下单成功' : 'Trade placed' });
      setAmount('');
      await refresh();
    } catch (e: any) {
      toast({ title: language === 'zh' ? '下单失败' : 'Trade failed', description: e?.message, variant: 'destructive' });
    } finally {
      setPlacing(null);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (!market) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
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
  const numAmount = parseFloat(amount);
  const canTrade = !!account && claimed && numAmount > 0 && numAmount <= balance;

  return (
    <PageWrapper>
      <Helmet>
        <title>{market.title} | USD.ONLINE</title>
      </Helmet>
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-24">
        <Link to={`${langPrefix}/predict`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {language === 'zh' ? '返回市场' : 'Back to Markets'}
        </Link>

        {market.image && (
          <div className="rounded-xl overflow-hidden mb-6 h-40 sm:h-56 relative border border-border">
            <img src={market.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={<TrendingUp className="w-4 h-4" />} label={language === 'zh' ? '总交易量' : 'Volume'} value={formatVolume(market.volume)} />
                <StatBox icon={<TrendingUp className="w-4 h-4" />} label={language === 'zh' ? '24h交易量' : '24h Vol.'} value={formatVolume(market.volume24hr)} />
                <StatBox icon={<Droplets className="w-4 h-4" />} label={language === 'zh' ? '流动性' : 'Liquidity'} value={formatVolume(market.liquidity)} />
                <StatBox icon={<Calendar className="w-4 h-4" />} label={language === 'zh' ? '结束时间' : 'End Date'} value={market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A'} />
              </div>

              {market.description && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h2 className="text-sm font-semibold text-foreground mb-2">{language === 'zh' ? '详情' : 'Description'}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{market.description.slice(0, 1000)}</p>
                </div>
              )}

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

          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  FutureDAO {language === 'zh' ? '模拟交易' : 'Simulated Trading'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 border border-border p-2.5 flex gap-2 text-[11px] text-muted-foreground">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    {language === 'zh'
                      ? '这里使用的是站内模拟 USDV，非真实 USDT，不可提现，无任何真实资金流动。'
                      : 'Uses site-internal simulated USDV only. Not real USDT, not withdrawable, no real funds move.'}
                  </span>
                </div>

                {!account && (
                  <Button className="w-full" onClick={() => connect()}>
                    {language === 'zh' ? '连接钱包开始' : 'Connect Wallet'}
                  </Button>
                )}

                {account && (
                  <>
                    <div className="rounded-xl bg-muted p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                        {language === 'zh' ? '模拟 USDV 余额' : 'Simulated USDV'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {acctLoading && !acctData ? '...' : balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {!claimed && (
                      <Button onClick={handleClaim} disabled={claiming} className="w-full" variant="default">
                        {claiming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                        {language === 'zh' ? '领取 10,000 模拟 USDV' : 'Claim 10,000 simulated USDV'}
                      </Button>
                    )}

                    {claimed && (
                      <>
                        <Input
                          type="number"
                          placeholder={language === 'zh' ? '输入金额' : 'Enter amount'}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-10"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleTrade(0, market.yesPrice)}
                            className="font-bold bg-accent/20 text-accent hover:bg-accent/30 border-0"
                            disabled={!canTrade || placing !== null}
                          >
                            {placing === 0 && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                            {market.outcomes[0]} {yesPercent}¢
                          </Button>
                          <Button
                            onClick={() => handleTrade(1, market.noPrice)}
                            className="font-bold bg-destructive/20 text-destructive hover:bg-destructive/30 border-0"
                            disabled={!canTrade || placing !== null}
                          >
                            {placing === 1 && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
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
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {marketPositions.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {language === 'zh' ? '当前持仓' : 'Open Positions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {marketPositions.map((p) => {
                    const isYes = p.outcome_index === 0;
                    return (
                      <div key={`${p.market_id}-${p.outcome_index}`} className="flex justify-between items-center text-sm bg-muted rounded-lg px-3 py-2.5">
                        <Badge className={`text-xs border-0 ${isYes ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                          {p.outcome_label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {p.total_shares.toFixed(2)} {language === 'zh' ? '份' : 'shares'}
                        </span>
                        <span className="font-medium text-foreground">${p.total_amount.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">
                          @ {Math.round(p.avg_price * 100)}¢
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {marketOrders.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {language === 'zh' ? '订单历史' : 'Order History'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {marketOrders.slice(0, 20).map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{o.outcome_label}</Badge>
                        <span className="text-muted-foreground">{o.status}</span>
                      </div>
                      <div className="text-right">
                        <div>${Number(o.amount).toFixed(2)} @ {Math.round(Number(o.price) * 100)}¢</div>
                        {o.status !== 'open' && (
                          <div className={Number(o.pnl) >= 0 ? 'text-accent' : 'text-destructive'}>
                            PnL {Number(o.pnl) >= 0 ? '+' : ''}{Number(o.pnl).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
