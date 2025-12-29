import { ModelConfig, ModelStatus, RiskLevel } from '@/lib/models';
import { CalculatedMetrics } from '@/lib/metrics';
import { cn } from '@/lib/utils';

interface ModelCardProps {
  config: ModelConfig;
  nav: number;
  status: ModelStatus;
  metrics: CalculatedMetrics;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_STYLES: Record<ModelStatus, string> = {
  ACTIVE: 'bg-accent/20 text-accent border-accent/30',
  SCALING: 'bg-primary/20 text-primary border-primary/30',
  COOLING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const RISK_STYLES: Record<RiskLevel, { color: string; width: string }> = {
  LOW: { color: 'bg-accent', width: 'w-1/3' },
  MID: { color: 'bg-primary', width: 'w-2/3' },
  HIGH: { color: 'bg-destructive', width: 'w-full' },
};

export function ModelCard({ config, nav, status, metrics, isSelected, onClick }: ModelCardProps) {
  const riskStyle = RISK_STYLES[config.risk];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-xl cursor-pointer transition-all duration-300',
        'bg-card/60 border backdrop-blur-sm',
        'hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        isSelected 
          ? 'border-primary/50 shadow-lg shadow-primary/10 bg-card/80' 
          : 'border-border/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{config.name}</h3>
          <p className="text-xs text-muted-foreground">{config.tagline}</p>
        </div>
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', STATUS_STYLES[status])}>
          {status}
        </span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">APY (7D)</p>
          <p className="text-2xl font-bold text-accent">
            {metrics.apy7d > 0 ? `${metrics.apy7d.toFixed(0)}%` : '---'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">NAV</p>
          <p className="text-2xl font-bold text-foreground">{nav.toFixed(4)}</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          <span className="text-muted-foreground">30D: </span>
          <span className={metrics.return30d >= 0 ? 'text-accent' : 'text-destructive'}>
            {metrics.return30d >= 0 ? '+' : ''}{metrics.return30d.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">DD: </span>
          <span className="text-destructive">-{metrics.maxDrawdown.toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Vol: </span>
          <span className="text-muted-foreground">{metrics.volatility30d.toFixed(1)}%</span>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Risk</span>
          <span className="text-muted-foreground">{config.risk}</span>
        </div>
        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', riskStyle.color, riskStyle.width)} />
        </div>
      </div>

      {/* Underlying Assets */}
      <div className="flex gap-1 flex-wrap">
        {config.underlying.map(asset => (
          <span 
            key={asset} 
            className="px-2 py-0.5 text-xs bg-secondary/50 text-muted-foreground rounded"
          >
            {asset}
          </span>
        ))}
      </div>
    </div>
  );
}
