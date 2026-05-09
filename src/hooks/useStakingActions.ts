import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "ethers";
import { toast } from "sonner";
import { useWeb3 } from "./useWeb3";
import { useContracts } from "./useContracts";
import { USDT_DECIMALS, TARGET_CHAIN, LOCK_ADDRESS } from "@/config/contracts";
import { bumpHistoryRefresh } from "@/lib/historyRefresh";

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
      bumpHistoryRefresh();
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
      bumpHistoryRefresh();
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
      bumpHistoryRefresh();
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

  // 一键复投（claim + approve + deposit）
  const compoundYield = useCallback(async (posId: bigint, lockChoice: 0 | 1 | 2) => {
    if (!checkConnection() || !checkNetwork()) return false;

    const actionKey = 'compound';
    setActionLoading(actionKey, true);

    try {
      // 第1步：领取收益
      toast.info("第 1/3 步：正在领取收益...");
      const claimTx = await writeContracts!.lockStaking.claim(posId);
      const claimReceipt = await claimTx.wait();
      
      // 从交易收据中解析实际领取金额
      let claimedAmount = 0n;
      for (const log of claimReceipt.logs) {
        try {
          // 查找 Transfer 事件 (USDT 合约触发的)
          if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            // Transfer(from, to, value)
            const value = log.data;
            claimedAmount = BigInt(value);
            break;
          }
        } catch (e) {
          console.error('解析事件失败:', e);
        }
      }

      if (claimedAmount === 0n) {
        toast.error("无法确定领取金额，请手动操作");
        return false;
      }

      const claimedAmountFormatted = Number(formatUnits(claimedAmount, USDT_DECIMALS)).toFixed(2);
      toast.success(`收益已领取：${claimedAmountFormatted} USDT`);

      // 第2步：检查金额是否足够复投
      const minDeposit = parseUnits("200", USDT_DECIMALS);
      if (claimedAmount < minDeposit) {
        toast.warning(`复投金额不足 200 USDT（实际 ${claimedAmountFormatted} USDT），收益已领取到钱包`);
        return false;
      }

      // 第3步：授权 USDT
      toast.info(`第 2/3 步：正在授权 ${claimedAmountFormatted} USDT...`);
      const approveTx = await writeContracts!.usdt.approve(LOCK_ADDRESS, claimedAmount);
      await approveTx.wait();
      toast.success("授权成功");

      // 第4步：重新质押
      toast.info(`第 3/3 步：正在复投 ${claimedAmountFormatted} USDT...`);
      const depositTx = await writeContracts!.lockStaking.deposit(claimedAmount, lockChoice);
      await depositTx.wait();
      
      toast.success(`🎉 复投成功！${claimedAmountFormatted} USDT 已重新质押`);
      return true;

    } catch (error: any) {
      console.error('Compound failed:', error);
      if (error.code === 4001) {
        toast.info("交易已取消");
      } else {
        const step = error?.message?.includes('claim') ? '领取' : 
                     error?.message?.includes('approve') ? '授权' : '复投';
        toast.error(error?.shortMessage || error?.message || `${step}失败`);
      }
      return false;
    } finally {
      setActionLoading(actionKey, false);
    }
  }, [checkConnection, checkNetwork, writeContracts, setActionLoading]);

  return {
    loading,
    approveUSDT,
    deposit,
    claimYield,
    withdraw,
    claimReferralRewards,
    bindReferrer,
    compoundYield,
  };
}