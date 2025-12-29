import { NAVPoint, ModelState } from '../models/types';

export interface CalculatedMetrics {
  pnlTotalPct: number;
  pnlDailyPct: number;
  apy7d: number;
  return30d: number;
  volatility30d: number;
  maxDrawdown: number;
  winRate: number;
  tradeCount: number;
  sharpeRatio: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_DAYS = 365;

export function calculateMetrics(model: ModelState): CalculatedMetrics {
  const { navSeries, events, currentNav } = model;
  const now = Date.now();
  
  // Total PnL
  const pnlTotalPct = (currentNav - 1) * 100;
  
  // Daily PnL (last 24h)
  const dayAgo = now - DAY_MS;
  const dayAgoNav = findNavAt(navSeries, dayAgo) || 1;
  const pnlDailyPct = ((currentNav / dayAgoNav) - 1) * 100;
  
  // 7-day APY (annualized)
  const weekAgo = now - 7 * DAY_MS;
  const weekAgoNav = findNavAt(navSeries, weekAgo);
  let apy7d = 0;
  if (weekAgoNav && weekAgoNav > 0) {
    const weekReturn = currentNav / weekAgoNav;
    apy7d = (Math.pow(weekReturn, 52) - 1) * 100; // Annualize weekly return
  } else {
    // Not enough data, estimate from total
    const elapsed = (now - (navSeries[0]?.ts || now)) / DAY_MS;
    if (elapsed > 0) {
      const dailyReturn = Math.pow(currentNav, 1 / elapsed);
      apy7d = (Math.pow(dailyReturn, YEAR_DAYS) - 1) * 100;
    }
  }
  
  // 30-day return
  const monthAgo = now - 30 * DAY_MS;
  const monthAgoNav = findNavAt(navSeries, monthAgo);
  const return30d = monthAgoNav ? ((currentNav / monthAgoNav) - 1) * 100 : pnlTotalPct;
  
  // Volatility (30-day)
  const volatility30d = calculateVolatility(navSeries, monthAgo);
  
  // Max Drawdown
  const maxDrawdown = calculateMaxDrawdown(navSeries);
  
  // Win Rate (from daily returns)
  const winRate = calculateWinRate(navSeries);
  
  // Trade Count (from events)
  const tradeCount = events.filter(e => e.type === 'entry' || e.type === 'exit').length;
  
  // Sharpe Ratio (simplified, assuming 5% risk-free rate)
  const excessReturn = (apy7d / 100) - 0.05;
  const annualizedVol = volatility30d * Math.sqrt(YEAR_DAYS);
  const sharpeRatio = annualizedVol > 0 ? excessReturn / annualizedVol : 0;
  
  return {
    pnlTotalPct,
    pnlDailyPct,
    apy7d: Math.max(apy7d, 0), // Floor at 0
    return30d,
    volatility30d: volatility30d * 100,
    maxDrawdown,
    winRate,
    tradeCount,
    sharpeRatio,
  };
}

function findNavAt(series: NAVPoint[], targetTs: number): number | null {
  if (series.length === 0) return null;
  
  // Find closest point at or before target
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].ts <= targetTs) {
      return series[i].nav;
    }
  }
  
  // If no point before target, return first point
  return series[0]?.nav || null;
}

function calculateVolatility(series: NAVPoint[], sinceTs: number): number {
  const recentSeries = series.filter(p => p.ts >= sinceTs);
  if (recentSeries.length < 2) return 0.01;
  
  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < recentSeries.length; i++) {
    const prev = recentSeries[i - 1].nav;
    const curr = recentSeries[i].nav;
    if (prev > 0 && curr > 0) {
      returns.push(Math.log(curr / prev));
    }
  }
  
  if (returns.length < 2) return 0.01;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}

function calculateMaxDrawdown(series: NAVPoint[]): number {
  if (series.length < 2) return 0;
  
  let peak = series[0].nav;
  let maxDD = 0;
  
  for (const point of series) {
    if (point.nav > peak) {
      peak = point.nav;
    }
    const dd = (peak - point.nav) / peak;
    if (dd > maxDD) {
      maxDD = dd;
    }
  }
  
  return maxDD * 100;
}

function calculateWinRate(series: NAVPoint[]): number {
  if (series.length < 2) return 50;
  
  let wins = 0;
  let total = 0;
  
  // Sample at roughly daily intervals
  const sampleInterval = Math.max(1, Math.floor(series.length / 30));
  
  for (let i = sampleInterval; i < series.length; i += sampleInterval) {
    const prev = series[i - sampleInterval].nav;
    const curr = series[i].nav;
    total++;
    if (curr > prev) wins++;
  }
  
  return total > 0 ? (wins / total) * 100 : 50;
}

export function formatNumber(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}
