/**
 * Portfolio Snapshot Generator (Deterministic / Append-Only)
 * ----------------------------------------------------------
 * Generates an immutable, auditable time-series of portfolio snapshots
 * for the USD.ONLINE Asset Management Dashboard.
 *
 * Design principles:
 *  - Append-only: snapshots are derived from (inceptionTs + index), so the
 *    same index always produces the same {timestamp, total_value, pnl, ...}.
 *  - Deterministic: a seeded Mulberry32 PRNG drives all variance — identical
 *    inputs always yield identical historical curves (audit-friendly).
 *  - Past values are NEVER recalculated. New data is only appended at the
 *    head (current time).
 *
 * Realism layer (v2):
 *  - Box–Muller normal noise (replaces uniform-sum approximation)
 *  - GARCH-lite volatility clustering (σ_t = 0.7·σ_{t-1} + 0.3·baseVol)
 *  - Event-day jumps (~5% probability, ±3%–6% shock)
 *  - Per-asset price walks (Entry/Mark derive from same deterministic seed)
 *  - Time-varying strategy APRs / Sharpes (gentle ±8% sinusoidal drift)
 *  - Append-only trade tape (recent fills/rebalances)
 */

export interface PortfolioSnapshot {
  timestamp: number;          // unix seconds
  total_value: number;        // AUM in USD
  pnl: number;                // cumulative PnL vs initial AUM
  pnl_period: number;         // delta vs previous snapshot
  roi: number;                // cumulative ROI %
  drawdown: number;           // current drawdown % from running peak
}

// Fixed inception — never change this; it anchors all historical data.
// 2025-08-01 00:00:00 UTC
export const INCEPTION_TS = 1754006400;
export const INITIAL_AUM = 12_500_000;  // $12.5M starting AUM
export const SNAPSHOT_INTERVAL_SEC = 86400; // daily

// Target ~260% annualized geometric return
const TARGET_ANNUAL = 2.60;
const DAILY_DRIFT = Math.log(1 + TARGET_ANNUAL) / 365;
const BASE_VOL = 0.026;        // ~2.6% daily baseline volatility
const VOL_PERSISTENCE = 0.70;  // GARCH-lite memory coefficient
const EVENT_PROB = 0.05;       // 5% of days are "event days"

// Mulberry32 — small, fast, deterministic PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash an integer into a uniform [0,1) — single-shot deterministic draw.
function hashU(n: number): number {
  return mulberry32(n | 0)();
}

