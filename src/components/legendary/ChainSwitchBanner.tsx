import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { _refetchLegendary } from "@/hooks/useLegendary";

const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

export function ChainSwitchBanner() {
  const { account, chainId } = useWeb3();
  const [switching, setSwitching] = useState(false);

  if (!account) return null;
  if (chainId === null || chainId === undefined) return null;
  if (chainId === 56) return null;

  const handleSwitch = async () => {
    const eth = (window as any).ethereum;
    if (!eth?.request) {
      toast.error("未检测到钱包");
      return;
    }
    setSwitching(true);
    try {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (err: any) {
        if (err?.code === 4902 || err?.data?.originalError?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [BSC_PARAMS],
          });
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }],
          });
        } else if (err?.code === 4001) {
          toast.error("您已取消切换");
          return;
        } else {
          throw err;
        }
      }
      toast.success("已切换到 BNB Chain");
      setTimeout(() => {
        _refetchLegendary();
      }, 500);
    } catch (e: any) {
      toast.error(e?.message || "切换失败，请在钱包中手动切到 BSC");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 backdrop-blur-xl p-4 flex items-center gap-3 animate-fade-in">
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
      <div className="flex-1 text-sm">
        <div className="font-bold text-red-600 dark:text-red-400">
          当前网络不是 BNB Chain
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          检测到 Chain ID = {chainId}，余额与持仓无法读取，请切换到 BSC（56）
        </div>
      </div>
      <Button
        onClick={handleSwitch}
        disabled={switching}
        size="sm"
        className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white shrink-0"
      >
        {switching ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            切换中
          </>
        ) : (
          "切换到 BSC"
        )}
      </Button>
    </div>
  );
}
