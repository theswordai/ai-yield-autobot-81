import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  /** Visual accent: amber (default), emerald, primary */
  tone?: "amber" | "emerald" | "primary" | "destructive";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, {
  ring: string;
  iconWrap: string;
  iconColor: string;
  value: string;
  glow: string;
}> = {
  amber: {
    ring: "hover:border-amber-400/40",
    iconWrap: "bg-gradient-to-br from-amber-400/20 to-yellow-600/10 border-amber-400/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    value: "bg-gradient-to-r from-amber-600 to-yellow-700 dark:from-amber-200 dark:to-yellow-400 bg-clip-text text-transparent",
    glow: "from-amber-400/10",
  },
  emerald: {
    ring: "hover:border-emerald-400/40",
    iconWrap: "bg-gradient-to-br from-emerald-400/20 to-teal-600/10 border-emerald-400/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    value: "bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-200 dark:to-teal-400 bg-clip-text text-transparent",
    glow: "from-emerald-400/10",
  },
  primary: {
    ring: "hover:border-primary/40",
    iconWrap: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30",
    iconColor: "text-primary",
    value: "bg-gradient-to-r from-primary to-amber-600 dark:to-amber-400 bg-clip-text text-transparent",
    glow: "from-primary/10",
  },
  destructive: {
    ring: "hover:border-rose-400/40",
    iconWrap: "bg-gradient-to-br from-rose-400/20 to-rose-700/10 border-rose-400/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    value: "bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-200 dark:to-rose-400 bg-clip-text text-transparent",
    glow: "from-rose-400/10",
  },
};

export function StatCard({ icon: Icon, label, value, sub, tone = "amber" }: StatCardProps) {
  const t = TONES[tone];
  return (
    <Card
      className={`group relative overflow-hidden p-4 bg-foreground/5 backdrop-blur-xl border border-foreground/15 ${t.ring} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(251,191,36,0.25)] animate-fade-in`}
    >
      {/* glow blob */}
      <div
        className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-60 bg-gradient-to-br ${t.glow} to-transparent`}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${t.iconWrap}`}
          >
            <Icon className={`w-3.5 h-3.5 ${t.iconColor}`} />
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">{label}</span>
        </div>
        <div className={`text-xl md:text-2xl font-bold leading-tight ${t.value}`}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
      </div>
    </Card>
  );
}
