import { useEffect, useMemo, useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

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
      return Array.from({ length: 30 }, (_, i) => ({ value: 50 + Math.sin(i / 3) * 10 }));
    }
    return data;
  }, [data]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
