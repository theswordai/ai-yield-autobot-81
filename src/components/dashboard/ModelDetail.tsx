import { useState } from 'react';
import { ModelState } from '@/lib/models/types';
import { ModelConfig } from '@/lib/models';
import { calculateMetrics } from '@/lib/metrics';
import { NAVChart } from './NAVChart';
import { MetricCard } from './MetricCard';
import { EventLog } from './EventLog';
import { TrendingUp, TrendingDown, Activity, BarChart3, Percent, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelDetailProps {
  config: ModelConfig;
  model: ModelState;
  onReset: () => void;
}

type TimeRange = '1D' | '7D' | '30D' | 'ALL';

export function ModelDetail({ config, model, onReset }: ModelDetailProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const metrics = calculateMetrics(model);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{config.name}</h2>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="APY (7D)"
          value={`${metrics.apy7d.toFixed(0)}%`}
          icon={Percent}
          trend={metrics.apy7d > 0 ? 'up' : 'neutral'}
          size="md"
        />
        <MetricCard
          label="Return 30D"
          value={`${metrics.return30d >= 0 ? '+' : ''}${metrics.return30d.toFixed(1)}%`}
          icon={TrendingUp}
          trend={metrics.return30d >= 0 ? 'up' : 'down'}
          size="md"
        />
        <MetricCard
          label="Max Drawdown"
          value={`-${metrics.maxDrawdown.toFixed(1)}%`}
          icon={TrendingDown}
          trend="down"
          size="md"
        />
        <MetricCard
          label="Volatility 30D"
          value={`${metrics.volatility30d.toFixed(1)}%`}
          icon={BarChart3}
          trend="neutral"
          size="md"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Win Rate"
          value={`${metrics.winRate.toFixed(0)}%`}
          size="sm"
        />
        <MetricCard
          label="Trades"
          value={metrics.tradeCount.toString()}
          size="sm"
        />
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          size="sm"
        />
      </div>

      {/* NAV Chart */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            NAV Performance
          </h3>
          <div className="flex gap-1">
            {(['1D', '7D', '30D', 'ALL'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  timeRange === range
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[200px]">
          <NAVChart navSeries={model.navSeries} timeRange={timeRange} />
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent Events
        </h3>
        <EventLog events={model.events} />
      </div>
    </div>
  );
}
