import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, Target, PieChart } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { MiniKChart } from "./MiniKChart";
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
  const fmt = (n: number) => n.toLocaleString(undefined, {
    maximumFractionDigits: 2
  });

  // 收益趋势数据
  const earningsTrend = useMemo(() => {
    const points = 12;
    const dailyRate = aprPercent / 100 / 365;
    return Array.from({
      length: points
    }, (_, i) => {
      const days = lockDays / points * (i + 1);
      const earnings = principalAfterFee * dailyRate * days;
      return {
        day: Math.round(days),
        earnings: parseFloat(earnings.toFixed(2)),
        total: parseFloat((principalAfterFee + earnings).toFixed(2))
      };
    });
  }, [principalAfterFee, aprPercent, lockDays]);

  // 投资分布数据
  const distributionData = useMemo(() => [{
    name: "本金",
    value: principalAfterFee,
    color: "hsl(var(--primary))"
  }, {
    name: "预期收益",
    value: expectedEarnings,
    color: "hsl(var(--accent))"
  }], [principalAfterFee, expectedEarnings]);

  // 锁仓期对比数据
  const lockPeriodData = useMemo(() => [{
    period: "3个月",
    apr: 91.25,
    days: 90,
    active: lockChoice === "0"
  }, {
    period: "6个月",
    apr: 146,
    days: 180,
    active: lockChoice === "1"
  }, {
    period: "1年",
    apr: 365,
    days: 365,
    active: lockChoice === "2"
  }], [lockChoice]);
  return <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* 投资概览 */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            投资概览
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">投资本金</p>
              <p className="text-lg font-bold">${fmt(principalAfterFee)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">预期收益</p>
              <p className="text-lg font-bold text-accent">+${fmt(expectedEarnings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">年化收益率</p>
              <p className="text-lg font-bold text-primary">{aprPercent.toFixed(2)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">锁仓天数</p>
              <p className="text-lg font-bold">{lockDays}天</p>
            </div>
          </div>
          <div className="pt-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              预期总回报: ${fmt(principalAfterFee + expectedEarnings)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 锁仓期对比 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            锁仓期对比
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lockPeriodData}>
                <XAxis dataKey="period" tick={{
                fontSize: 12
              }} />
                <YAxis tick={{
                fontSize: 12
              }} />
                <Bar dataKey="apr" fill="hsl(var(--muted))" radius={[2, 2, 0, 0]}>
                  {lockPeriodData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.active ? "hsl(var(--primary))" : "hsl(var(--muted))"} />)}
                </Bar>
                <Tooltip content={({
                active,
                payload
              }) => {
                if (active && payload && payload.length) {
                  return <div className="bg-card border rounded-lg p-2 shadow-lg">
                          <p className="text-sm">{payload[0].payload.period}</p>
                          <p className="text-sm text-primary">APR: {payload[0].value}%</p>
                        </div>;
                }
                return null;
              }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 收益趋势图 */}
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            收益增长趋势
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
                <Area type="monotone" dataKey="earnings" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#earningsGradient)" />
                <Tooltip content={({
                active,
                payload,
                label
              }) => {
                if (active && payload && payload.length) {
                  return <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">第 {label} 天</p>
                          <p className="text-sm text-accent">累积善意收益: ${payload[0].value}</p>
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