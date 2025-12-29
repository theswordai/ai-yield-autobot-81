import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { NAVPoint } from '@/lib/models/types';

interface NAVChartProps {
  navSeries: NAVPoint[];
  timeRange: '1D' | '7D' | '30D' | 'ALL';
}

export function NAVChart({ navSeries, timeRange }: NAVChartProps) {
  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      '1D': 24 * 60 * 60 * 1000,
      '7D': 7 * 24 * 60 * 60 * 1000,
      '30D': 30 * 24 * 60 * 60 * 1000,
      'ALL': Infinity,
    };

    const cutoff = now - ranges[timeRange];
    const filtered = navSeries.filter(p => p.ts >= cutoff);
    
    // Sample if too many points
    const maxPoints = 200;
    if (filtered.length > maxPoints) {
      const step = Math.ceil(filtered.length / maxPoints);
      return filtered.filter((_, i) => i % step === 0);
    }
    
    return filtered;
  }, [navSeries, timeRange]);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    if (timeRange === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const minNav = Math.min(...filteredData.map(d => d.nav)) * 0.98;
  const maxNav = Math.max(...filteredData.map(d => d.nav)) * 1.02;

  if (filteredData.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Waiting for data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="ts" 
          tickFormatter={formatTime}
          stroke="hsl(215 13% 40%)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          domain={[minNav, maxNav]}
          tickFormatter={(val) => val.toFixed(2)}
          stroke="hsl(215 13% 40%)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(215 32% 11%)',
            border: '1px solid hsl(215 25% 18%)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelFormatter={(ts) => new Date(ts).toLocaleString()}
          formatter={(value: number) => [value.toFixed(4), 'NAV']}
        />
        <Area
          type="monotone"
          dataKey="nav"
          stroke="hsl(142 71% 45%)"
          strokeWidth={2}
          fill="url(#navGradient)"
          dot={false}
          animationDuration={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
