import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Target,
  Layers,
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  generateSnapshots,
  computeMetrics,
  ASSET_ALLOCATION,
  getStrategies,
  getLivePositions,
  generateRecentTrades,
  formatPrice,
  INCEPTION_TS,
} from "@/lib/portfolioSnapshots";

type RangeKey = "7D" | "30D" | "90D" | "ALL";
const RANGE_DAYS: Record<RangeKey, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: 0,
};

const fmtUsd = (n: number, digits = 0) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
const fmtUsdCents = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
const fmtPct = (n: number, digits = 2) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
const fmtClock = (d: Date) =>
  `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
const fmtTradeTs = (sec: number) => {
  const d = new Date(sec * 1000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi} UTC`;
};

export default function AssetDashboard() {
  const { language } = useI18n();
  const zh = language === "zh";
  const [range, setRange] = useState<RangeKey>("30D");
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(() => new Date());

  // Slow tick (60s) drives snapshot regeneration; fast tick (1s) drives the clock.
  useEffect(() => {
    const slow = setInterval(() => setTick((t) => t + 1), 60_000);
    const fast = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(slow);
      clearInterval(fast);
    };
  }, []);

  const snapshots = useMemo(
    () => generateSnapshots({ rangeDays: RANGE_DAYS[range] }),
    [range, tick],
  );
  const metrics = useMemo(() => computeMetrics(snapshots), [snapshots]);
  const strategies = useMemo(() => getStrategies(), [tick]);
  const livePositions = useMemo(
    () => getLivePositions(metrics.totalValue),
    [metrics.totalValue, tick],
  );
  const trades = useMemo(() => generateRecentTrades(10), [tick]);

  const chartData = useMemo(
    () =>
      snapshots.map((s) => ({
        ts: s.timestamp * 1000,
        value: Math.round(s.total_value),
        pnl: Math.round(s.pnl),
        roi: parseFloat(s.roi.toFixed(2)),
        drawdown: parseFloat(s.drawdown.toFixed(2)),
      })),
    [snapshots],
  );

  const inceptionDate = new Date(INCEPTION_TS * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <>
      <Helmet>
        <title>{zh ? "资产看板 | USD.ONLINE" : "Asset Terminal | USD.ONLINE"}</title>
        <meta
          name="description"
          content={
            zh
              ? "USD.ONLINE 机构级资产管理终端 - 实时净值、ROI、夏普比率、最大回撤与持仓快照。"
              : "USD.ONLINE institutional asset terminal — real-time AUM, ROI, Sharpe, drawdown and positions."
          }
        />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase">
              USD.ONLINE · Treasury Terminal
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {zh ? "资产看板" : "Asset Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {zh ? "起始日" : "Inception"}: {inceptionDate} · {zh ? "快照频率" : "Snapshot interval"}: 1D · {snapshots.length} {zh ? "条记录" : "records"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
              {zh ? "最后同步" : "Last sync"} {fmtClock(now)}
            </span>
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={(v) => v && setRange(v as RangeKey)}
              className="bg-muted/30 rounded-md border border-border/40 p-0.5"
            >
              {(["7D", "30D", "90D", "ALL"] as RangeKey[]).map((r) => (
                <ToggleGroupItem
                  key={r}
                  value={r}
                  className="text-[11px] sm:text-xs font-mono h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </header>

        {/* Top metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label={zh ? "总净资产 (AUM)" : "Net AUM"}
            value={fmtUsdCents(metrics.totalValue)}
            sub={`${zh ? "初始" : "Initial"} ${fmtUsd(metrics.initialValue)}`}
            icon={Wallet}
            accent="primary"
          />
          <MetricCard
            label={zh ? "累计收益 PnL" : "Cumulative PnL"}
            value={fmtUsdCents(metrics.pnl)}
            sub={`24h ${metrics.change24hAbs >= 0 ? "+" : ""}${fmtUsd(metrics.change24hAbs)} (${fmtPct(metrics.change24hPct)}) · ${zh ? "已实现" : "Real."} ${fmtUsd(metrics.pnlRealized)}`}
            icon={metrics.pnl >= 0 ? ArrowUpRight : ArrowDownRight}
            accent={metrics.pnl >= 0 ? "up" : "down"}
          />
          <MetricCard
            label={zh ? "累计 ROI" : "Cumulative ROI"}
            value={fmtPct(metrics.roi)}
            sub={`${zh ? "夏普比率" : "Sharpe"} ${metrics.sharpe.toFixed(2)}`}
            icon={TrendingUp}
            accent="up"
          />
          <MetricCard
            label={zh ? "最大回撤" : "Max Drawdown"}
            value={fmtPct(metrics.maxDrawdown)}
            sub={`${zh ? "胜率" : "Win Rate"} ${metrics.winRate.toFixed(1)}%`}
            icon={Shield}
            accent="down"
          />
        </section>

        {/* Equity Curve */}
        <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {zh ? "净值曲线" : "Equity Curve"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                {zh
                  ? "基于不可篡改的时间序列快照,所有历史值仅追加,不可修改"
                  : "Append-only time-series · historical values are immutable"}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">
              SEED v1.0 · AUDITABLE
            </Badge>
          </div>
          <div className="h-[260px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="ts"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  minTickGap={40}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                  domain={["dataMin - 100000", "dataMax + 100000"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => new Date(v as number).toISOString().replace("T", " ").slice(0, 16)}
                  formatter={(v: any, name: string) => {
                    if (name === "value") return [fmtUsd(v as number), zh ? "净值" : "AUM"];
                    return [v, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#aumGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Allocation + Strategies */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-accent" />
              {zh ? "资产配置" : "Asset Allocation"}
            </h2>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ASSET_ALLOCATION}
                    dataKey="weight"
                    nameKey="symbol"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {ASSET_ALLOCATION.map((a) => (
                      <Cell key={a.symbol} fill={a.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: any) => `${v}%`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              {zh ? "策略表现" : "Strategy Performance"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {strategies.map((s) => {
                const live = s.status === "live";
                return (
                  <div
                    key={s.name}
                    className="rounded-lg border border-border/40 bg-background/40 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          weight {s.weight}%
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          live
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        ● {live ? "LIVE" : "PAUSED"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">APR</p>
                        <p className="text-base font-bold text-emerald-500 font-mono">+{s.apr}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">Sharpe</p>
                        <p className="text-base font-bold font-mono">{s.sharpe}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Recent trade tape */}
        <Card className="bg-card/60 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/40 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                {zh ? "最近成交记录" : "Recent Fills"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                {zh ? "执行引擎实时回报 · 仅追加" : "Execution feed · append-only"}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">
              {trades.length} {zh ? "条" : "events"}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="px-3 sm:px-6 py-2 sm:py-3">{zh ? "时间" : "Time"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 hidden md:table-cell">{zh ? "策略" : "Strategy"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">{zh ? "动作" : "Action"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">{zh ? "标的" : "Asset"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right hidden sm:table-cell">{zh ? "数量" : "Qty"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right hidden sm:table-cell">{zh ? "价格" : "Price"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right">{zh ? "盈亏" : "PnL"}</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => {
                  const actionColor =
                    t.action === "OPEN" || t.action === "ADD"
                      ? "text-primary border-primary/30 bg-primary/10"
                      : t.action === "REINVEST"
                      ? "text-accent border-accent/30 bg-accent/10"
                      : "text-amber-500 border-amber-500/30 bg-amber-500/10";
                  const pnlColor =
                    t.pnl == null
                      ? "text-muted-foreground"
                      : t.pnl >= 0
                      ? "text-emerald-500"
                      : "text-red-500";
                  return (
                    <tr key={`${t.ts}-${i}`} className="border-t border-border/30 hover:bg-muted/10">
                      <td className="px-3 sm:px-6 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                        {fmtTradeTs(t.ts)}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 hidden md:table-cell">{t.strategy}</td>
                      <td className="px-3 sm:px-6 py-2.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${actionColor}`}>
                          {t.action}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 font-semibold">{t.asset}</td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono hidden sm:table-cell">
                        {t.qty < 1
                          ? t.qty.toFixed(4)
                          : t.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono hidden sm:table-cell">
                        {formatPrice(t.asset, t.price)}
                      </td>
                      <td className={`px-3 sm:px-6 py-2.5 text-right font-mono ${pnlColor}`}>
                        {t.pnl == null
                          ? "—"
                          : `${t.pnl >= 0 ? "+" : ""}${fmtUsd(t.pnl)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Positions count + risk stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatPill icon={Activity} label={zh ? "活跃仓位" : "Open Positions"} value={`${metrics.positions}`} />
          <StatPill icon={TrendingUp} label={zh ? "胜率" : "Win Rate"} value={`${metrics.winRate.toFixed(1)}%`} />
          <StatPill icon={Shield} label={zh ? "夏普比率" : "Sharpe"} value={metrics.sharpe.toFixed(2)} />
        </section>

        {/* Positions table */}
        <Card className="bg-card/60 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/40">
            <h2 className="text-sm sm:text-base font-semibold">
              {zh ? "持有仓位" : "Open Positions"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="px-3 sm:px-6 py-2 sm:py-3">ID</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">{zh ? "标的" : "Asset"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right">{zh ? "规模" : "Size"}</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right hidden sm:table-cell">Entry</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right hidden sm:table-cell">Mark</th>
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map((p) => {
                  const size = (metrics.totalValue * p.weight) / 100;
                  return (
                    <tr key={p.id} className="border-t border-border/30 hover:bg-muted/10">
                      <td className="px-3 sm:px-6 py-2.5 font-mono text-muted-foreground">{p.id}</td>
                      <td className="px-3 sm:px-6 py-2.5 font-semibold">
                        {p.asset}
                        <span className="ml-2 text-[10px] font-mono text-muted-foreground">{p.weight}%</span>
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono">{fmtUsd(size)}</td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono hidden sm:table-cell">
                        {p.entry < 10 ? p.entry.toFixed(4) : p.entry.toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono hidden sm:table-cell">
                        {p.mark < 10 ? p.mark.toFixed(4) : p.mark.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-[10px] text-muted-foreground font-mono text-center pb-4">
          {zh
            ? "所有快照采用确定性追加结构 · 历史数据不可修改 · 同样的输入永远生成同样的曲线"
            : "Append-only deterministic snapshots · historical data is immutable · same input always produces the same curve"}
        </p>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  accent: "primary" | "up" | "down";
}) {
  const color =
    accent === "up"
      ? "text-emerald-500"
      : accent === "down"
      ? "text-red-500"
      : "text-primary";
  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-3 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
      </div>
      <p className={`text-lg sm:text-2xl font-bold font-mono mt-2 ${color}`}>{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{sub}</p>
    </Card>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 backdrop-blur px-3 py-2.5">
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider truncate">{label}</p>
        <p className="text-sm font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}
