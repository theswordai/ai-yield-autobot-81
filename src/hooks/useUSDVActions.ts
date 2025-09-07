import { useState, useCallback } from "react";
import { useWeb3 } from "./useWeb3";
import { useUSDVContracts } from "./useUSDVContracts";
import { TARGET_CHAIN } from "@/config/contracts";
import { toast } from "@/hooks/use-toast";

interface LoadingState {
  claimStake: boolean;
  claimProfit: boolean;
  claimNewcomer: boolean;
  spin: boolean;
}

export function useUSDVActions() {
  const { account, chainId } = useWeb3();
  const { writeContracts } = useUSDVContracts();
  const [loading, setLoading] = useState<LoadingState>({
    claimStake: false,
    claimProfit: false,
    claimNewcomer: false,
    spin: false,
  });

  const setActionLoading = useCallback((action: keyof LoadingState, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  }, []);

  const switchToNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, try to add BSC mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: 'BSC Mainnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", error);
      return false;
    }
  }, []);

  const checkNetwork = useCallback(async () => {
    if (chainId !== TARGET_CHAIN) {
      toast({
        title: "网络错误",
        description: "请切换到 BSC 主网",
        variant: "destructive",
      });
      try {
        const success = await switchToNetwork(TARGET_CHAIN);
        return success;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return false;
      }
    }
    return true;
  }, [chainId, switchToNetwork]);

  const checkConnection = useCallback(() => {
    if (!account || !writeContracts) {
      toast({
        title: "钱包未连接",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [account, writeContracts]);

  const claimStakeUSDV = useCallback(async () => {
    if (!checkConnection() || !(await checkNetwork())) return;

    try {
      setActionLoading("claimStake", true);
      
      const tx = await writeContracts!.emissionsController.claimStakeUSDV();

      toast({
        title: "交易已提交",
        description: "正在处理按天生息领取...",
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast({
          title: "领取成功",
          description: "按天生息 USDV 已成功领取",
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Claim stake USDV failed:", error);
      
      let errorMessage = "按天生息领取失败";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "用户取消交易";
      }
      
      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading("claimStake", false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  const claimProfitFollow = useCallback(async (selectedPositions: bigint[]) => {
    if (!checkConnection() || !(await checkNetwork())) return;
    
    if (selectedPositions.length === 0) {
      toast({
        title: "请选择仓位",
        description: "请先选择要领取利润跟随的仓位",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading("claimProfit", true);
      
      const tx = await writeContracts!.emissionsController.claimProfitFollow(selectedPositions);

      toast({
        title: "交易已提交",
        description: "正在处理利润跟随领取...",
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast({
          title: "领取成功",
          description: "利润跟随 USDV 已成功领取",
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Claim profit follow failed:", error);
      
      let errorMessage = "利润跟随领取失败";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "用户取消交易";
      }
      
      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading("claimProfit", false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  const claimNewcomer = useCallback(async () => {
    if (!checkConnection() || !(await checkNetwork())) return;

    try {
      setActionLoading("claimNewcomer", true);
      
      const tx = await writeContracts!.emissionsController.claimNewcomer();

      toast({
        title: "交易已提交",
        description: "正在处理新人奖励领取...",
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Try to parse the amount from events
        const claimedEvent = receipt.logs?.find((log: any) => {
          try {
            const parsedLog = writeContracts!.emissionsController.interface.parseLog(log);
            return parsedLog?.name === "ClaimedNewcomer";
          } catch {
            return false;
          }
        });

        let amountText = "";
        if (claimedEvent) {
          try {
            const parsedLog = writeContracts!.emissionsController.interface.parseLog(claimedEvent);
            const amount = parsedLog?.args?.amount;
            if (amount) {
              amountText = ` ${(Number(amount) / 1e18).toFixed(2)} USDV`;
            }
          } catch (error) {
            console.error("Failed to parse claimed amount:", error);
          }
        }

        toast({
          title: "新人奖励领取成功",
          description: `已领取${amountText}`,
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Claim newcomer failed:", error);
      
      let errorMessage = "新人奖励领取失败";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "用户取消交易";
      }
      
      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading("claimNewcomer", false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  const spin = useCallback(async () => {
    if (!checkConnection() || !(await checkNetwork())) return;

    try {
      setActionLoading("spin", true);
      
      const tx = await writeContracts!.spinWheel.spin();

      toast({
        title: "交易已提交",
        description: "正在处理抽奖...",
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Try to parse the amount from events
        const spunEvent = receipt.logs?.find((log: any) => {
          try {
            const parsedLog = writeContracts!.spinWheel.interface.parseLog(log);
            return parsedLog?.name === "Spun";
          } catch {
            return false;
          }
        });

        let amountText = "1-100";
        if (spunEvent) {
          try {
            const parsedLog = writeContracts!.spinWheel.interface.parseLog(spunEvent);
            const amount = parsedLog?.args?.amount;
            if (amount) {
              amountText = (Number(amount) / 1e18).toFixed(0);
            }
          } catch (error) {
            console.error("Failed to parse spin amount:", error);
          }
        }

        toast({
          title: "抽奖成功！",
          description: `恭喜您获得 ${amountText} USDV！`,
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Spin failed:", error);
      
      let errorMessage = "抽奖失败";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "用户取消交易";
      }
      
      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading("spin", false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  return {
    loading,
    claimStakeUSDV,
    claimProfitFollow,
    claimNewcomer,
    spin,
  };
}