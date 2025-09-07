import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "ethers";
import { useWeb3 } from "./useWeb3";
import { useUSDVContracts } from "./useUSDVContracts";
import { PositionStruct } from "@/abis/LockStaking";

interface USDVUserData {
  address: string;
  usdvBalance: bigint;
  bnbBalance: bigint;
  positions: Array<PositionStruct & { posId: bigint }>;
  hasJoined: boolean;
  canSpin: { ok: boolean; reason: string };
  dailyProgress: { minted: bigint; cap: bigint };
}

export function useUSDVData() {
  const { account, provider } = useWeb3();
  const { contracts } = useUSDVContracts();
  const [data, setData] = useState<USDVUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!account || !contracts || !provider) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get basic data with null checks
      const [usdvBalance, bnbBalance, positionIds, hasJoined, canSpinResult, dailyCap] = await Promise.all([
        contracts.usdv.balanceOf(account).catch(() => BigInt(0)),
        provider.getBalance(account).catch(() => BigInt(0)),
        contracts.lockStaking.getUserPositions(account).catch(() => []),
        contracts.emissionsController.joined(account).catch(() => false),
        contracts.spinWheel.canSpin(account).catch(() => ({ ok: false, reason: "网络错误" })),
        contracts.spinWheel.dailyCap().catch(() => BigInt(0)),
      ]);

      // Get position details with error handling
      const positions = await Promise.all(
        (positionIds || []).map(async (posId: bigint) => {
          try {
            const position = await contracts.lockStaking.positions(posId);
            // Ensure all position fields have valid values
            return { 
              ...position, 
              posId,
              principal: position.principal || BigInt(0),
              startTime: position.startTime || BigInt(0),
              lastClaimTime: position.lastClaimTime || BigInt(0),
              lockDuration: position.lockDuration || BigInt(0),
              aprBps: position.aprBps || BigInt(0),
            };
          } catch (error) {
            console.error(`Failed to fetch position ${posId}:`, error);
            return null;
          }
        })
      ).then(results => results.filter(Boolean)); // Filter out null results

      // Get daily progress with error handling
      const currentDayId = BigInt(Math.floor(Date.now() / 1000 / 86400));
      const mintedToday = await contracts.spinWheel.mintedPerDay(currentDayId).catch(() => BigInt(0));

      const userData: USDVUserData = {
        address: account,
        usdvBalance: usdvBalance || BigInt(0),
        bnbBalance: bnbBalance || BigInt(0),
        positions: positions || [],
        hasJoined: hasJoined || false,
        canSpin: canSpinResult || { ok: false, reason: "未知错误" },
        dailyProgress: {
          minted: mintedToday || BigInt(0),
          cap: dailyCap || BigInt(0)
        }
      };

      setData(userData);
    } catch (err) {
      console.error("Failed to fetch USDV data:", err);
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, [account, contracts, provider]);

  useEffect(() => {
    refreshData();
    
    // 定期刷新数据
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const formatAmount = useCallback((amount: any, decimals = 18): string => {
    if (amount === null || amount === undefined || amount === "" || amount === "0x") {
      return "0";
    }
    
    try {
      // Convert to BigInt if it's not already
      const bigIntAmount = typeof amount === 'bigint' ? amount : BigInt(amount);
      const formatted = formatUnits(bigIntAmount, decimals);
      
      // Parse to number and format with appropriate precision
      const num = parseFloat(formatted);
      if (num === 0) return "0";
      if (num < 0.01) return num.toFixed(6);
      if (num < 1) return num.toFixed(4);
      if (num < 1000) return num.toFixed(2);
      return Math.floor(num).toLocaleString();
    } catch (error) {
      console.error("Format amount error:", error);
      return "0";
    }
  }, []);

  const formatPercent = useCallback((bps: any): string => {
    if (bps === null || bps === undefined || bps === "" || bps === "0x") {
      return "0.00";
    }
    
    try {
      const bigIntBps = typeof bps === 'bigint' ? bps : BigInt(bps);
      return (Number(bigIntBps) / 100).toFixed(2);
    } catch (error) {
      console.error("Error formatting percent:", error);
      return "0.00";
    }
  }, []);

  return {
    data,
    loading,
    error,
    refreshData,
    formatAmount,
    formatPercent,
  };
}