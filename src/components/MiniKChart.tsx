import { useEffect, useMemo, useState, useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

type Point = { value: number };

export function MiniKChart({ color = "hsl(var(--primary))" }: { color?: string }) {
  const [data, setData] = useState<Point[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({ value: 50 + Math.sin(i / 3) * 10 + Math.random() * 4 }))
  );
  const id = useId();

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), { value: Math.max(35, Math.min(70, prev[prev.length - 1].value + (Math.random() - 0.5) * 3)) }];
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const gradientId = useMemo(() => `grad-${id.replace(/[:]/g, "-")}`, [id]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
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
