import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Vault, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const VAULTS = [
  {
    label: "合规&质押",
    address: "0x3F6e613BE21c733CB6f67D1D024634F8d7F1e4Bb",
    icon: ShieldCheck,
    tone: "from-amber-500/20 to-yellow-600/10 border-amber-400/40 text-amber-600 dark:text-amber-300",
  },
  {
    label: "储备&质押",
    address: "0xba99D0A2016F43dA2c8AeB581b6076C8b487401A",
    icon: Vault,
    tone: "from-emerald-500/20 to-teal-600/10 border-emerald-400/40 text-emerald-600 dark:text-emerald-300",
  },
];

export function VaultTab() {
  const copy = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      toast({ title: "已复制", description: addr });
    } catch {}
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <h3 className="text-base sm:text-lg font-bold mb-1">链上金库</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          以下为公开链上金库地址，BSC 主网。任何人均可在 BscScan 上查询资金流向，确保透明合规。
        </p>
      </Card>

      <div className="grid gap-3 sm:gap-4">
        {VAULTS.map(({ label, address, icon: Icon, tone }) => (
          <Card
            key={address}
            className={`relative overflow-hidden p-4 sm:p-5 bg-gradient-to-br ${tone} backdrop-blur-xl`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="inline-flex w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-background/40 border border-foreground/15 items-center justify-center">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-sm sm:text-base">{label}</span>
                  <Badge variant="outline" className="border-foreground/30 text-[10px]">
                    BSC
                  </Badge>
                </div>
                <p className="font-mono text-[11px] sm:text-xs break-all opacity-90">
                  {address}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-foreground/20"
                    onClick={() => copy(address)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> 复制地址
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-foreground/20"
                    asChild
                  >
                    <a
                      href={`https://bscscan.com/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> BscScan
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
