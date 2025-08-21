import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "ethers";
import { toast } from "sonner";
import { useWeb3 } from "./useWeb3";
import { useContracts } from "./useContracts";
import { USDT_DECIMALS, TARGET_CHAIN, LOCK_ADDRESS } from "@/config/contracts";

export function useStakingActions() {
  const { account, chainId } = useWeb3(); 
  const { writeContracts } = useContracts();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setActionLoading = useCallback((action: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  }, []);

  // 检查网络
  const checkNetwork = useCallback(() => {
    if (chainId !== TARGET_CHAIN) {
      toast.error(`请切换到 BSC 主网 (Chain ID: ${TARGET_CHAIN})`);
      return false;
    }
    return true;
  }, [chainId]);

  // 检查连接状态
  const checkConnection = useCallback(() => {
    if (!account || !writeContracts) {
      toast.error("请先连接钱包");
      return false;
    }
    return true;
  }, [account, writeContracts]);

  // 授权 USDT
  const approveUSDT = useCallback(async (amount: string) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'approve';
    setActionLoading(actionKey, true);

    try {
      const amountBn = parseUnits(amount, USDT_DECIMALS);
      
      // 估算 Gas
      let gasEstimate: bigint;
      try {
        gasEstimate = await (writeContracts!.usdt as any).approve.estimateGas(LOCK_ADDRESS, amountBn);
      } catch {
        gasEstimate = 100000n; // 备用 gas 限制
      }
      
      const tx = await writeContracts!.usdt.approve(LOCK_ADDRESS, amountBn);

      toast.info(`授权交易已提交: ${tx.hash.slice(0, 8)}...`);
      await tx.wait();
      toast.success("USDT 授权成功");
      return true;

    } catch (error: any) {
      console.error('Approve failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "授权失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  // 质押存款
  const deposit = useCallback(async (amount: string, lockChoice: 0 | 1 | 2) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'deposit';
    setActionLoading(actionKey, true);

    try {
      const amountBn = parseUnits(amount, USDT_DECIMALS);
      
      // 估算 Gas
      let gasEstimate: bigint;
      try {
        gasEstimate = await (writeContracts!.lockStaking as any).deposit.estimateGas(amountBn, lockChoice);
      } catch {
        gasEstimate = 200000n; // 备用 gas 限制
      }

      const tx = await writeContracts!.lockStaking.deposit(amountBn, lockChoice);

      toast.info(`质押交易已提交: ${tx.hash.slice(0, 8)}...`);
      await tx.wait();
      toast.success("质押成功！收益已开始计算");
      return true;

    } catch (error: any) {
      console.error('Deposit failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "质押失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  // 领取收益
  const claimYield = useCallback(async (posId: bigint) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'claim';
    setActionLoading(actionKey, true);

    try {
      const tx = await writeContracts!.lockStaking.claim(posId);
      toast.info(`领取交易已提交: ${tx.hash.slice(0, 8)}...`);
      await tx.wait();
      toast.success("收益领取成功");
      return true;

    } catch (error: any) {
      console.error('Claim failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "领取失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  // 赎回本金
  const withdraw = useCallback(async (posId: bigint) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'withdraw';
    setActionLoading(actionKey, true);

    try {
      const tx = await writeContracts!.lockStaking.withdraw(posId);
      toast.info(`赎回交易已提交: ${tx.hash.slice(0, 8)}...`);
      await tx.wait();
      toast.success("赎回成功");
      return true;

    } catch (error: any) {
      console.error('Withdraw failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "赎回失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  // 领取推荐奖励
  const claimReferralRewards = useCallback(async () => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'claimReferral';
    setActionLoading(actionKey, true);

    try {
      const tx = await writeContracts!.rewardsVault.claim();
      toast.info(`奖励领取交易已提交: ${tx.hash.slice(0, 8)}...`);
      const receipt = await tx.wait();
      
      // 从交易收据中获取实际领取金额
      const claimedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = writeContracts!.rewardsVault.interface.parseLog(log);
          return parsed?.name === 'Claimed';
        } catch {
          return false;
        }
      });
      
      if (claimedEvent) {
        const decoded = writeContracts!.rewardsVault.interface.parseLog(claimedEvent);
        const amount = decoded?.args[1];
        if (amount && amount > 0n) {
          const amountFormatted = Number(formatUnits(amount, USDT_DECIMALS)).toFixed(2);
          toast.success(`推荐奖励领取成功！获得 ${amountFormatted} USDT`);
        } else {
          toast.info("当前暂无可领取奖励");
        }
      } else {
        toast.success("推荐奖励领取成功");
      }
      return true;

    } catch (error: any) {
      console.error('Claim referral rewards failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "奖励领取失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  // 绑定推荐关系
  const bindReferrer = useCallback(async (referrerAddress: string) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'bind';
    setActionLoading(actionKey, true);

    try {
      // 验证地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(referrerAddress)) {
        toast.error("无效的推荐人地址");
        return false;
      }

      if (referrerAddress.toLowerCase() === account!.toLowerCase()) {
        toast.error("不能绑定自己为推荐人");
        return false;
      }

      const tx = await writeContracts!.referralRegistry.bind(referrerAddress);
      toast.info(`绑定交易已提交: ${tx.hash.slice(0, 8)}...`);
      await tx.wait();
      toast.success("推荐关系绑定成功");
      return true;

    } catch (error: any) {
      console.error('Bind referrer failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        toast.error(error?.shortMessage || error?.message || "绑定失败");
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading, account]);

  return {
    loading,
    approveUSDT,
    deposit,
    claimYield,
    withdraw,
    claimReferralRewards,
    bindReferrer,
  };
}