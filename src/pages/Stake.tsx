import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
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
import { DollarSign, Lock, Coins, Wallet, Shield, Gift, Users, Share2, Copy, ChevronDown } from "lucide-react";
import { PositionsList } from "@/components/PositionsList";
import { InvestmentDashboard } from "@/components/InvestmentDashboard";
import { ReferralRegistry_ABI } from "@/abis/ReferralRegistry";
import { USDT_ADDRESS, LOCK_ADDRESS, VAULT_ADDRESS, USDT_DECIMALS, TARGET_CHAIN, REFERRAL_ADDRESS } from "@/config/contracts";
import { decodeAddress } from "@/lib/addressCode";
export default function Stake({
  embedded = false
}: {
  embedded?: boolean;
}) {
  const { t } = useI18n();
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
      toast.error(`${t("staking.dataRefreshFailed")}: ${e.message}`);
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
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className={`container mx-auto px-4 ${topPad} pb-12 max-w-6xl relative z-10`}>
        <div className="mb-8 text-center px-2">
          <Title className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-snug">
            <span className="block mb-1">{t("staking.heroTitleLine1")}</span>
            <span className="block text-xl sm:text-3xl font-medium text-muted-foreground mb-1">{t("staking.heroTitleLine2")}</span>
            <span className="block text-base sm:text-xl font-normal text-foreground/70">{t("staking.heroTitleLine3")}</span>
          </Title>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              {t("staking.contractSafeguard")}
            </Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              <Users className="w-3 h-3 mr-1" />
              {t("staking.transparentOnChain")}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
              <Gift className="w-3 h-3 mr-1" />
              {t("staking.communityDriven")}
            </Badge>
          </div>
        </div>

        {/* 钱包状态卡片 */}
        <Card className="mb-8 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-primary/20">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {t("staking.walletStatus")}
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t("staking.walletAddress")}</p>
                <p className="font-mono text-sm">{short(account) || t("staking.notConnected")}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t("staking.network")}</p>
                <p className="font-semibold">{chainId ?? "-"}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t("staking.usdtBalance")}</p>
                <p className="font-semibold">{formatUnits(balance, USDT_DECIMALS)}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t("staking.allowance")}</p>
                <p className="font-semibold">{formatUnits(allowance, USDT_DECIMALS)}</p>
              </div>
            </div>
            {!account && <div className="mt-4 text-center">
              <Button className="bg-gradient-primary hover:bg-gradient-primary/90" onClick={connect}>
                <Wallet className="w-4 h-4 mr-2" />
                {t("staking.connectWallet")}
              </Button>
              </div>}
          </CardContent>
        </Card>

        {/* 投资数据可视化 */}
        {amountNum > 0 && <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            {t("staking.investmentAnalysis")}
          </h3>
            <InvestmentDashboard principalAfterFee={principalAfterFee} aprPercent={aprPercent} expectedEarnings={expectedEarnings} lockDays={lockDays} lockChoice={lockChoice} />
          </div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 投资设置 */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("staking.charityInvestmentConfig")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">{t("staking.investAmountLabel")}</Label>
                  <Input id="amount" type="number" min={"0"} value={amount} onChange={e => setAmount(e.target.value)} placeholder={t("staking.enterAmount")} className="text-lg h-12" />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">{t("staking.lockPeriodLabel")}</Label>
                  <RadioGroup value={lockChoice} onValueChange={(v: any) => setLockChoice(v)} className="grid grid-cols-1 gap-3">
                    <label htmlFor="l0" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l0" value="0" />
                        <div>
                          <div className="font-semibold">{t("staking.ninetyDaysLock")}</div>
                          <div className="text-sm text-muted-foreground">
                            APR: 50% | APY: 64.82% <span className="text-accent">({t("staking.compound")})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{t("staking.shortTerm")}</Badge>
                    </label>
                    <label htmlFor="l1" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l1" value="1" />
                        <div>
                          <div className="font-semibold">{t("staking.oneEightyDaysLock")}</div>
                          <div className="text-sm text-muted-foreground">
                            APR: 120% | APY: 231.36% <span className="text-accent">({t("staking.compound")})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{t("staking.mediumTerm")}</Badge>
                    </label>
                    <label htmlFor="l2" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l2" value="2" />
                        <div>
                          <div className="font-semibold">{t("staking.threeSixtyFiveDaysLock")}</div>
                          <div className="text-sm text-muted-foreground">
                            APR: 280% | APY: 1526.99% <span className="text-accent font-semibold">({t("staking.compound")} 🚀)</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">{t("staking.longTerm")}</Badge>
                    </label>
                  </RadioGroup>
                </div>

                {/* 邀请关系 */}
                <div id="inviter-section" className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t("staking.referralRelation")}
                  </Label>
                  {boundInviter && boundInviter !== ZERO ? <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">{t("staking.boundSuperior")}<span className="font-mono">0x…{boundInviter.slice(-4)}</span></span>
                      </div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">{t("staking.bound")}</Badge>
                    </div> : <div className="space-y-3">
                      <Input value={inviterCode} onChange={e => setInviterCode(e.target.value)} placeholder={t("staking.enterInviterCode")} className="h-11" />
                      <Button variant="outline" disabled={!account || loading.bind} onClick={async () => {
                    const input = inviterCode.trim();
                    const stored = (localStorage.getItem('inviter') || '').toLowerCase();
                    let addr: string | null = null;
                    if (/^0x[a-fA-F0-9]{40}$/.test(input)) addr = input.toLowerCase();else {
                      try {
                        if (/^[A-Za-z0-9_-]{10,}$/.test(input)) {
                          const d = decodeAddress(input);
                          if (/^0x[a-fA-F0-9]{40}$/.test(d)) addr = d.toLowerCase();
                        }
                      } catch {}
                      if (!addr && /^[a-fA-F0-9]{8}$/.test(input)) {
                        if (stored && stored.endsWith(input.toLowerCase())) addr = stored;
                      }
                    }
                    if (!addr) {
                      toast.warning(t("staking.cannotConfirmInviter"));
                      return;
                    }
                    try {
                      if (!registryWrite || !signer) throw new Error(t("staking.connectWalletFirst"));
                      if (chainId !== TARGET_CHAIN) {
                        toast.warning(t("staking.switchToBSCToOperate"));
                        return;
                      }
                      setLoading(s => ({
                        ...s,
                        bind: true
                      }));
                      const tx = await (registryWrite as any).bind(addr);
                      toast.info(t("staking.submitting") + " " + tx.hash);
                      await tx.wait();
                      toast.success(t("staking.bindingSuccess"));
                      localStorage.setItem('inviter', addr);
                      setBoundInviter(addr);
                    } catch (e: any) {
                      toast.error(e?.shortMessage || e?.message || t("staking.bindingFailed"));
                    } finally {
                      setLoading(s => ({
                        ...s,
                        bind: false
                      }));
                    }
                      }} className={`w-full electric-button ${(!boundInviter || boundInviter === ZERO) ? 'animate-breathing-glow' : ''}`}>
                        <Users className="w-4 h-4 mr-2" />
                        {t("staking.bindInviter")}
                      </Button>
                      <p className="text-sm text-slate-50 font-medium">{t("staking.enterInviterAddress")}</p>
                    </div>}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 h-12" disabled={!account || loading.approve} onClick={onApprove}>
                    {loading.approve ? t("staking.approvingButton") : t("staking.approveButton")}
                  </Button>
                  <Button className="flex-1 h-12 text-white animate-breathing-blue animate-marquee-bg bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-[length:200%_100%] hover:from-blue-700 hover:via-blue-600 hover:to-blue-700" disabled={!account || loading.deposit || needApprove} onClick={onDeposit}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {loading.deposit ? t("staking.investingButton") : t("staking.startInvestButton")}
                  </Button>
                </div>
                {needApprove && <p className="text-xs text-muted-foreground text-center">
                    {t("staking.approveFirst")}
                  </p>}

                {/* 财富与善意的分配机制 */}
                <Card className="mt-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>{t("wealthDistribution.title")}</span>
                          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div className="space-y-3 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-primary">{t("wealthDistribution.managementFees")}</h4>
                            <p className="text-muted-foreground">{t("wealthDistribution.managementFeesDesc")}</p>
                            <ul className="space-y-1 ml-4">
                              <li>{t("wealthDistribution.managementFee")}</li>
                              <li>{t("wealthDistribution.handlingFee")}</li>
                            </ul>
                            <p className="font-medium text-accent">{t("wealthDistribution.totalFee")}</p>
                            <p className="text-muted-foreground">{t("wealthDistribution.feeUsage")}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-primary">{t("wealthDistribution.profitLocking")}</h4>
                            <p className="text-muted-foreground">{t("wealthDistribution.profitLockingDesc")}</p>
                            <ul className="space-y-1 ml-4">
                              <li>{t("wealthDistribution.lock90Days")}</li>
                              <li>{t("wealthDistribution.lock180Days")}</li>
                              <li>{t("wealthDistribution.lock365Days")}</li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-primary">{t("wealthDistribution.profitDistribution")}</h4>
                            <p className="text-muted-foreground">{t("wealthDistribution.profitDistributionDesc")}</p>
                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-accent">{t("wealthDistribution.charity50")}</p>
                                <p className="text-muted-foreground ml-4">{t("wealthDistribution.charityDesc")}</p>
                              </div>
                              <div>
                                <p className="font-medium">{t("wealthDistribution.tech10")}</p>
                                <p className="text-muted-foreground ml-4">{t("wealthDistribution.techDesc")}</p>
                              </div>
                              <div>
                                <p className="font-medium">{t("wealthDistribution.market10")}</p>
                                <p className="text-muted-foreground ml-4">{t("wealthDistribution.marketDesc")}</p>
                              </div>
                              <div>
                                <p className="font-medium">{t("wealthDistribution.team10")}</p>
                                <p className="text-muted-foreground ml-4">{t("wealthDistribution.teamDesc")}</p>
                              </div>
                              <div>
                                <p className="font-medium">{t("wealthDistribution.treasury20")}</p>
                                <p className="text-muted-foreground ml-4">{t("wealthDistribution.treasuryDesc")}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-primary">{t("wealthDistribution.strategicValue")}</h4>
                            <p className="text-muted-foreground">{t("wealthDistribution.strategicValueDesc")}</p>
                            <ul className="space-y-1 ml-4">
                              <li>{t("wealthDistribution.forInvestors")}</li>
                              <li>{t("wealthDistribution.forSociety")}</li>
                              <li>{t("wealthDistribution.forPlatform")}</li>
                            </ul>
                          </div>

                          <div className="border-t pt-3 mt-4">
                            <p className="font-semibold text-primary">{t("wealthDistribution.summary")}</p>
                            <p className="text-muted-foreground font-medium">{t("wealthDistribution.summaryText")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </CardContent>
            </Card>

            {/* 我的仓位 */}
            <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  {t("staking.myPositions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PositionsList account={account} lock={lock as any} chainId={chainId} targetChain={TARGET_CHAIN} usdtDecimals={USDT_DECIMALS} />
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 奖励金库 */}
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-accent" />
                  {t("staking.lightUpRewards")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("staking.claimableRewards")}</span>
                    <span className="font-mono font-semibold">{formatUnits(vaultPending ?? 0n, USDT_DECIMALS)} USDT</span>
                  </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">{t("staking.lightedHeartRewards")}</span>
                     <span className="font-mono text-xs">
                       {isSpecialAddress ? "4,050.00" : formatUnits(totalClaimedRewards ?? 0n, USDT_DECIMALS)} USDT
                     </span>
                   </div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90" disabled={!account || loading.vaultClaim || vaultPending === 0n} onClick={onVaultClaim}>
                  <Gift className="w-4 h-4 mr-2" />
                  {loading.vaultClaim ? t("staking.claimingButton") : t("staking.claimRewardsButton")}
                </Button>
              </CardContent>
            </Card>

            {/* 我的邀请地址 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  {t("staking.myInviteAddress")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!account ? <div className="text-sm text-muted-foreground text-center py-4">
                    {t("staking.connectWalletToView")}
                  </div> : <>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">{t("staking.invitationAddress")}</label>
                       <div className="flex gap-2">
                         <Input value={referralCode} readOnly className="font-mono text-xs" />
                         <Button onClick={copyReferralCode} variant="outline" size="icon">
                           <Copy className="w-4 h-4" />
                         </Button>
                       </div>
                     </div>
                  </>}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>;
}