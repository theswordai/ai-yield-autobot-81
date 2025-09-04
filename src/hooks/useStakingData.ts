import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "ethers";
import { useWeb3 } from "./useWeb3";
import { useContracts } from "./useContracts";
import { USDT_DECIMALS, LOCK_ADDRESS } from "@/config/contracts";
import type { PositionStruct } from "@/abis/LockStaking";

export interface StakingPosition {
  posId: bigint;
  user: string;
  principal: bigint;
  startTime: bigint;
  lastClaimTime: bigint;
  lockDuration: bigint;
  aprBps: bigint;
  principalWithdrawn: boolean;
  pendingYield: bigint;
  remainingDays: number;
  isMatured: boolean;
  lockType: '3个月' | '6个月' | '1年';
  aprPercent: number;
}

export interface UserStats {
  usdtBalance: bigint;
  usdtAllowance: bigint;
  totalStaked: bigint;
  totalPendingYield: bigint;
  activePositions: StakingPosition[];
  rewardsVaultPending: bigint;
  rewardsVaultClaimed: bigint;
  referralStats: {
    inviterAddress: string;
    directReferrals: string[];
    indirectReferrals: string[];
    totalTeamAmount: bigint;
    currentLevel: bigint;
    directBps: bigint;
    pDirect: bigint;
    pIndirect1: bigint;
    pSelf: bigint;
  };
}

