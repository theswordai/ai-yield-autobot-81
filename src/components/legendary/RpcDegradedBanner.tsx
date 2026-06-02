import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { _refetchLegendary, useLegendaryDashboard } from "@/hooks/useLegendary";

export function RpcDegradedBanner() {
  const { rpcDegraded } = useLegendaryDashboard();
  const [busy, setBusy] = useState(false);

  if (!rpcDegraded) return null;

  const onRetry = async () => {
    setBusy(true);
    try {
      await _refetchLegendary();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-xl p-4 flex items-center gap-3 animate-fade-in">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      <div className="flex-1 text-sm">
        <div className="font-bold text-amber-700 dark:text-amber-300">
          链上数据读取异常
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          当前网络无法稳定访问 BSC 公共节点，显示的余额、上级、仓位可能不准确，请检查网络或切换 VPN 后重试。
        </div>
      </div>
      <Button
        onClick={onRetry}
        disabled={busy}
        size="sm"
        variant="outline"
        className="border-amber-500/50 text-amber-700 dark:text-amber-300 shrink-0"
      >
        {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
        重新读取
      </Button>
    </div>
  );
}
