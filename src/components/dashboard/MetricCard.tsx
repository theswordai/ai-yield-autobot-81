import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricCard({ label, value, subValue, icon: Icon, trend, size = 'md' }: MetricCardProps) {
  const sizeStyles = {
    sm: { container: 'p-3', value: 'text-lg', label: 'text-xs' },
    md: { container: 'p-4', value: 'text-2xl', label: 'text-xs' },
    lg: { container: 'p-5', value: 'text-3xl', label: 'text-sm' },
  };

  const trendColors = {
    up: 'text-accent',
    down: 'text-destructive',
    neutral: 'text-foreground',
  };

  return (
    <div className={cn(
      'rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm',
      sizeStyles[size].container
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn('text-muted-foreground', sizeStyles[size].label)}>{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <p className={cn(
        'font-bold',
        sizeStyles[size].value,
        trend ? trendColors[trend] : 'text-foreground'
      )}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}
