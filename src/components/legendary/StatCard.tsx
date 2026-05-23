import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-xl md:text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}