// Box–Muller standard normal (deterministic given seed pair).
function normal(seedA: number, seedB: number): number {
  const u1 = Math.max(1e-9, hashU(seedA));
  const u2 = hashU(seedB);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Walk the deterministic AUM path day-by-day and return both the full
 * series and the final state. Pure function of the day count.
 */
function walkPath(totalIndex: number) {
  const values: number[] = new Array(totalIndex + 1);
  values[0] = INITIAL_AUM;
  let value = INITIAL_AUM;
  let sigma = BASE_VOL;

  for (let i = 1; i <= totalIndex; i++) {
    // Volatility clustering (GARCH-lite)
    const shock = Math.abs(normal(i * 9176 + 13, i * 31337 + 7));
    sigma = VOL_PERSISTENCE * sigma + (1 - VOL_PERSISTENCE) * BASE_VOL * (0.6 + shock * 0.5);

    const z = normal(i * 2654435761, i * 40503 + 1);
    let ret = DAILY_DRIFT + sigma * z;

    // Event-day jump (fat tail)
    if (hashU(i * 7919 + 101) < EVENT_PROB) {
      const sign = hashU(i * 6113 + 17) < 0.45 ? -1 : 1; // skewed slightly positive
      const mag = 0.03 + hashU(i * 5197 + 29) * 0.03;    // 3%–6%
      ret += sign * mag;
    }

    // Hard floor on single-day loss to avoid pathological prints
    if (ret < -0.18) ret = -0.18;

    value = value * (1 + ret);
    values[i] = value;
  }
  return values;
}

/**
 * Generate the full immutable history from inception up to "now".
 */
export function generateSnapshots(opts?: {
  rangeDays?: number; // 0 = full history
}): PortfolioSnapshot[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const totalIndex = Math.max(
    1,
    Math.floor((nowSec - INCEPTION_TS) / SNAPSHOT_INTERVAL_SEC),
  );
  const fromIndex = opts?.rangeDays
    ? Math.max(0, totalIndex - opts.rangeDays)
    : 0;

  const values = walkPath(totalIndex);
  const out: PortfolioSnapshot[] = [];
  let peak = values[0];

  for (let i = 0; i <= totalIndex; i++) {
    if (values[i] > peak) peak = values[i];
    if (i >= fromIndex) {
      const prev = i > 0 ? values[i - 1] : values[i];
      out.push({
        timestamp: INCEPTION_TS + i * SNAPSHOT_INTERVAL_SEC,
        total_value: values[i],
        pnl: values[i] - INITIAL_AUM,
        pnl_period: values[i] - prev,
        roi: ((values[i] - INITIAL_AUM) / INITIAL_AUM) * 100,
        drawdown: peak > 0 ? ((values[i] - peak) / peak) * 100 : 0,
      });
    }
  }
  return out;
}

export interface PortfolioMetrics {
  totalValue: number;
  initialValue: number;
  pnl: number;
  pnlRealized: number;
  pnlUnrealized: number;
  realizedRatio: number;
  roi: number;
  maxDrawdown: number;
  sharpe: number;
  winRate: number;
  positions: number;
  followersProfit: number;
  change24hAbs: number;
  change24hPct: number;
}

export function computeMetrics(snapshots: PortfolioSnapshot[]): PortfolioMetrics {
  if (snapshots.length === 0) {
    return {
      totalValue: INITIAL_AUM,
      initialValue: INITIAL_AUM,
      pnl: 0,
      pnlRealized: 0,
      pnlUnrealized: 0,
      realizedRatio: 0.62,
      roi: 0,
      maxDrawdown: 0,
      sharpe: 0,
      winRate: 0,
      positions: 0,
      followersProfit: 0,
      change24hAbs: 0,
      change24hPct: 0,
    };
  }
  const last = snapshots[snapshots.length - 1];
  const first = snapshots[0];

  // Daily returns
  const rets: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1].total_value;
    rets.push((snapshots[i].total_value - prev) / prev);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / Math.max(1, rets.length);
  const variance =
    rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length);
  const std = Math.sqrt(variance);
  // Annualize daily mean/std → sharpe (rf assumed 0)
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(365) : 0;

  // Max drawdown over window
  let peak = first.total_value;
  let maxDd = 0;
  for (const s of snapshots) {
    if (s.total_value > peak) peak = s.total_value;
    const dd = (s.total_value - peak) / peak;
    if (dd < maxDd) maxDd = dd;
  }

  const wins = rets.filter((r) => r > 0).length;
  const winRate = rets.length > 0 ? (wins / rets.length) * 100 : 0;

  // 24h change = last snapshot vs previous
  const prevLast = snapshots.length > 1 ? snapshots[snapshots.length - 2] : first;
  const change24hAbs = last.total_value - prevLast.total_value;
  const change24hPct = (change24hAbs / prevLast.total_value) * 100;

  // Realized/unrealized ratio drifts deterministically in 0.55–0.72
  const dayIdx = Math.floor((last.timestamp - INCEPTION_TS) / SNAPSHOT_INTERVAL_SEC);
  const realizedRatio = 0.55 + hashU(dayIdx * 1031 + 991) * 0.17;

  const pnl = last.total_value - first.total_value;
  return {
    totalValue: last.total_value,
    initialValue: first.total_value,
    pnl,
    pnlRealized: pnl * realizedRatio,
    pnlUnrealized: pnl * (1 - realizedRatio),
    realizedRatio,
    roi: (pnl / first.total_value) * 100,
    maxDrawdown: maxDd * 100,
    sharpe,
    winRate,
    positions: 14,
    followersProfit: pnl * 4.7,
    change24hAbs,
    change24hPct,
  };
}

