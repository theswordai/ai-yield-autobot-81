import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/hooks/useI18n';
import { usePolymarkets } from '@/hooks/usePolymarkets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_BALANCE = 10000;

export default function PredictDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  const langPrefix = language === 'zh' ? '/zh' : '/en';
  const { data: markets = [], isLoading } = usePolymarkets();
  const market = markets.find((m) => m.id === id);

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [positions, setPositions] = useState<{ side: 'YES' | 'NO'; amount: number; price: number }[]>([]);

  const handleTrade = (side: 'YES' | 'NO') => {
    const num = parseFloat(amount);
    if (!num || num <= 0 || num > balance || !market) return;
    const price = side === 'YES' ? market.yesPrice : market.noPrice;
    setBalance((b) => b - num);
    setPositions((p) => [...p, { side, amount: num, price }]);
    setAmount('');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="flex justify-center items-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="relative min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="text-muted-foreground">{language === 'zh' ? '未找到市场' : 'Market not found'}</p>
          <Link to={`${langPrefix}/predict`} className="text-primary underline mt-4 inline-block">
            {language === 'zh' ? '返回列表' : 'Back to list'}
          </Link>
        </div>
      </div>
    );
  }

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Helmet>
        <title>{market.title} | USD.ONLINE</title>
      </Helmet>
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-24 relative z-10">
        <Link to={`${langPrefix}/predict`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          {language === 'zh' ? '返回列表' : 'Back'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{market.category}</Badge>
                    <CardTitle className="text-lg sm:text-xl leading-tight">{market.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {market.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{market.description.slice(0, 500)}</p>
                )}

                {/* Probability */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-accent">YES {yesPercent}%</span>
                    <span className="text-destructive">NO {noPercent}%</span>
                  </div>
                  <div className="h-4 rounded-full bg-secondary overflow-hidden flex">
                    <div className="bg-accent h-full transition-all" style={{ width: `${yesPercent}%` }} />
                    <div className="bg-destructive h-full transition-all" style={{ width: `${noPercent}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">{language === 'zh' ? '交易量' : 'Volume'}</p>
                    <p className="text-sm font-semibold">${market.volume >= 1000000 ? `${(market.volume / 1000000).toFixed(1)}M` : `${(market.volume / 1000).toFixed(1)}K`}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">{language === 'zh' ? '结束时间' : 'End Date'}</p>
                    <p className="text-sm font-semibold">{market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-4">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="text-base">{language === 'zh' ? '模拟交易' : 'Paper Trading'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{language === 'zh' ? '虚拟余额' : 'Virtual Balance'}</p>
                  <p className="text-xl font-bold text-primary">${balance.toFixed(2)}</p>
                </div>

                <Input
                  type="number"
                  placeholder={language === 'zh' ? '输入金额' : 'Enter amount'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-card/50"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleTrade('YES')}
                    className="bg-accent hover:bg-accent/80 text-accent-foreground"
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  >
                    YES @ {yesPercent}¢
                  </Button>
                  <Button
                    onClick={() => handleTrade('NO')}
                    variant="destructive"
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  >
                    NO @ {noPercent}¢
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Positions */}
            {positions.length > 0 && (
              <Card className="bg-card/60 border-border">
                <CardHeader>
                  <CardTitle className="text-base">{language === 'zh' ? '持仓' : 'Positions'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {positions.map((pos, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-secondary/30 rounded-lg px-3 py-2">
                      <Badge variant={pos.side === 'YES' ? 'default' : 'destructive'} className="text-xs">
                        {pos.side}
                      </Badge>
                      <span>${pos.amount.toFixed(2)}</span>
                      <span className="text-muted-foreground">@ {Math.round(pos.price * 100)}¢</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
