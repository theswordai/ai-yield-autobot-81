import { useMemo, useId } from "react";
import { BarChart, Bar, Cell, Line, ComposedChart, ResponsiveContainer, YAxis } from "recharts";

type Point = { open: number; close: number; value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(var(--primary))", data = [] }: MiniKChartProps) {
  const id = useId();
  const lineId = useMemo(() => `line-${id.replace(/[:]/g, "-")}`, [id]);

  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 30 }, (_, i) => {
        const open = 50 + Math.sin(i / 3) * 10;
        const close = open + (Math.random() - 0.5) * 8;
        return { open, close, value: close, barHeight: Math.abs(close - open) || 0.5, base: Math.min(open, close) };
      });
    }
    return data.map(d => ({
      ...d,
      barHeight: Math.abs(d.close - d.open) || (d.value * 0.005),
      base: Math.min(d.open, d.close),
    }));
  }, [data]);

  const yDomain = useMemo(() => {
    const values = displayData.flatMap(d => [d.open, d.close]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1;
    return [min - padding, max + padding];
  }, [displayData]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={displayData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }} barGap={1}>
          <YAxis domain={yDomain} hide />
          <Bar dataKey="barHeight" stackId="bar" isAnimationActive={false}>
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.close >= entry.open ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          {/* invisible base stack to position bars correctly */}
          <Bar dataKey="base" stackId="bar" fill="transparent" isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
