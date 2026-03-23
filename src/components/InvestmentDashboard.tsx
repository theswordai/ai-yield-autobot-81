import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, Target, PieChart } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { MiniKChart } from "./MiniKChart";
import { useI18n } from "@/hooks/useI18n";
interface InvestmentDashboardProps {
  principalAfterFee: number;
  aprPercent: number;
  expectedEarnings: number;
  lockDays: number;
  lockChoice: string;
}
export function InvestmentDashboard({
  principalAfterFee,
  aprPercent,
  expectedEarnings,
  lockDays,
  lockChoice
}: InvestmentDashboardProps) {
  const { t } = useI18n();
  const fmt = (n: number) => n.toLocaleString(undefined, {
    maximumFractionDigits: 2
  });

  // 收益趋势数据 - 使用复利算法
  const earningsTrend = useMemo(() => {
    const points = 12;
    // 日复利公式: FV = P × (1 + APR/365)^days
    const dailyRate = aprPercent / 100 / 365;
    
    return Array.from({
      length: points
    }, (_, i) => {
      const days = Math.round(lockDays / points * (i + 1));
      // 复利计算到期总金额
      const total = principalAfterFee * Math.pow(1 + dailyRate, days);
      const earnings = total - principalAfterFee;
      return {
        day: days,
        earnings: parseFloat(earnings.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      };
    });
  }, [principalAfterFee, aprPercent, lockDays]);

  // 投资分布数据
  const distributionData = useMemo(() => [{
    name: t("staking.principal"),
    value: principalAfterFee,
    color: "hsl(var(--primary))"
  }, {
    name: t("staking.expectedReturns"),
    value: expectedEarnings,
    color: "hsl(var(--accent))"
  }], [principalAfterFee, expectedEarnings, t]);

  // 锁仓期对比数据 - 使用新的 APR 值
  const lockPeriodData = useMemo(() => [{
    period: t("staking.lockPeriodOptions.3months"),
    apr: 50,
    apy: 64.82, // APY = (1 + 0.50/365)^365 - 1
    days: 90,
    active: lockChoice === "0"
  }, {
    period: t("staking.lockPeriodOptions.6months"),
    apr: 120,
    apy: 231.36, // APY = (1 + 1.20/365)^365 - 1
    days: 180,
    active: lockChoice === "1"
  }, {
    period: t("staking.lockPeriodOptions.1year"),
    apr: 280,
    apy: 1526.99, // APY = (1 + 2.80/365)^365 - 1
    days: 365,
    active: lockChoice === "2"
  }], [lockChoice, t]);
  return <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* 投资概览 */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            {t("staking.investmentOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("staking.investmentPrincipal")}</p>
              <p className="text-lg font-bold">${fmt(principalAfterFee)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("staking.expectedReturns")}</p>
              <p className="text-lg font-bold text-accent">+${fmt(expectedEarnings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("staking.annualRate")}</p>
              <p className="text-lg font-bold text-primary">{aprPercent.toFixed(2)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("staking.lockDays")}</p>
              <p className="text-lg font-bold">{lockDays}{t("staking.day")}</p>
            </div>
          </div>
          <div className="pt-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {t("staking.totalReturns")}: ${fmt(principalAfterFee + expectedEarnings)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 锁仓期对比 */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("staking.lockPeriodComparison")}
            </CardTitle>
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">3 Tier Strategy</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lockPeriodData.map((item, index) => {
            const maxApr = Math.max(...lockPeriodData.map(d => d.apr));
            const fillPercent = (item.apr / maxApr) * 100;
            return (
              <div
                key={index}
                className={`rounded-xl p-4 transition-all ${
                  item.active
                    ? 'border-2 border-primary/60 bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.15)]'
                    : 'border border-border/40 bg-background/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{item.period}</span>
                    {item.active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-primary">{item.apy}% <span className="text-muted-foreground text-xs">APY</span></span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>APR: {item.apr}%</span>
                  <span>{item.days} {t("staking.day")}</span>
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground space-y-1">
            <p>💡 {t("staking.aprExplain")}</p>
            <p>🚀 {t("staking.apyExplain")}</p>
          </div>
        </CardContent>
      </Card>

      {/* 收益趋势图 */}
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            {t("staking.returnsGrowthTrend")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsTrend}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value, index) => {
                    if (index === 0) return "day 0";
                    if (index === earningsTrend.length - 1) return "last day";
                    return "";
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area type="monotone" dataKey="earnings" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#earningsGradient)" />
                <Tooltip content={({
                active,
                payload,
                label
              }) => {
                if (active && payload && payload.length) {
                  return <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{t("staking.day")} {label}</p>
                          <p className="text-sm text-accent">{t("staking.cumulativeReturns")}: ${payload[0].value}</p>
                        </div>;
                }
                return null;
              }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>;
}