import { useMemo } from "react";

type Point = { open: number; close: number; value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(142 71% 45%)", data = [] }: MiniKChartProps) {
  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 6 }, (_, i) => ({
        open: 0, close: 0, value: 20 + i * 15,
      }));
    }
    return data;
  }, [data]);

  const max = useMemo(() => Math.max(...displayData.map(d => d.value), 1), [displayData]);

  const barWidth = 100 / displayData.length;
  const gap = barWidth * 0.25;

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {displayData.map((d, i) => {
          const h = (d.value / max) * 95;
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          return (
            <rect
              key={i}
              x={x}
              y={100 - h}
              width={w}
              height={h}
              fill="hsl(142 71% 45%)"
              opacity={0.8}
              rx={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}
