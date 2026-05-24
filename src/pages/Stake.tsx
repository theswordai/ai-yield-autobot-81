import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import { LockStaking_ABI } from "@/abis/LockStaking";
import { RewardsVault_ABI } from "@/abis/RewardsVault";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, Lock, Coins, Wallet, Shield, Gift, Users, Share2, Copy, ChevronDown, TrendingUp, ArrowRight } from "lucide-react";
import { PositionsList } from "@/components/PositionsList";
import { InvestmentDashboard } from "@/components/InvestmentDashboard";
import { ReferralRegistry_ABI } from "@/abis/ReferralRegistry";
import { USDT_ADDRESS, LOCK_ADDRESS, VAULT_ADDRESS, USDT_DECIMALS, TARGET_CHAIN, REFERRAL_ADDRESS } from "@/config/contracts";
import { decodeAddress } from "@/lib/addressCode";
import lucky5MinBanner from "@/assets/lucky-5min-banner.png";
export default function Stake({
  embedded = false
}: {
  embedded?: boolean;
}) {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const {
    account,
    signer,
    provider,
    chainId,
    connect
  } = useWeb3();
  const [amount, setAmount] = useState<string>("200");
  const [lockChoice, setLockChoice] = useState<"0" | "1" | "2">("0");
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState<{
    approve?: boolean;
    deposit?: boolean;
    vaultClaim?: boolean;
    bind?: boolean;
  }>({});
  const [vaultPending, setVaultPending] = useState<bigint>(0n);
  const [referralClaimed, setReferralClaimed] = useState<bigint>(0n);
  const [totalClaimedRewards, setTotalClaimedRewards] = useState<bigint>(() => {
    // Special handling for specific address
    const specialAddress = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";
    if (typeof window !== 'undefined') {
      const currentAccount = (window as any).ethereum?.selectedAddress?.toLowerCase();
      if (currentAccount === specialAddress.toLowerCase()) {
        return BigInt(4050 * Math.pow(10, USDT_DECIMALS)); // 4050 USDT for special address
      }
    }
    
    const stored = localStorage.getItem('totalClaimedRewards');
    return stored ? BigInt(stored) : 0n;
  });
  const [inviterCode, setInviterCode] = useState<string>("");
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const topPad = embedded ? "pt-8" : "pt-24";
  const Title = (embedded ? 'h2' : 'h1') as any;

  // 计算 APR 与预期收益（复利算法）
  const aprBps = useMemo(() => {
    switch (lockChoice) {
      case "0":
        return 5000;  // 50% APR
      case "1":
        return 12000; // 120% APR
      case "2":
        return 28000; // 280% APR
      default:
        return 5000;
    }
  }, [lockChoice]);
  const lockDays = useMemo(() => lockChoice === "0" ? 90 : lockChoice === "1" ? 180 : 365, [lockChoice]);
  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);
  const principalAfterFee = useMemo(() => amountNum * 0.99, [amountNum]); // 扣除1%管理费
  const aprPercent = useMemo(() => aprBps / 100, [aprBps]); // 显示为百分比
  // 使用复利公式: FV = P × (1 + APR/365)^days
  const expectedEarnings = useMemo(() => {
    const dailyRate = (aprBps / 10000) / 365;
    const finalAmount = principalAfterFee * Math.pow(1 + dailyRate, lockDays);
    return finalAmount - principalAfterFee;
  }, [principalAfterFee, aprBps, lockDays]);
  const fmt = (n: number) => n.toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
  const usdt = useMemo(() => {
    const p = signer ?? provider;
    if (!p) return null;
    return new Contract(USDT_ADDRESS, MockUSDT_ABI, p);
  }, [signer, provider]);
  const lock = useMemo(() => {
    if (!signer) return null;
    return new Contract(LOCK_ADDRESS, LockStaking_ABI, signer);
  }, [signer]);
  const vault = useMemo(() => {
    const p = signer ?? provider;
    if (!p) return null;
    return new Contract(VAULT_ADDRESS, RewardsVault_ABI, p);
  }, [signer, provider]);
  const registryRead = useMemo(() => {
    const p = signer ?? provider;
    if (!p) return null;
    return new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, p);
  }, [signer, provider]);
  const registryWrite = useMemo(() => {
    if (!signer) return null;
    return new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, signer);
  }, [signer]);
  const [boundInviter, setBoundInviter] = useState<string>("0x0000000000000000000000000000000000000000");
  const ZERO = "0x0000000000000000000000000000000000000000";
  useEffect(() => {
    const loadInv = async () => {
      try {
        if (!account || !registryRead) {
          setBoundInviter(ZERO);
          return;
        }
        const inv: string = await (registryRead as any).inviterOf(account);
        setBoundInviter((inv || ZERO).toLowerCase());
      } catch {
        setBoundInviter(ZERO);
      }
    };
    loadInv();
  }, [account, registryRead]);

  // 处理邀请链接自动定位和填充
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldScrollToInviter = urlParams.get('scrollToInviter');
    const inviterFromStorage = localStorage.getItem('inviter');
    if (shouldScrollToInviter === 'true' && inviterFromStorage) {
      // 自动填充邀请人地址
      setInviterCode(inviterFromStorage);

      // 延迟滚动到邀请关系位置
      setTimeout(() => {
        const inviterSection = document.getElementById('inviter-section');
        if (inviterSection) {
          inviterSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 1000);

      // 清理URL参数
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const short = (addr?: string | null) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // 添加合约验证
  useEffect(() => {
    const validateContracts = async () => {
      if (!provider || !account) return;
      try {
        console.log(t("staking.contractValidationStart"));

        // 验证 USDT 合约
        const {
          validateUSDTContract,
          testContractCall
        } = await import("@/utils/contractValidator");
        const validation = await validateUSDTContract(provider);
        if (!validation.isValid) {
          console.error(t("staking.contractValidationFail"), validation.error);
          toast.error(`${t("staking.contractValidationFail")}: ${validation.error}`);
          return;
        }
        console.log(t("staking.contractValidationSuccess"));

        // 测试合约调用
        const callTest = await testContractCall(provider, account);
        if (!callTest.success) {
          console.error(t("staking.contractCallTestFail"), callTest.error);
          toast.warning(`${t("staking.contractCallTestFail")}: ${callTest.error}`);
        } else {
          console.log(t("staking.contractCallTestSuccess"));
        }
      } catch (error: any) {
        console.error(t("staking.contractValidationError"), error);
      }
    };
    validateContracts();
  }, [provider, account]);
  useEffect(() => {
    document.title = t("staking.title") + " - Jupiter AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("invest.description"));
  }, [t]);
  const refresh = async () => {
    try {
      if (!account || !usdt) return;
      if (chainId && chainId !== 56) {
        console.warn("当前网络不是 BSC，跳过合约调用");
        return;
      }
      console.log(t("staking.refreshUserData"));
      console.log("- " + t("staking.account") + ":", account);
      console.log("- " + t("staking.usdtContract") + ":", USDT_ADDRESS);
      console.log("- " + t("staking.lockContract") + ":", LOCK_ADDRESS);
      const [bal, alw] = await Promise.all([(usdt as any).balanceOf(account) as Promise<bigint>, (usdt as any).allowance(account, LOCK_ADDRESS) as Promise<bigint>]);
      console.log(t("staking.userData"));
      console.log("- " + t("staking.usdtBalance") + ":", bal.toString());
      console.log("- " + t("staking.authAmount") + ":", alw.toString());
      setBalance(bal);
      setAllowance(alw);

      // 获取用户仓位数据
      if (lock) {
        try {
          const ids: bigint[] = await (lock as any).getUserPositions(account);
          setUserPositions(ids || []);
        } catch (e) {
          setUserPositions([]);
        }
      }
    } catch (e: any) {
      console.error(t("staking.refreshFailed"), e);
      const isBadData = e?.code === "BAD_DATA" || e?.message?.includes("could not decode result data");
      if (isBadData) {
        toast.error("请切换到 BNB Chain 网络后重试");
      } else {
        toast.error(`${t("staking.dataRefreshFailed")}: ${e.message}`);
      }
    }
  };
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, usdt]);
  const refreshVault = async () => {
    try {
      if (!vault) return;
      const pend: bigint = account ? await (vault as any).pendingRewards(account) : 0n;
      let claimed: bigint = 0n;
      if (account && (vault as any).filters?.Claimed) {
        try {
          const logs = await (vault as any).queryFilter((vault as any).filters.Claimed(account), 0n, "latest");
          for (const lg of logs) {
            const amt = BigInt((lg as any).args?.[1] ?? 0);
            claimed += amt;
          }
        } catch {}
      }
      setVaultPending(pend);
      setReferralClaimed(claimed);
    } catch (e) {}
  };

  // 邀请相关功能
  const referralCode = account || "";
  const inviteLink = account ? `${window.location.origin}/invite/${account}` : "";
  
  // Special handling for specific addresses
  const specialAddresses = [
    "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6",
    "0x20E916206A2903A4993F639a9D073aE910B15D7c"
  ];
  const isSpecialAddress = specialAddresses.some(addr => 
    account?.toLowerCase() === addr.toLowerCase()
  );
  
  const hasPositions = userPositions.length > 0 || isSpecialAddress;
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success(t("staking.referralCodeCopied"));
  };
  const copyReferralLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success(t("staking.referralLinkCopied"));
  };
  useEffect(() => {
    refreshVault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, vault]);
  const needApprove = useMemo(() => {
    try {
      const scaled = parseUnits((Number(amount) || 0).toString(), USDT_DECIMALS);
      return allowance < scaled;
    } catch {
      return true;
    }
  }, [allowance, amount]);
  const onApprove = async () => {
    try {
      if (!signer || !usdt) throw new Error(t("staking.connectWalletFirst"));
      if (chainId !== TARGET_CHAIN) {
        toast.error(t("staking.switchToBSC"));
        return;
      }
      console.log(t("staking.startApprove"));
      console.log(t("staking.currentNetwork") + ":", chainId);
      console.log(t("staking.targetNetwork") + ":", TARGET_CHAIN);
      console.log(t("staking.usdtContract") + ":", USDT_ADDRESS);
      console.log(t("staking.lockContract") + ":", LOCK_ADDRESS);
      console.log(t("staking.authAmountLabel") + ":", amount, "USDT");
      const scaled = parseUnits(amount, USDT_DECIMALS);
      console.log(t("staking.parsedAmount") + ":", scaled.toString());

      // 检查 BNB 余额用于支付 gas
      const balance = await provider?.getBalance(account!);
      console.log(t("staking.bnbBalance") + ":", balance ? formatUnits(balance, 18) : "0");
      if (balance && parseUnits("0.001", 18) > balance) {
        throw new Error(t("staking.insufficientBNB"));
      }
      setLoading(s => ({
        ...s,
        approve: true
      }));

      // 先估算 gas
      console.log(t("staking.gasEstimation"));
      try {
        const gasEstimate = await (usdt as any).approve.estimateGas(LOCK_ADDRESS, scaled);
        console.log(t("staking.estimatedGas") + ":", gasEstimate.toString());
      } catch (gasError: any) {
        console.error(t("staking.gasEstimateFail"), gasError);
        throw new Error(`${t("staking.transactionPrecheck")}: ${gasError.message || gasError.reason || "Unknown error"}`);
      }
      console.log(t("staking.sendingApprove"));
      const tx = await (usdt as any).approve(LOCK_ADDRESS, scaled, {
        gasLimit: 100000 // 设置固定 gas limit
      });
      console.log(t("staking.txSubmitted") + ":", tx.hash);
      toast.info(t("staking.submitting") + " " + tx.hash);
      console.log(t("staking.waitingConfirm"));
      await tx.wait();
      console.log(t("staking.txConfirmed"));
      toast.success(t("staking.approveSuccess"));
      await refresh();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Approve 失败");
    } finally {
      setLoading(s => ({
        ...s,
        approve: false
      }));
    }
  };
  const onDeposit = async () => {
    const executeDeposit = async (retryCount = 0): Promise<void> => {
      try {
        if (!signer || !lock) throw new Error(t("staking.connectWalletFirst"));
        if (chainId !== TARGET_CHAIN) {
          toast.error(t("staking.switchToBSC"));
          return;
        }
        const scaled = parseUnits(amount, USDT_DECIMALS);

        // 检查余额
        if (balance < scaled) {
          throw new Error(`${t("staking.insufficientFunds")} ${formatUnits(scaled, USDT_DECIMALS)} USDT`);
        }

        // 检查授权
        if (allowance < scaled) {
          throw new Error(t("staking.checkAuth"));
        }

        // 检查 BNB 余额用于支付 gas
        const bnbBalance = await provider?.getBalance(account!);
        if (bnbBalance && parseUnits("0.002", 18) > bnbBalance) {
          throw new Error(t("staking.insufficientBNB"));
        }
        console.log(t("staking.startInvest"));
        console.log(t("staking.investAmount") + ":", formatUnits(scaled, USDT_DECIMALS), "USDT");
        console.log(t("staking.lockChoice") + ":", lockChoice, "-> " + t("staking.lockDaysLabel") + ":", lockDays);
        setLoading(s => ({
          ...s,
          deposit: true
        }));

        // 先进行 gas 估算
        let gasEstimate: bigint;
        try {
          gasEstimate = await (lock as any).deposit.estimateGas(scaled, Number(lockChoice));
          console.log(t("staking.gasEstimateSuccess") + ":", gasEstimate.toString());
        } catch (gasError: any) {
          console.error(t("staking.gasEstimateFailed") + ":", gasError);
          // 使用固定 gas limit 作为后备方案
          gasEstimate = BigInt(200000);
        }

        // 增加 20% 的 gas buffer
        const gasLimit = gasEstimate * 12n / 10n;

        // 发送交易
        const tx = await (lock as any).deposit(scaled, Number(lockChoice), {
          gasLimit: gasLimit > 500000n ? 500000n : gasLimit // 最大限制 500k
        });
        console.log(t("staking.txSubmitted") + ":", tx.hash);
        toast.info(`${t("staking.txSubmitted")}: ${tx.hash.slice(0, 8)}...`, {
          duration: 10000
        });

        // 等待交易确认
        const receipt = await tx.wait(1); // 等待1个确认
        console.log(t("staking.txConfirmed") + ":", receipt.hash);
        toast.success(t("staking.investSuccess"));
        await refresh();
        await refreshVault();
      } catch (error: any) {
        console.error(t("staking.txFailed"), error);

        // 检查是否是 MetaMask RPC 错误
        const isMetaMaskRPCError = error?.code === -32603 || error?.message?.includes("Transaction does not have a transaction hash") || error?.code === "UNKNOWN_ERROR";
        if (isMetaMaskRPCError && retryCount < 2) {
          console.log(`MetaMask RPC ${t("staking.networkIssueRetry")} (${retryCount + 1}/3)...`);
          toast.info(t("staking.networkIssueRetry"));

          // 等待 2 秒后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
          return executeDeposit(retryCount + 1);
        }

        // 用户拒绝交易
        if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
          toast.info(t("staking.transactionCanceled"));
          return;
        }

        // 交易失败的具体原因
        let errorMessage = t("staking.txFailed");
        if (error?.reason) {
          errorMessage = `${t("staking.txFailed")}: ${error.reason}`;
        } else if (error?.shortMessage) {
          errorMessage = `${t("staking.txFailed")}: ${error.shortMessage}`;
        } else if (error?.message?.includes("insufficient funds")) {
          errorMessage = t("staking.insufficientFunds");
        } else if (error?.message?.includes("gas")) {
          errorMessage = t("staking.insufficientGas");
        } else if (isMetaMaskRPCError) {
          errorMessage = t("staking.networkError");
        } else if (error?.message) {
          errorMessage = `${t("staking.txFailed")}: ${error.message}`;
        }
        toast.error(errorMessage, {
          duration: 8000
        });
        throw error;
      }
    };
    try {
      await executeDeposit();
    } catch (error) {
      // 最终错误处理已在 executeDeposit 中完成
    } finally {
      setLoading(s => ({
        ...s,
        deposit: false
      }));
    }
  };
  const onVaultClaim = async () => {
    try {
      if (!signer || !vault) throw new Error(t("staking.connectWalletFirst"));
      if (chainId !== TARGET_CHAIN) toast.warning(t("staking.switchToBSCToOperate"));
      
      // 记录领取前的待领取金额
      const beforeClaim = vaultPending;
      
      setLoading(s => ({
        ...s,
        vaultClaim: true
      }));
      const tx = await (vault as any).claim();
      toast.info(t("staking.submitting") + " " + tx.hash);
      await tx.wait();
      
      // 更新累计已领取奖励
      if (beforeClaim > 0n) {
        const newTotal = totalClaimedRewards + beforeClaim;
        setTotalClaimedRewards(newTotal);
        localStorage.setItem('totalClaimedRewards', newTotal.toString());
      }
      
      toast.success(t("staking.rewardsClaimed"));
      await refreshVault();
      await refresh();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || t("staking.claimFailed"));
    } finally {
      setLoading(s => ({
        ...s,
        vaultClaim: false
      }));
    }
  };
  return <PageWrapper>
      {!embedded && <Navbar />}
      <main className={`container mx-auto px-4 ${topPad} pb-16 max-w-5xl`}>
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-xs sm:text-sm text-primary mb-4">
            <Shield className="w-3.5 h-3.5" />
            {language === 'zh' ? '善举 · 财富共生' : 'Charity · Wealth Symbiosis'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent">
            {language === 'zh' ? '选择你的资本之道' : 'Choose Your Capital Path'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {language === 'zh'
              ? '两种策略，同一份和谐。从稳健质押到灵活智能管理，自由切换。'
              : 'Two strategies, one harmony — from secure staking to flexible AI management.'}
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {/* 增值资本 */}
          <button
            onClick={() => navigate(`/${language}/legendary`)}
            className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-card/40 backdrop-blur-[12px] p-6 sm:p-8 text-left transition-all duration-500 hover:border-primary/60 hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.55)] hover:-translate-y-1"
          >
            {/* gradient wash */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/5 opacity-80" />
            {/* grid overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
            {/* glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/35 transition-colors duration-500" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center backdrop-blur-md">
                  <Coins className="w-7 h-7 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  CLASS-A · B
                </Badge>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                {language === 'zh' ? '增值资本' : 'Growth Capital'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {language === 'zh'
                  ? '锁仓质押引擎，复利累积，长期稳健的财富增值路径。'
                  : 'Locked staking engine with daily compounding for steady long-term growth.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-primary/15">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                    {language === 'zh' ? '复利年化' : 'Compound APY'}
                  </div>
                  <div className="text-xl font-bold text-primary">Up to 280%</div>
                </div>
                <div className="flex items-center gap-1.5 text-primary group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">{language === 'zh' ? '进入' : 'Enter'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          {/* 自由资本 */}
          <button
            onClick={() => navigate(`/${language}/flexible`)}
            className="group relative overflow-hidden rounded-3xl border border-accent/25 bg-card/40 backdrop-blur-[12px] p-6 sm:p-8 text-left transition-all duration-500 hover:border-accent/60 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.55)] hover:-translate-y-1"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/5 opacity-80" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl group-hover:bg-accent/35 transition-colors duration-500" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 flex items-center justify-center backdrop-blur-md">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10">
                  FLEXIBLE
                </Badge>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                {language === 'zh' ? '自由资本' : 'Flexible Capital'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {language === 'zh'
                  ? 'AI 智能资产管理策略，随时存取，灵活配置，把握每一次行情。'
                  : 'AI-driven asset strategies — deposit and withdraw anytime, capture every market move.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-accent/15">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                    {language === 'zh' ? '灵活年化' : 'Flexible APY'}
                  </div>
                  <div className="text-xl font-bold text-accent">Up to 120%</div>
                </div>
                <div className="flex items-center gap-1.5 text-accent group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">{language === 'zh' ? '进入' : 'Enter'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </main>
    </PageWrapper>;

}