import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ReferenceDot,
} from "recharts";
import { useI18n } from "@/hooks/useI18n";

interface ChartDataPoint {
  date: string;
  day: number;
  usdOnline: number;
}

// Generate USD.online daily yield data: mean > 500%, min >= 200%, high volatility
// Uses a seed based on start date to ensure consistency
const generateUSDOnlineDailyYield = (days: number, seed: number): number[] => {
  const data: number[] = [];
  let baseValue = 520;
  
  // Simple seeded random for consistency
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < days; i++) {
    const rand1 = seededRandom(i);
    const rand2 = seededRandom(i + 1000);
    const rand3 = seededRandom(i + 2000);
    
    // Create spiky, volatile behavior on daily basis
    const spike = rand1 > 0.85 ? rand2 * 350 + 80 : 0;
    const dip = rand1 > 0.88 ? -rand3 * 180 : 0;
    const noise = (rand2 - 0.4) * 120;
    const cyclical = Math.sin(i * 0.15) * 60;
    
    let value = baseValue + noise + spike + dip + cyclical;
    
    // Ensure minimum of 200%
    value = Math.max(200, value);
    
    // Gradually trend upward with daily smoothing
    baseValue = baseValue * 0.95 + value * 0.05 + 0.5;
    
    data.push(Math.round(value));
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Blinking dot component for current date
const BlinkingDot = () => (
  <circle r={6} fill="hsl(38, 92%, 50%)" className="animate-pulse">
    <animate
      attributeName="r"
      values="4;8;4"
      dur="1.5s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="1;0.5;1"
      dur="1.5s"
      repeatCount="indefinite"
    />
  </circle>
);

export function PerformanceChart() {
  const { t } = useI18n();
  
  // Date range: July 31, 2025 to current date (dynamic)
  const startDate = useMemo(() => new Date("2025-07-31"), []);
  const endDate = useMemo(() => new Date(), []); // Current date - updates automatically
  
  const days = useMemo(() => {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }, [startDate, endDate]);
  
  // Seed based on start date for consistent data
  const seed = useMemo(() => startDate.getTime(), [startDate]);
  
  // Generate USD.online daily data
  const usdOnlineData = useMemo(() => generateUSDOnlineDailyYield(days, seed), [days, seed]);
  
  // Combine data into chart format (daily)
  const chartData: ChartDataPoint[] = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * msPerDay);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      data.push({
        date: dateStr,
        day: i + 1,
        usdOnline: usdOnlineData[i] || 500,
      });
    }
    
    return data;
  }, [usdOnlineData, days, startDate]);

  // Get the last data point for the blinking dot
  const lastDataPoint = chartData[chartData.length - 1];

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
        {t("strategy.title")} USD.online{t("strategy.annualizedYield")}
      </h2>
      
      <div className="h-[400px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              interval={13}
            />
            
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => `${value}%`}
              domain={['auto', 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line at 200% minimum */}
            <ReferenceLine 
              y={200} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              opacity={0.5}
            >
              <Label 
                value="Min 200%" 
                position="right" 
                fill="hsl(var(--muted-foreground))"
                fontSize={10}
              />
            </ReferenceLine>
            
            {/* USD.online line - linear type for daily data */}
            <Line
              type="linear"
              dataKey="usdOnline"
              name="USD.online Annualized Yield %"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "hsl(38, 92%, 50%)" }}
            />
            
            {/* Blinking dot at current date */}
            {lastDataPoint && (
              <ReferenceDot
                x={lastDataPoint.date}
                y={lastDataPoint.usdOnline}
                r={6}
                fill="hsl(38, 92%, 50%)"
                stroke="hsl(38, 92%, 60%)"
                strokeWidth={2}
                shape={<BlinkingDot />}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
