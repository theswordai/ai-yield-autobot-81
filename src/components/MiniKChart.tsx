import { useMemo, useId } from "react";
import { BarChart, Bar, Cell, ResponsiveContainer, YAxis } from "recharts";

type Point = { value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(var(--primary))", data = [] }: MiniKChartProps) {
  const id = useId();

  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({ value: 50 + i * 8 }));
    }
    // Sample down to ~7 bars for clean visual
    const step = Math.max(1, Math.floor(data.length / 7));
    const sampled: Point[] = [];
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    // Always include the last point
    if (sampled.length > 0 && sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }
    return sampled.slice(-7);
  }, [data]);

  const maxVal = useMemo(() => Math.max(...displayData.map(d => d.value), 1), [displayData]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }} barCategoryGap="20%">
          <YAxis domain={[0, 'dataMax']} hide />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive>
            {displayData.map((_, index) => (
              <Cell
                key={index}
                fill={index === displayData.length - 1 ? color : `${color}99`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
