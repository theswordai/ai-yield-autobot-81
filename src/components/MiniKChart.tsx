import { useMemo, useId } from "react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

type Point = { value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(var(--primary))", data = [] }: MiniKChartProps) {
  const id = useId();
  const gradientId = useMemo(() => `grad-${id.replace(/[:]/g, "-")}`, [id]);

  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 12 }, (_, i) => ({ value: 40 + Math.random() * 60 }));
    }
    // Sample down to ~12 bars for clean look
    const step = Math.max(1, Math.floor(data.length / 12));
    return data.filter((_, i) => i % step === 0).slice(0, 14);
  }, [data]);

  const maxVal = useMemo(() => Math.max(...displayData.map(d => d.value)), [displayData]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="18%">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(45 60% 55%)" stopOpacity={0.9} />
              <stop offset="50%" stopColor={color} stopOpacity={0.7} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id={`${gradientId}-normal`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive>
            {displayData.map((entry, index) => {
              const isTop = entry.value >= maxVal * 0.85;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isTop ? `url(#${gradientId})` : `url(#${gradientId}-normal)`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}