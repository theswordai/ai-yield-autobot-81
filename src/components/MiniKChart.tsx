import { useMemo, useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

type Point = { value: number };

interface MiniKChartProps {
  color?: string;
  data?: Point[];
}

export function MiniKChart({ color = "hsl(var(--primary))", data = [] }: MiniKChartProps) {
  const id = useId();

  const fillGradientId = useMemo(() => `fill-${id.replace(/[:]/g, "-")}`, [id]);
  const strokeGradientId = useMemo(() => `stroke-${id.replace(/[:]/g, "-")}`, [id]);

  const displayData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({ value: 50 + Math.sin(i / 3) * 10 }));
    }
    return data;
  }, [data]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <defs>
            {/* Stroke gradient: green → yellow-green → gold */}
            <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#a3e635" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            {/* Fill gradient: teal glow fading down */}
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
              <stop offset="40%" stopColor="#2dd4a8" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="natural"
            dataKey="value"
            stroke={`url(#${strokeGradientId})`}
            strokeWidth={3}
            fill={`url(#${fillGradientId})`}
            isAnimationActive
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