// Static asset allocation (would normally come from on-chain reads).
export const ASSET_ALLOCATION = [
  { symbol: "BTC", weight: 38, color: "hsl(var(--primary))" },
  { symbol: "ETH", weight: 24, color: "hsl(var(--accent))" },
  { symbol: "SOL", weight: 12, color: "hsl(280 80% 60%)" },
  { symbol: "USDV", weight: 18, color: "hsl(160 70% 45%)" },
  { symbol: "BNB", weight: 8, color: "hsl(45 90% 55%)" },
];

// ---------------------------------------------------------------------------
// Deterministic per-asset price walks
// ---------------------------------------------------------------------------
interface AssetSpec {
  symbol: string;
  basePrice: number;        // price at inception
  annualDrift: number;      // expected annual return
  dailyVol: number;         // daily vol
  decimals: number;
}

const ASSET_SPECS: Record<string, AssetSpec> = {
  "BTC/USDT":  { symbol: "BTC/USDT",  basePrice: 64200,  annualDrift: 0.55, dailyVol: 0.028, decimals: 0 },
  "ETH/USDT":  { symbol: "ETH/USDT",  basePrice: 3050,   annualDrift: 0.48, dailyVol: 0.034, decimals: 0 },
  "SOL/USDT":  { symbol: "SOL/USDT",  basePrice: 152,    annualDrift: 0.85, dailyVol: 0.052, decimals: 2 },
  "BNB/USDT":  { symbol: "BNB/USDT",  basePrice: 565,    annualDrift: 0.42, dailyVol: 0.030, decimals: 0 },
  "ETH/BTC":   { symbol: "ETH/BTC",   basePrice: 0.0481, annualDrift: -0.05,dailyVol: 0.018, decimals: 4 },
  "USDV-LP":   { symbol: "USDV-LP",   basePrice: 1.0,    annualDrift: 0.08, dailyVol: 0.0006, decimals: 4 },
  "USDT-CASH": { symbol: "USDT-CASH", basePrice: 1.0,    annualDrift: 0.0,  dailyVol: 0.0,    decimals: 4 },
};

