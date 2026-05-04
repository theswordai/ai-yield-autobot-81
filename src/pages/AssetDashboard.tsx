import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  PieChart,
  Pie,
  Cell,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Shield,
  Target,
  Layers,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  Zap,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  generateSnapshots,
  computeMetrics,
  computeRangeStats,
  getSparkline,
  ASSET_ALLOCATION,
  getStrategies,
  getLivePositions,
  generateRecentTrades,
  formatPrice,
  INCEPTION_TS,
  INITIAL_AUM,
} from "@/lib/portfolioSnapshots";
import { Navbar } from "@/components/Navbar";

type RangeKey = "7D" | "30D" | "90D" | "ALL";
const RANGE_DAYS: Record<RangeKey, number> = { "7D": 7, "30D": 30, "90D": 90, ALL: 0 };

const fmtUsd = (n: number, digits = 0) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
const fmtUsdCents = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
const fmtUsdAbbr = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};
const fmtPct = (n: number, digits = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
const fmtClock = (d: Date) =>
  `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
const fmtTradeTs = (sec: number) => {
  const d = new Date(sec * 1000);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
};

// Deterministic pseudo-hash for "TX" column / SEED chip
const pseudoHash = (seed: number, len = 6) => {
  let h = (seed * 2654435761) >>> 0;
  let s = "";
  while (s.length < len) {
    h = (h * 1664525 + 1013904223) >>> 0;
    s += h.toString(16).padStart(8, "0");
  }
  return s.slice(0, len);
};

export default function AssetDashboard() {
  const { language } = useI18n();
  const zh = language === "zh";
  const [range, setRange] = useState<RangeKey>("30D");
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const slow = setInterval(() => setTick((t) => t + 1), 60_000);
    const fast = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(slow); clearInterval(fast); };
  }, []);

  const snapshots = useMemo(() => generateSnapshots({ rangeDays: RANGE_DAYS[range] }), [range, tick]);
  const metrics = useMemo(() => computeMetrics(snapshots), [snapshots]);
  const rangeStats = useMemo(() => computeRangeStats(snapshots), [snapshots]);
  const strategies = useMemo(() => getStrategies(), [tick]);
  const livePositions = useMemo(() => getLivePositions(metrics.totalValue), [metrics.totalValue, tick]);
  const trades = useMemo(() => generateRecentTrades(10), [tick]);
  const spark = useMemo(() => getSparkline(14).map((v, i) => ({ i, v })), [tick]);

  const chartData = useMemo(
    () =>
      snapshots.map((s) => ({
        ts: s.timestamp * 1000,
        value: s.total_value,
        roi: parseFloat(s.roi.toFixed(2)),
        drawdown: parseFloat(s.drawdown.toFixed(2)),
        ddArea: s.drawdown < 0 ? s.total_value : null,
      })),
    [snapshots],
  );

  const inceptionDate = new Date(INCEPTION_TS * 1000).toISOString().slice(0, 10);
  const blockNum = 42_180_000 + Math.floor((Date.now() - INCEPTION_TS * 1000) / 3000);
  const latency = 28 + (Math.floor(now.getTime() / 1000) % 22);
  const seedHash = useMemo(() => pseudoHash(snapshots.length + Math.floor(metrics.totalValue), 8), [snapshots.length, metrics.totalValue]);

  const tickFormatter = (v: number) => {
    const d = new Date(v);
    if (range === "7D") return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    if (range === "ALL") return `${d.getUTCFullYear().toString().slice(2)}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  };

  return (
    <>
      <Helmet>
        <title>{zh ? "资产看板 | USD.ONLINE" : "Asset Terminal | USD.ONLINE"}</title>
        <meta
          name="description"
          content={zh
            ? "USD.ONLINE 机构级资产管理终端 - 实时净值、ROI、夏普比率、最大回撤与持仓快照。"
            : "USD.ONLINE institutional asset terminal — real-time AUM, ROI, Sharpe, drawdown and positions."}
        />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl space-y-5 sm:space-y-7">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.22em] text-muted-foreground uppercase">
              USD.ONLINE · Treasury Terminal
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              {zh ? "资产看板" : "Asset Dashboard"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-mono tabular-nums">
              {zh ? "起始日" : "Inception"} {inceptionDate} · {zh ? "快照" : "Snapshots"} {snapshots.length} · 1D
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-2 py-1 rounded border border-border/40">
              <Hash className="w-3 h-3" /> {blockNum.toLocaleString()}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-2 py-1 rounded border border-border/40">
              <Zap className="w-3 h-3" /> {latency}ms
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
                  className="text-[11px] font-mono h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </header>

        {/* SECTION 01 — KPIs */}
        <SectionLabel index="01" title={zh ? "核心指标" : "Key Metrics"} />
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label={zh ? "总净资产 (AUM)" : "Net AUM"}
            value={fmtUsdCents(metrics.totalValue)}
            sub=""
            icon={Wallet}
            accent="primary"
            spark={spark}
          />
          <MetricCard
            label={zh ? "累计收益 PnL" : "Cumulative PnL"}
            value={fmtUsdCents(metrics.pnl)}
            sub={`24h ${metrics.change24hAbs >= 0 ? "+" : ""}${fmtUsdAbbr(metrics.change24hAbs)} (${fmtPct(metrics.change24hPct)})`}
            icon={metrics.pnl >= 0 ? ArrowUpRight : ArrowDownRight}
            accent={metrics.pnl >= 0 ? "up" : "down"}
            spark={spark}
          />
          <MetricCard
            label={zh ? "累计 ROI" : "Cumulative ROI"}
            value={fmtPct(metrics.roi)}
            sub={`${zh ? "夏普" : "Sharpe"} ${metrics.sharpe.toFixed(2)} · ${zh ? "胜率" : "Win"} ${metrics.winRate.toFixed(1)}%`}
            icon={TrendingUp}
            accent="up"
            spark={spark}
          />
          <MetricCard
            label={zh ? "最大回撤" : "Max Drawdown"}
            value={fmtPct(metrics.maxDrawdown)}
            sub={`σ ${rangeStats.volPct.toFixed(2)}% · ${zh ? "区间" : "Range"} ${fmtPct(rangeStats.maxDdPct)}`}
            icon={Shield}
            accent="down"
            spark={spark}
          />
        </section>

        {/* SECTION 02 — Equity Curve */}
        <SectionLabel index="02" title={zh ? "净值曲线" : "Equity Curve"} />
        <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6 overflow-hidden">
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div>
              <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {zh ? "净值曲线" : "Equity Curve"}
                <span className="text-[10px] font-mono text-muted-foreground font-normal">/ AUM · USD</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">SEED v1.0</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5">AUDITABLE</span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">
                SHA256 {seedHash}…
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 pb-3 border-b border-border/30">
            <StatChip label={zh ? "区间收益" : "Period"} value={fmtPct(rangeStats.rangeReturnPct)} positive={rangeStats.rangeReturnPct >= 0} />
            <StatChip label={zh ? "区间高" : "High"} value={fmtUsdAbbr(rangeStats.high)} accent />
            <StatChip label={zh ? "区间低" : "Low"} value={fmtUsdAbbr(rangeStats.low)} />
            <StatChip label={zh ? "波动率 σ" : "Vol σ"} value={`${rangeStats.volPct.toFixed(2)}%`} />
            <StatChip label="Sharpe" value={rangeStats.sharpe.toFixed(2)} />
          </div>

          <div className="h-[280px] sm:h-[360px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.38} />
                    <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 80% 60%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0 80% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.18} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="ts"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={tickFormatter}
                  minTickGap={range === "7D" ? 24 : 48}
                />
                <YAxis
                  yAxisId="aum"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v) => fmtUsdAbbr(v as number)}
                  domain={["dataMin - 100000", "dataMax + 100000"]}
                />
                <YAxis
                  yAxisId="roi"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  tickFormatter={(v) => `${v}%`}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.6 }}
                  content={<CurveTooltip zh={zh} initialAum={INITIAL_AUM} />}
                />
                <ReferenceLine
                  yAxisId="aum"
                  y={INITIAL_AUM}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: zh ? `初始 ${fmtUsdAbbr(INITIAL_AUM)}` : `Inception ${fmtUsdAbbr(INITIAL_AUM)}`,
                    position: "insideTopLeft",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                    fontFamily: "ui-monospace, monospace",
                  }}
                />
                <Area
                  yAxisId="aum"
                  type="monotone"
                  dataKey="ddArea"
                  stroke="none"
                  fill="url(#ddGrad)"
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="aum"
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.75}
                  fill="url(#aumGrad)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                />
                <Line
                  yAxisId="roi"
                  type="monotone"
                  dataKey="roi"
                  stroke="hsl(var(--accent))"
                  strokeWidth={1}
                  strokeOpacity={0.55}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={false}
                />
                <ReferenceDot
                  yAxisId="aum"
                  x={rangeStats.highTs * 1000}
                  y={rangeStats.high}
                  r={4}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  label={{
                    value: `HWM ${fmtUsdAbbr(rangeStats.high)}`,
                    position: "top",
                    fill: "hsl(var(--primary))",
                    fontSize: 10,
                    fontFamily: "ui-monospace, monospace",
                  }}
                />
                <ReferenceDot
                  yAxisId="aum"
                  x={rangeStats.lowTs * 1000}
                  y={rangeStats.low}
                  r={3}
                  fill="hsl(0 80% 60%)"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  label={{
                    value: `LWM ${fmtUsdAbbr(rangeStats.low)}`,
                    position: "bottom",
                    fill: "hsl(0 80% 60%)",
                    fontSize: 10,
                    fontFamily: "ui-monospace, monospace",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-primary" /> AUM
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-accent" /> ROI %
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-muted-foreground/60" /> Inception
              </span>
            </div>
            <span className="hidden sm:inline">{zh ? "最后同步" : "Last sync"} {fmtClock(now)}</span>
          </div>
        </Card>

        {/* SECTION 03 — Allocation + Strategies */}
        <SectionLabel index="03" title={zh ? "资产配置 · 策略" : "Allocation · Strategies"} />
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-accent" />
              {zh ? "资产配置" : "Asset Allocation"}
            </h2>
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ASSET_ALLOCATION}
                    dataKey="weight"
                    nameKey="symbol"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {ASSET_ALLOCATION.map((a) => (
                      <Cell key={a.symbol} fill={a.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">AUM</p>
                <p className="text-base font-bold font-mono tabular-nums">{fmtUsdAbbr(metrics.totalValue)}</p>
                
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {ASSET_ALLOCATION.map((a) => (
                <li key={a.symbol} className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ background: a.color }} />
                    <span className="font-semibold">{a.symbol}</span>
                  </span>
                  <span className="flex items-center gap-3 tabular-nums">
                    <span className="text-muted-foreground">{a.weight}%</span>
                    <span className="text-foreground/80 w-16 text-right">{fmtUsdAbbr(metrics.totalValue * a.weight / 100)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              {zh ? "策略表现" : "Strategy Performance"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {strategies.map((s, idx) => {
                const live = s.status === "live";
                const maxDd = -(2.4 + (idx * 1.7) % 6.2);
                const pnl30d = (s.apr / 12) * (metrics.totalValue * s.weight / 100) / 100;
                return (
                  <div
                    key={s.name}
                    className="relative rounded-lg border border-border/40 bg-background/40 p-3 overflow-hidden"
                  >
                    {/* weight progress bar */}
                    <div className="absolute top-0 left-0 h-0.5 bg-primary/70" style={{ width: `${s.weight * 2.5}%` }} />
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          weight {s.weight}%
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                          live
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                        {live ? "LIVE" : "PAUSED"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-mono">APR</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">+{s.apr}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-mono">Sharpe</p>
                        <p className="text-sm font-bold font-mono tabular-nums">{s.sharpe}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-mono">Max DD</p>
                        <p className="text-sm font-bold text-rose-400 font-mono tabular-nums">{maxDd.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-mono">30D PnL</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{fmtUsdAbbr(pnl30d)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* SECTION 04 — Recent fills */}
        <SectionLabel index="04" title={zh ? "成交记录" : "Execution Feed"} />
        <Card className="bg-card/60 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/40 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                {zh ? "最近成交记录" : "Recent Fills"}
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {trades.length} {zh ? "条" : "events"}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-[10px] uppercase font-mono text-muted-foreground bg-muted/30 backdrop-blur">
                  <th className="px-3 sm:px-6 py-2.5">{zh ? "时间" : "Time"}</th>
                  <th className="px-3 sm:px-6 py-2.5 hidden md:table-cell">{zh ? "策略" : "Strategy"}</th>
                  <th className="px-3 sm:px-6 py-2.5">{zh ? "动作" : "Action"}</th>
                  <th className="px-3 sm:px-6 py-2.5">{zh ? "标的" : "Asset"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden sm:table-cell">{zh ? "数量" : "Qty"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden sm:table-cell">{zh ? "价格" : "Price"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right">{zh ? "盈亏" : "PnL"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden lg:table-cell">TX</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => {
                  const actionColor =
                    t.action === "OPEN" ? "text-primary border-primary/30 bg-primary/10" :
                    t.action === "ADD" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                    t.action === "REINVEST" ? "text-accent border-accent/30 bg-accent/10" :
                    t.action === "CLOSE" ? "text-rose-400 border-rose-500/30 bg-rose-500/10" :
                    "text-amber-400 border-amber-500/30 bg-amber-500/10";
                  const pnlColor = t.pnl == null ? "text-muted-foreground" : t.pnl >= 0 ? "text-emerald-400" : "text-rose-400";
                  return (
                    <tr key={`${t.ts}-${i}`} className="group border-t border-border/30 hover:bg-muted/10 relative">
                      <td className="px-3 sm:px-6 py-2.5 font-mono text-muted-foreground whitespace-nowrap tabular-nums relative">
                        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/0 group-hover:bg-primary transition-colors" />
                        {fmtTradeTs(t.ts)}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 hidden md:table-cell">{t.strategy}</td>
                      <td className="px-3 sm:px-6 py-2.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${actionColor}`}>{t.action}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 font-semibold font-mono">{t.asset}</td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums hidden sm:table-cell">
                        {t.qty < 1 ? t.qty.toFixed(4) : t.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums hidden sm:table-cell">
                        {formatPrice(t.asset, t.price)}
                      </td>
                      <td className={`px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums ${pnlColor}`}>
                        {t.pnl == null ? "—" : `${t.pnl >= 0 ? "+" : ""}${fmtUsdAbbr(t.pnl)}`}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono text-muted-foreground hidden lg:table-cell">
                        0x{pseudoHash(Math.floor(t.ts) + i, 4)}…{pseudoHash(Math.floor(t.ts) * 7 + i, 4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Positions summary pills */}
        <section className="grid grid-cols-3 gap-3">
          <StatPill icon={Activity} label={zh ? "活跃仓位" : "Open Positions"} value={`${metrics.positions}`} />
          <StatPill icon={TrendingUp} label={zh ? "胜率" : "Win Rate"} value={`${metrics.winRate.toFixed(1)}%`} />
          <StatPill icon={Shield} label={zh ? "夏普比率" : "Sharpe"} value={metrics.sharpe.toFixed(2)} />
        </section>

        {/* Positions table */}
        <Card className="bg-card/60 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/40">
            <h2 className="text-sm sm:text-base font-semibold">{zh ? "持有仓位" : "Open Positions"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="px-3 sm:px-6 py-2.5">ID</th>
                  <th className="px-3 sm:px-6 py-2.5">{zh ? "标的" : "Asset"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right">{zh ? "规模" : "Size"}</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden sm:table-cell">Entry</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden sm:table-cell">Mark</th>
                  <th className="px-3 sm:px-6 py-2.5 text-right hidden md:table-cell">PnL %</th>
                </tr>
              </thead>
              <tbody>
                {livePositions.map((p) => {
                  const size = (metrics.totalValue * p.weight) / 100;
                  const pnlColor = p.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400";
                  return (
                    <tr key={p.id} className="group border-t border-border/30 hover:bg-muted/10 relative">
                      <td className="px-3 sm:px-6 py-2.5 font-mono text-muted-foreground tabular-nums relative">
                        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/0 group-hover:bg-primary transition-colors" />
                        {p.id}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 font-semibold font-mono">
                        {p.asset}
                        <span className="ml-2 text-[10px] font-mono text-muted-foreground">{p.weight}%</span>
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums">{fmtUsdAbbr(size)}</td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums hidden sm:table-cell">
                        {formatPrice(p.asset, p.entry)}
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums hidden sm:table-cell">
                        {formatPrice(p.asset, p.mark)}
                      </td>
                      <td className={`px-3 sm:px-6 py-2.5 text-right font-mono tabular-nums hidden md:table-cell ${pnlColor}`}>
                        {fmtPct(p.pnlPct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3 -mb-2">
      <span className="text-[10px] font-mono text-muted-foreground/70 tabular-nums">{index}</span>
      <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-muted-foreground">{title}</span>
      <span className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
    </div>
  );
}

function StatChip({ label, value, positive, accent }: { label: string; value: string; positive?: boolean; accent?: boolean }) {
  const valColor =
    positive === true ? "text-emerald-400" :
    positive === false ? "text-rose-400" :
    accent ? "text-primary" : "text-foreground";
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase font-mono tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono font-semibold tabular-nums ${valColor}`}>{value}</span>
    </div>
  );
}

function CurveTooltip({ active, payload, label, zh, initialAum }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const dayDelta = p.value - initialAum;
  const positive = dayDelta >= 0;
  const d = new Date(p.ts);
  const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
  return (
    <div className="rounded-md border border-border/60 bg-card/95 backdrop-blur shadow-xl text-xs font-mono overflow-hidden min-w-[180px]">
      <div className={`h-0.5 ${positive ? "bg-emerald-400" : "bg-rose-400"}`} />
      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-muted-foreground">{dateStr}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{zh ? "净值" : "AUM"}</span>
          <span className="font-semibold tabular-nums">{`$${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">ROI</span>
          <span className={`font-semibold tabular-nums ${p.roi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {`${p.roi >= 0 ? "+" : ""}${p.roi.toFixed(2)}%`}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{zh ? "回撤" : "Drawdown"}</span>
          <span className={`font-semibold tabular-nums ${p.drawdown < -0.01 ? "text-rose-400" : "text-muted-foreground"}`}>
            {`${p.drawdown.toFixed(2)}%`}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-border/40">
          <span className="text-muted-foreground">Δ {zh ? "起始" : "Inception"}</span>
          <span className={`font-semibold tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
            {`${positive ? "+" : ""}$${Math.abs(dayDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label, value, sub, icon: Icon, accent, spark,
}: {
  label: string; value: string; sub: string; icon: any;
  accent: "primary" | "up" | "down";
  spark: { i: number; v: number }[];
}) {
  const color = accent === "up" ? "text-emerald-400" : accent === "down" ? "text-rose-400" : "text-primary";
  const stroke = accent === "up" ? "hsl(142 71% 45%)" : accent === "down" ? "hsl(0 80% 60%)" : "hsl(var(--primary))";
  const bar = accent === "up" ? "bg-emerald-400" : accent === "down" ? "bg-rose-400" : "bg-primary";
  return (
    <Card className="relative bg-card/60 backdrop-blur border-border/50 p-3 sm:p-5 overflow-hidden">
      <span className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-full ${bar}`} />
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
      </div>
      <p className={`text-lg sm:text-2xl font-bold font-mono tabular-nums mt-2 ${color}`}>{value}</p>
      <div className="flex items-end justify-between gap-2 mt-1">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate font-mono">{sub}</p>
        <div className="w-16 h-7 shrink-0 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sg-${accent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.25} fill={`url(#sg-${accent})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
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
        <p className="text-sm font-bold font-mono tabular-nums">{value}</p>
      </div>
    </div>
  );
}
