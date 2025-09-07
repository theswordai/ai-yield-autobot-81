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

      // Get basic data
      const [usdvBalance, bnbBalance, positionIds, hasJoined, canSpinResult, dailyCap] = await Promise.all([
        contracts.usdv.balanceOf(account),
        provider.getBalance(account),
        contracts.lockStaking.getUserPositions(account),
        contracts.emissionsController.joined(account),
        contracts.spinWheel.canSpin(account),
        contracts.spinWheel.dailyCap(),
      ]);

      // Get position details
      const positions = await Promise.all(
        positionIds.map(async (posId: bigint) => {
          const position = await contracts.lockStaking.positions(posId);
          return { ...position, posId };
        })
      );

      // Get daily progress
      const currentDayId = BigInt(Math.floor(Date.now() / 1000 / 86400));
      const mintedToday = await contracts.spinWheel.mintedPerDay(currentDayId);

      const userData: USDVUserData = {
        address: account,
        usdvBalance,
        bnbBalance,
        positions,
        hasJoined,
        canSpin: canSpinResult,
        dailyProgress: {
          minted: mintedToday,
          cap: dailyCap
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

  const formatAmount = useCallback((amount: bigint, decimals = 18) => {
    return formatUnits(amount, decimals);
  }, []);

  const formatPercent = useCallback((bps: bigint) => {
    return (Number(bps) / 100).toFixed(2);
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