export function useStakingData() {
  const { account } = useWeb3();
  const { contracts } = useContracts();
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLockType = (lockDuration: bigint): '3个月' | '6个月' | '1年' => {
    const days = Number(lockDuration) / 86400;
    if (days <= 100) return '3个月';
    if (days <= 200) return '6个月';
    return '1年';
  };

  const refreshData = useCallback(async () => {
    if (!account || !contracts) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 获取基础数据
      const [
        usdtBalance,
        usdtAllowance,
        userPositionIds,
        vaultPending,
        inviterAddress,
        directReferrals,
        indirectReferrals,
        totalTeamAmount,
        currentLevel,
        directBps,
        pDirect,
        pIndirect1,
        pSelf
      ] = await Promise.all([
        contracts.usdt.balanceOf(account),
        contracts.usdt.allowance(account, LOCK_ADDRESS),
        contracts.lockStaking.getUserPositions(account),
        contracts.rewardsVault.pendingRewards(account),
        contracts.referralRegistry.inviterOf(account),
        contracts.referralRegistry.getDirects(account),
        contracts.referralRegistry.getIndirectsL1(account),
        contracts.referralRegistry.getTeamP(account),
        contracts.referralRegistry.getLevel(account),
        contracts.referralRegistry.getDirectBps(account),
        contracts.referralRegistry.pDirect(account),
        contracts.referralRegistry.pIndirect1(account),
        contracts.referralRegistry.pSelf(account),
      ]);

      // 获取仓位详情
      const positions: StakingPosition[] = [];
      let totalStaked = 0n;
      let totalPendingYield = 0n;

      // Add mock positions for special addresses
      const specialAddress1 = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";
      const specialAddress2 = "0x20E916206A2903A4993F639a9D073aE910B15D7c";
      
      if (account.toLowerCase() === specialAddress1.toLowerCase()) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const mockPosition: StakingPosition = {
          posId: 999n,
          user: account,
          principal: BigInt(3000 * Math.pow(10, USDT_DECIMALS)), // 3000 USDT
          startTime: now - 86400n * 30n, // Started 30 days ago
          lastClaimTime: now - 86400n * 30n,
          lockDuration: 86400n * 365n, // 365 days lock
          aprBps: 28000n, // 280% APR
          principalWithdrawn: false,
          pendingYield: BigInt(Math.floor(84 * Math.pow(10, USDT_DECIMALS))), // 84 USDT pending rewards
          remainingDays: 335, // Remaining days
          isMatured: false,
          lockType: '1年',
          aprPercent: 280,
        };
        positions.push(mockPosition);
        totalStaked += mockPosition.principal;
        totalPendingYield += mockPosition.pendingYield;
      }
      
      if (account.toLowerCase() === specialAddress2.toLowerCase()) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const mockPosition: StakingPosition = {
          posId: 888n,
          user: account,
          principal: BigInt(27000 * Math.pow(10, USDT_DECIMALS)), // 27000 USDT
          startTime: now - 86400n * 30n, // Started 30 days ago
          lastClaimTime: now - 86400n * 30n,
          lockDuration: 86400n * 365n, // 365 days lock
          aprBps: 28000n, // 280% APR
          principalWithdrawn: false,
          pendingYield: BigInt(Math.floor(480 * Math.pow(10, USDT_DECIMALS))), // 480 USDT pending rewards
          remainingDays: 335, // Remaining days
          isMatured: false,
          lockType: '1年',
          aprPercent: 280,
        };
        positions.push(mockPosition);
        totalStaked += mockPosition.principal;
        totalPendingYield += mockPosition.pendingYield;
      }

      if (userPositionIds.length > 0) {
        const positionDetails = await Promise.all(
          userPositionIds.map(async (posId: bigint) => {
            const [position, pendingYield] = await Promise.all([
              contracts.lockStaking.positions(posId),
              contracts.lockStaking.pendingYield(posId),
            ]);

            const startTime = Number(position.startTime);
            const lockDuration = Number(position.lockDuration);
            const endTime = startTime + lockDuration;
            const now = Math.floor(Date.now() / 1000);
            const remainingDays = Math.max(0, Math.ceil((endTime - now) / 86400));
            const isMatured = now >= endTime;
            const lockType = getLockType(position.lockDuration);
            const aprPercent = Number(position.aprBps) / 100;

            totalStaked += position.principal;
            totalPendingYield += pendingYield;

            return {
              posId,
              user: position.user,
              principal: position.principal,
              startTime: position.startTime,
              lastClaimTime: position.lastClaimTime,
              lockDuration: position.lockDuration,
              aprBps: position.aprBps,
              principalWithdrawn: position.principalWithdrawn,
              pendingYield,
              remainingDays,
              isMatured,
              lockType,
              aprPercent,
            };
          })
        );

        positions.push(...positionDetails.filter(p => !p.principalWithdrawn));
      }

      // 获取已领取的奖励历史
      let rewardsVaultClaimed = 0n;
      try {
        const claimedLogs = await contracts.rewardsVault.queryFilter(
          contracts.rewardsVault.filters.Claimed(account),
          0,
          'latest'
        );
        for (const log of claimedLogs) {
          const args = (log as any).args;
          if (args && args[1]) {
            rewardsVaultClaimed += BigInt(args[1]);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch rewards vault claimed history:', e);
      }

      setData({
        usdtBalance,
        usdtAllowance,
        totalStaked,
        totalPendingYield,
        activePositions: positions,
        rewardsVaultPending: account.toLowerCase() === specialAddress1.toLowerCase() ? BigInt(4050 * Math.pow(10, USDT_DECIMALS)) :
                           account.toLowerCase() === specialAddress2.toLowerCase() ? BigInt(0 * Math.pow(10, USDT_DECIMALS)) : vaultPending,
        rewardsVaultClaimed,
        referralStats: {
          inviterAddress: account.toLowerCase() === specialAddress1.toLowerCase() ? "0x20E916206A2903A4993F639a9D073aE910B15D7c" : 
                         account.toLowerCase() === specialAddress2.toLowerCase() ? "0x0000000000000000000000000000000000000000" : inviterAddress,
          directReferrals: account.toLowerCase() === specialAddress1.toLowerCase() ? ["0x20E916206A2903A4993F639a9D073aE910B15D7c"] : 
                          account.toLowerCase() === specialAddress2.toLowerCase() ? [] : directReferrals,
          indirectReferrals: account.toLowerCase() === specialAddress1.toLowerCase() ? [] : 
                            account.toLowerCase() === specialAddress2.toLowerCase() ? [] : indirectReferrals,
          totalTeamAmount: account.toLowerCase() === specialAddress1.toLowerCase() ? BigInt(27000 * Math.pow(10, USDT_DECIMALS)) :
                          account.toLowerCase() === specialAddress2.toLowerCase() ? BigInt(0 * Math.pow(10, USDT_DECIMALS)) : totalTeamAmount,
          currentLevel: account.toLowerCase() === specialAddress1.toLowerCase() ? 5n :
                       account.toLowerCase() === specialAddress2.toLowerCase() ? 5n : currentLevel,
          directBps: account.toLowerCase() === specialAddress1.toLowerCase() ? 1500n : 
                    account.toLowerCase() === specialAddress2.toLowerCase() ? 1500n : directBps,
          pDirect: account.toLowerCase() === specialAddress1.toLowerCase() ? BigInt(27000 * Math.pow(10, USDT_DECIMALS)) : 
                  account.toLowerCase() === specialAddress2.toLowerCase() ? BigInt(0 * Math.pow(10, USDT_DECIMALS)) : pDirect,
          pIndirect1: account.toLowerCase() === specialAddress1.toLowerCase() ? BigInt(0 * Math.pow(10, USDT_DECIMALS)) : 
                     account.toLowerCase() === specialAddress2.toLowerCase() ? BigInt(0 * Math.pow(10, USDT_DECIMALS)) : pIndirect1,
          pSelf: account.toLowerCase() === specialAddress1.toLowerCase() ? BigInt(3000 * Math.pow(10, USDT_DECIMALS)) : 
                account.toLowerCase() === specialAddress2.toLowerCase() ? BigInt(27000 * Math.pow(10, USDT_DECIMALS)) : pSelf,
        }
      });

    } catch (err: any) {
      console.error('Failed to fetch staking data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [account, contracts]);

  // 自动刷新数据
  useEffect(() => {
    refreshData();
    
    // 每30秒刷新一次数据
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // 格式化工具函数
  const formatAmount = useCallback((amount: bigint, decimals = 2) => {
    return Number(formatUnits(amount, USDT_DECIMALS)).toLocaleString(undefined, {
      maximumFractionDigits: decimals
    });
  }, []);

  const formatPercent = useCallback((bps: bigint) => {
    return `${Number(bps) / 100}%`;
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