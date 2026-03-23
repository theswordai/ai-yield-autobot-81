import { useMemo } from "react";

type Point = { open: number; close: number; value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(var(--primary))", data = [] }: MiniKChartProps) {
  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 30 }, (_, i) => {
        const open = 50 + Math.sin(i / 3) * 10;
        const close = open + (Math.random() - 0.5) * 8;
        return { open, close, value: close };
      });
    }
    return data;
  }, [data]);

  const { min, max } = useMemo(() => {
    const allVals = displayData.flatMap(d => [d.open, d.close]);
    const mn = Math.min(...allVals);
    const mx = Math.max(...allVals);
    const pad = (mx - mn) * 0.15 || 1;
    return { min: mn - pad, max: mx + pad };
  }, [displayData]);

  const range = max - min;
  const toY = (v: number) => (1 - (v - min) / range) * 100;

  const barWidth = 100 / displayData.length;
  const gap = barWidth * 0.2;

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {displayData.map((d, i) => {
          const top = toY(Math.max(d.open, d.close));
          const bottom = toY(Math.min(d.open, d.close));
          const barH = Math.max(bottom - top, 1.5);
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          return (
            <rect
              key={i}
              x={x}
              y={top}
              width={w}
              height={barH}
              fill="hsl(var(--muted-foreground))"
              opacity={0.45}
              rx={0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}