function symbolSeed(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Price of `symbol` at a given day index (deterministic). */
export function priceAt(symbol: string, dayIndex: number): number {
  const spec = ASSET_SPECS[symbol];
  if (!spec) return 0;
  if (dayIndex <= 0 || spec.dailyVol === 0) return spec.basePrice;
  const drift = Math.log(1 + spec.annualDrift) / 365;
  const seedBase = symbolSeed(spec.symbol);
  let p = spec.basePrice;
  for (let i = 1; i <= dayIndex; i++) {
    const z = normal(seedBase ^ (i * 2654435761), seedBase ^ (i * 40503 + 11));
    p = p * Math.exp(drift - 0.5 * spec.dailyVol ** 2 + spec.dailyVol * z);
  }
  return p;
}

export function formatPrice(symbol: string, price: number): string {
  const spec = ASSET_SPECS[symbol];
  const decimals = spec?.decimals ?? 2;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ---------------------------------------------------------------------------
// Strategies (with gentle time-varying APR/Sharpe)
// ---------------------------------------------------------------------------
const STRATEGY_DEFS = [
  { name: "Cross-chain Alpha", aprBase: 142.0, sharpeBase: 2.31, weight: 32 },
  { name: "AI Rotation",       aprBase: 208.5, sharpeBase: 1.94, weight: 28 },
  { name: "Staking Vault",     aprBase: 91.0,  sharpeBase: 3.42, weight: 24 },
  { name: "Delta-Neutral MM",  aprBase: 113.0, sharpeBase: 2.78, weight: 16 },
];

export interface StrategyView {
  name: string;
  apr: number;
  sharpe: number;
  weight: number;
  status: "live" | "paused";
}

export function getStrategies(): StrategyView[] {
  const dayIdx = Math.max(
    0,
    Math.floor((Date.now() / 1000 - INCEPTION_TS) / SNAPSHOT_INTERVAL_SEC),
  );
  return STRATEGY_DEFS.map((s, idx) => {
    const phase = (dayIdx + idx * 7) / 14;
    const aprMul = 1 + 0.08 * Math.sin(phase);
    const shMul  = 1 + 0.05 * Math.cos(phase + idx);
    // very rare pause (~1.5%)
    const paused = hashU(dayIdx * 311 + idx * 97) < 0.015 && idx !== 2;
    return {
      name: s.name,
      apr: +(s.aprBase * aprMul).toFixed(1),
      sharpe: +(s.sharpeBase * shMul).toFixed(2),
      weight: s.weight,
      status: paused ? "paused" : "live",
    };
  });
}

// Backwards-compatible static export (callers that import STRATEGIES still work).
export const STRATEGIES = getStrategies();

// ---------------------------------------------------------------------------
// Positions — entry price = priceAt(today - entryDaysAgo); mark = priceAt(today)
// ---------------------------------------------------------------------------
export interface PositionSpec {
  id: string;
  asset: string;
  weight: number;       // % of AUM
  entryDaysAgo: number; // when the position was opened
}

export const POSITIONS: PositionSpec[] = [
  { id: "P-0142", asset: "BTC/USDT",  weight: 32, entryDaysAgo: 38 },
  { id: "P-0138", asset: "ETH/USDT",  weight: 22, entryDaysAgo: 26 },
  { id: "P-0135", asset: "SOL/USDT",  weight: 12, entryDaysAgo: 19 },
  { id: "P-0131", asset: "BNB/USDT",  weight: 8,  entryDaysAgo: 14 },
  { id: "P-0128", asset: "ETH/BTC",   weight: 6,  entryDaysAgo: 9  },
  { id: "P-0124", asset: "USDV-LP",   weight: 14, entryDaysAgo: 52 },
  { id: "P-0001", asset: "USDT-CASH", weight: 6,  entryDaysAgo: 0  },
];

export function todayIndex(): number {
  return Math.max(
    0,
    Math.floor((Date.now() / 1000 - INCEPTION_TS) / SNAPSHOT_INTERVAL_SEC),
  );
}

export interface PositionLive {
  id: string;
  asset: string;
  weight: number;
  entry: number;
  mark: number;
  pnlPct: number;
}

export function getLivePositions(totalAum: number): PositionLive[] {
  const day = todayIndex();
  return POSITIONS.map((p) => {
    const mark = priceAt(p.asset, day);
    const entry = priceAt(p.asset, Math.max(0, day - p.entryDaysAgo));
    const pnlPct = entry > 0 ? ((mark - entry) / entry) * 100 : 0;
    return { id: p.id, asset: p.asset, weight: p.weight, entry, mark, pnlPct };
  });
}

// ---------------------------------------------------------------------------
// Recent trade tape (deterministic, append-only)
// ---------------------------------------------------------------------------
export interface TradeEvent {
  ts: number;             // unix seconds
  strategy: string;
  action: "OPEN" | "CLOSE" | "REDUCE" | "ADD" | "REINVEST";
  asset: string;
  qty: number;
  price: number;
  pnl: number | null;     // null for OPEN
}

// Note: USDV-LP intentionally excluded from trade tape (per product decision — do not re-add).
const TRADE_ASSETS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ETH/BTC"];
const TRADE_STRATS = STRATEGY_DEFS.map((s) => s.name);
const TRADE_ACTIONS: TradeEvent["action"][] = ["OPEN", "CLOSE", "REDUCE", "ADD", "REINVEST"];

// ---------------------------------------------------------------------------
// Range stats + sparkline helpers
// ---------------------------------------------------------------------------
export interface RangeStats {
  rangeReturnPct: number;
  high: number;
  low: number;
  highTs: number;
  lowTs: number;
  volPct: number;     // annualized vol %
  sharpe: number;
  maxDdPct: number;
}

export function computeRangeStats(snapshots: PortfolioSnapshot[]): RangeStats {
  if (snapshots.length === 0) {
    return { rangeReturnPct: 0, high: 0, low: 0, highTs: 0, lowTs: 0, volPct: 0, sharpe: 0, maxDdPct: 0 };
  }
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  let high = first.total_value, low = first.total_value, highTs = first.timestamp, lowTs = first.timestamp;
  let peak = first.total_value, maxDd = 0;
  const rets: number[] = [];
  for (let i = 0; i < snapshots.length; i++) {
    const s = snapshots[i];
    if (s.total_value > high) { high = s.total_value; highTs = s.timestamp; }
    if (s.total_value < low)  { low  = s.total_value; lowTs  = s.timestamp; }
    if (s.total_value > peak) peak = s.total_value;
    const dd = (s.total_value - peak) / peak;
    if (dd < maxDd) maxDd = dd;
    if (i > 0) {
      const prev = snapshots[i - 1].total_value;
      rets.push((s.total_value - prev) / prev);
    }
  }
  const mean = rets.reduce((a, b) => a + b, 0) / Math.max(1, rets.length);
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length);
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(365) : 0;
  return {
    rangeReturnPct: ((last.total_value - first.total_value) / first.total_value) * 100,
    high, low, highTs, lowTs,
    volPct: std * Math.sqrt(365) * 100,
    sharpe,
    maxDdPct: maxDd * 100,
  };
}

/** Tiny sparkline series for KPI cards — returns last N daily values. */
export function getSparkline(days = 14): number[] {
  const total = todayIndex();
  const values = walkPath(total);
  const start = Math.max(0, values.length - days);
  return values.slice(start);
}

/**
 * Generate the most recent N trade events, ending at "now". The same wall-clock
 * day always produces the same tape (append-only).
 */
export function generateRecentTrades(count = 10): TradeEvent[] {
  const day = todayIndex();
  const out: TradeEvent[] = [];
  // Generate ~3 events per day, walk backwards until we have `count`.
  let d = day;
  let slot = 0;
  while (out.length < count && d >= 0) {
    const eventsToday = 2 + Math.floor(hashU(d * 521 + 11) * 3); // 2–4
    for (let k = eventsToday - 1; k >= 0 && out.length < count; k--) {
      const seed = d * 100003 + k * 17;
      const asset = TRADE_ASSETS[Math.floor(hashU(seed + 1) * TRADE_ASSETS.length)];
      const strategy = TRADE_STRATS[Math.floor(hashU(seed + 2) * TRADE_STRATS.length)];
      const action = TRADE_ACTIONS[Math.floor(hashU(seed + 3) * TRADE_ACTIONS.length)];
      const price = priceAt(asset, d);
      // Quantity sized to a small fraction of AUM
      const notional = INITIAL_AUM * (0.004 + hashU(seed + 4) * 0.012); // $50k–$200k-ish
      const qty = notional / Math.max(price, 0.0001);
      const pnl =
        action === "OPEN"
          ? null
          : (hashU(seed + 5) - 0.32) * notional * 0.18; // skewed positive
      // Hour/minute within the day
      const hour = Math.floor(hashU(seed + 6) * 24);
      const minute = Math.floor(hashU(seed + 7) * 60);
      const ts = INCEPTION_TS + d * SNAPSHOT_INTERVAL_SEC + hour * 3600 + minute * 60;
      out.push({ ts, strategy, action, asset, qty, price, pnl });
      slot++;
    }
    d--;
  }
  // Newest first
  return out.sort((a, b) => b.ts - a.ts).slice(0, count);
}
