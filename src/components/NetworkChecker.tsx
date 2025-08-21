import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Wifi } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { TARGET_CHAIN } from "@/config/contracts";

export function NetworkChecker() {
  const { chainId, provider } = useWeb3();
  const [networkStatus, setNetworkStatus] = useState<{
    isCorrectNetwork: boolean;
    networkName: string;
    canSwitch: boolean;
  }>({
    isCorrectNetwork: false,
    networkName: "Unknown",
    canSwitch: false,
  });

  useEffect(() => {
    const checkNetwork = () => {
      if (!chainId) {
        setNetworkStatus({
          isCorrectNetwork: false,
          networkName: "未连接",
          canSwitch: false,
        });
        return;
      }

      const networks: Record<number, string> = {
        1: "Ethereum 主网",
        56: "BSC 主网",
        97: "BSC 测试网",
        137: "Polygon 主网",
        43114: "Avalanche 主网",
      };

      const networkName = networks[chainId] || `未知网络 (${chainId})`;
      const isCorrectNetwork = chainId === TARGET_CHAIN;
      const canSwitch = !!window.ethereum;

      setNetworkStatus({
        isCorrectNetwork,
        networkName,
        canSwitch,
      });
    };

    checkNetwork();
  }, [chainId]);

  const switchToCorrectNetwork = async () => {
    if (!window.ethereum) return;

    try {
      // 尝试切换到 BSC 主网
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${TARGET_CHAIN.toString(16)}` }],
      });
    } catch (error: any) {
      // 如果网络不存在，添加 BSC 主网
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${TARGET_CHAIN.toString(16)}`,
                chainName: "BNB Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add BSC network:", addError);
        }
      } else {
        console.error("Failed to switch network:", error);
      }
    }
  };

  if (networkStatus.isCorrectNetwork) {
    return (
      <Alert className="mb-6 border-primary/50 bg-primary/10">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          <div className="flex items-center justify-between">
            <span>✅ 已连接到 {networkStatus.networkName}</span>
            <div className="flex items-center gap-1 text-xs">
              <Wifi className="w-3 h-3" />
              Chain ID: {chainId}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <strong className="text-destructive">网络错误</strong>
            <p className="text-sm text-muted-foreground mt-1">
              当前连接: {networkStatus.networkName} | 需要: BSC 主网 (Chain ID: {TARGET_CHAIN})
            </p>
          </div>
          
          {networkStatus.canSwitch && (
            <Button 
              onClick={switchToCorrectNetwork}
              size="sm"
              className="bg-destructive hover:bg-destructive/90"
            >
              切换到 BSC 主网
            </Button>
          )}
          
          {!networkStatus.canSwitch && (
            <p className="text-xs text-muted-foreground">
              请在钱包中手动切换到 BSC 主网
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}