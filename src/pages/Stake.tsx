import { useEffect, useMemo, useState } from "react";
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
import { DollarSign, Lock, Coins, Wallet, Shield, Gift, Users, Share2, Copy } from "lucide-react";
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
  const [inviterCode, setInviterCode] = useState<string>("");
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const topPad = embedded ? "pt-8" : "pt-24";
  const Title = (embedded ? 'h2' : 'h1') as any;

  // 计算 APR 与预期收益（与链上参数保持一致）
  const aprBps = useMemo(() => {
    switch (lockChoice) {
      case "0":
        return 25 * 365;
      // 0.25%/day -> 91.25% APR -> 9125 bps (浮动范围: 50-91.25%)
      case "1":
        return 40 * 365;
      // 0.4%/day  -> 146% APR   -> 14600 bps (浮动范围: 120-146%)
      case "2":
        return 93.15 * 365;
      // 0.9315%/day -> 340% APR -> 34000 bps (浮动范围: 280-340%)
      default:
        return 25 * 365;
    }
  }, [lockChoice]);
  const lockDays = useMemo(() => lockChoice === "0" ? 90 : lockChoice === "1" ? 180 : 365, [lockChoice]);
  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);
  const principalAfterFee = useMemo(() => amountNum * 0.99, [amountNum]); // 扣除1%管理费
  const aprPercent = useMemo(() => aprBps / 100, [aprBps]); // 显示为百分比
  const expectedEarnings = useMemo(() => principalAfterFee * (aprBps / 10000) * (lockDays / 365), [principalAfterFee, aprBps, lockDays]);
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
        console.log("🔍 开始验证合约...");

        // 验证 USDT 合约
        const {
          validateUSDTContract,
          testContractCall
        } = await import("@/utils/contractValidator");
        const validation = await validateUSDTContract(provider);
        if (!validation.isValid) {
          console.error("USDT 合约验证失败:", validation.error);
          toast.error(`USDT 合约验证失败: ${validation.error}`);
          return;
        }
        console.log("✅ USDT 合约验证成功");

        // 测试合约调用
        const callTest = await testContractCall(provider, account);
        if (!callTest.success) {
          console.error("合约调用测试失败:", callTest.error);
          toast.warning(`合约调用异常: ${callTest.error}`);
        } else {
          console.log("✅ 合约调用测试成功");
        }
      } catch (error: any) {
        console.error("合约验证过程出错:", error);
      }
    };
    validateContracts();
  }, [provider, account]);
  useEffect(() => {
    document.title = "USDT 质押 - Jupiter AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "USDT 质押前端：连接钱包、Approve、Deposit、链上交互");
  }, []);
  const refresh = async () => {
    try {
      if (!account || !usdt) return;
      console.log("🔄 刷新用户数据...");
      console.log("- 账户:", account);
      console.log("- USDT 合约:", USDT_ADDRESS);
      console.log("- 锁仓合约:", LOCK_ADDRESS);
      const [bal, alw] = await Promise.all([(usdt as any).balanceOf(account) as Promise<bigint>, (usdt as any).allowance(account, LOCK_ADDRESS) as Promise<bigint>]);
      console.log("📊 用户数据:");
      console.log("- USDT 余额:", bal.toString());
      console.log("- 授权额度:", alw.toString());
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
      console.error("❌ 刷新数据失败:", e);
      toast.error(`数据刷新失败: ${e.message}`);
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
  const hasPositions = userPositions.length > 0;
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("邀请码已复制到剪贴板");
  };
  const copyReferralLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("邀请链接已复制到剪贴板");
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
      if (!signer || !usdt) throw new Error("请先连接钱包");
      if (chainId !== TARGET_CHAIN) {
        toast.error("请切换到 BSC 主网 (Chain ID: 56)");
        return;
      }
      console.log("开始 approve 操作...");
      console.log("当前网络:", chainId);
      console.log("目标网络:", TARGET_CHAIN);
      console.log("USDT 合约地址:", USDT_ADDRESS);
      console.log("锁仓合约地址:", LOCK_ADDRESS);
      console.log("授权金额:", amount, "USDT");
      const scaled = parseUnits(amount, USDT_DECIMALS);
      console.log("解析后金额:", scaled.toString());

      // 检查 BNB 余额用于支付 gas
      const balance = await provider?.getBalance(account!);
      console.log("BNB 余额:", balance ? formatUnits(balance, 18) : "0");
      if (balance && parseUnits("0.001", 18) > balance) {
        throw new Error("BNB 余额不足，无法支付交易费用");
      }
      setLoading(s => ({
        ...s,
        approve: true
      }));

      // 先估算 gas
      console.log("估算 gas...");
      try {
        const gasEstimate = await (usdt as any).approve.estimateGas(LOCK_ADDRESS, scaled);
        console.log("预估 gas:", gasEstimate.toString());
      } catch (gasError: any) {
        console.error("Gas 估算失败:", gasError);
        throw new Error(`交易预检失败: ${gasError.message || gasError.reason || "未知错误"}`);
      }
      console.log("发送 approve 交易...");
      const tx = await (usdt as any).approve(LOCK_ADDRESS, scaled, {
        gasLimit: 100000 // 设置固定 gas limit
      });
      console.log("交易已提交:", tx.hash);
      toast.info("提交中：" + tx.hash);
      console.log("等待交易确认...");
      await tx.wait();
      console.log("Approve 交易确认成功");
      toast.success("Approve 成功");
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
        if (!signer || !lock) throw new Error("请先连接钱包");
        if (chainId !== TARGET_CHAIN) {
          toast.error("请切换到 BSC 主网 (Chain ID: 56)");
          return;
        }
        const scaled = parseUnits(amount, USDT_DECIMALS);

        // 检查余额
        if (balance < scaled) {
          throw new Error(`余额不足，需要 ${formatUnits(scaled, USDT_DECIMALS)} USDT`);
        }

        // 检查授权
        if (allowance < scaled) {
          throw new Error(`请先授权足够的 USDT 额度`);
        }

        // 检查 BNB 余额用于支付 gas
        const bnbBalance = await provider?.getBalance(account!);
        if (bnbBalance && parseUnits("0.002", 18) > bnbBalance) {
          throw new Error("BNB 余额不足，无法支付交易费用");
        }
        console.log("开始投资操作...");
        console.log("投资金额:", formatUnits(scaled, USDT_DECIMALS), "USDT");
        console.log("锁仓选择:", lockChoice, "-> 锁仓天数:", lockDays);
        setLoading(s => ({
          ...s,
          deposit: true
        }));

        // 先进行 gas 估算
        let gasEstimate: bigint;
        try {
          gasEstimate = await (lock as any).deposit.estimateGas(scaled, Number(lockChoice));
          console.log("Gas 估算成功:", gasEstimate.toString());
        } catch (gasError: any) {
          console.error("Gas 估算失败:", gasError);
          // 使用固定 gas limit 作为后备方案
          gasEstimate = BigInt(200000);
        }

        // 增加 20% 的 gas buffer
        const gasLimit = gasEstimate * 12n / 10n;

        // 发送交易
        const tx = await (lock as any).deposit(scaled, Number(lockChoice), {
          gasLimit: gasLimit > 500000n ? 500000n : gasLimit // 最大限制 500k
        });
        console.log("交易已提交:", tx.hash);
        toast.info(`交易已提交: ${tx.hash.slice(0, 8)}...`, {
          duration: 10000
        });

        // 等待交易确认
        const receipt = await tx.wait(1); // 等待1个确认
        console.log("交易确认成功:", receipt.hash);
        toast.success("投资成功！收益已开始计算");
        await refresh();
        await refreshVault();
      } catch (error: any) {
        console.error("交易错误:", error);

        // 检查是否是 MetaMask RPC 错误
        const isMetaMaskRPCError = error?.code === -32603 || error?.message?.includes("Transaction does not have a transaction hash") || error?.code === "UNKNOWN_ERROR";
        if (isMetaMaskRPCError && retryCount < 2) {
          console.log(`MetaMask RPC 错误，尝试重试 (${retryCount + 1}/3)...`);
          toast.info("检测到网络问题，正在重试...");

          // 等待 2 秒后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
          return executeDeposit(retryCount + 1);
        }

        // 用户拒绝交易
        if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
          toast.info("交易已取消");
          return;
        }

        // 交易失败的具体原因
        let errorMessage = "投资失败";
        if (error?.reason) {
          errorMessage = `交易失败: ${error.reason}`;
        } else if (error?.shortMessage) {
          errorMessage = `交易失败: ${error.shortMessage}`;
        } else if (error?.message?.includes("insufficient funds")) {
          errorMessage = "余额不足，请检查 USDT 或 BNB 余额";
        } else if (error?.message?.includes("gas")) {
          errorMessage = "Gas 费用不足，请增加 BNB 余额";
        } else if (isMetaMaskRPCError) {
          errorMessage = "网络连接异常，请检查网络后重试";
        } else if (error?.message) {
          errorMessage = `交易失败: ${error.message}`;
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
      if (!signer || !vault) throw new Error("请先连接钱包");
      if (chainId !== TARGET_CHAIN) toast.warning("请切换到 BSC 主网再操作");
      setLoading(s => ({
        ...s,
        vaultClaim: true
      }));
      const tx = await (vault as any).claim();
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("奖励已领取");
      await refreshVault();
      await refresh();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "领取失败");
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
        <div className="mb-8 text-center">
          <Title className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">这是你的专属 算法驱动舱，AI 自动分配资产，汇聚 DeFi、CEX、跨链策略于一体，让资本流动即刻转化为全球善意回响。</Title>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              合约保障
            </Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              <Lock className="w-3 h-3 mr-1" />
              安全质押
            </Badge>
          </div>
        </div>

        {/* 钱包状态卡片 */}
        <Card className="mb-8 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              钱包状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">钱包地址</p>
                <p className="font-mono text-sm">{short(account) || "未连接"}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">网络</p>
                <p className="font-semibold">{chainId ?? "-"}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">USDT 余额</p>
                <p className="font-semibold">{formatUnits(balance, USDT_DECIMALS)}</p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">授权额度</p>
                <p className="font-semibold">{formatUnits(allowance, USDT_DECIMALS)}</p>
              </div>
            </div>
            {!account && <div className="mt-4 text-center">
                <Button className="bg-gradient-primary hover:bg-gradient-primary/90" onClick={connect}>
                  <Wallet className="w-4 h-4 mr-2" />
                  连接钱包
                </Button>
              </div>}
          </CardContent>
        </Card>

        {/* 投资数据可视化 */}
        {amountNum > 0 && <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              投资分析
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
                  慈善投资配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">投资金额 (USDT)</Label>
                  <Input id="amount" type="number" min={"0"} value={amount} onChange={e => setAmount(e.target.value)} placeholder="输入投资金额" className="text-lg h-12" />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">锚定期限</Label>
                  <RadioGroup value={lockChoice} onValueChange={(v: any) => setLockChoice(v)} className="grid grid-cols-1 gap-3">
                    <label htmlFor="l0" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l0" value="0" />
                        <div>
                          <div className="font-semibold">90天锁仓</div>
                          <div className="text-sm text-muted-foreground">50-91.25% APR (浮动)</div>
                        </div>
                      </div>
                      <Badge variant="outline">短期</Badge>
                    </label>
                    <label htmlFor="l1" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l1" value="1" />
                        <div>
                          <div className="font-semibold">180天锁仓</div>
                          <div className="text-sm text-muted-foreground">120-146% APR (浮动)</div>
                        </div>
                      </div>
                      <Badge variant="outline">中期</Badge>
                    </label>
                    <label htmlFor="l2" className="flex items-center justify-between p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="l2" value="2" />
                        <div>
                          <div className="font-semibold">365天锁仓</div>
                          <div className="text-sm text-muted-foreground">280-340% APR (浮动)</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">长期</Badge>
                    </label>
                  </RadioGroup>
                </div>

                {/* 邀请关系 */}
                <div id="inviter-section" className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    邀请关系
                  </Label>
                  {boundInviter && boundInviter !== ZERO ? <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">已绑定上级：<span className="font-mono">0x…{boundInviter.slice(-4)}</span></span>
                      </div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">已绑定</Badge>
                    </div> : <div className="space-y-3">
                      <Input value={inviterCode} onChange={e => setInviterCode(e.target.value)} placeholder="输入邀请码或邀请人地址" className="h-11" />
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
                      toast.warning("无法确认邀请人：请使用邀请链接短码、后8位且已点击过邀请链接，或直接填完整地址");
                      return;
                    }
                    try {
                      if (!registryWrite || !signer) throw new Error("请先连接钱包");
                      if (chainId !== TARGET_CHAIN) {
                        toast.warning("请切换到 BSC 主网再操作");
                        return;
                      }
                      setLoading(s => ({
                        ...s,
                        bind: true
                      }));
                      const tx = await (registryWrite as any).bind(addr);
                      toast.info("提交中：" + tx.hash);
                      await tx.wait();
                      toast.success("绑定成功");
                      localStorage.setItem('inviter', addr);
                      setBoundInviter(addr);
                    } catch (e: any) {
                      toast.error(e?.shortMessage || e?.message || "绑定失败");
                    } finally {
                      setLoading(s => ({
                        ...s,
                        bind: false
                      }));
                    }
                  }} className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        绑定邀请人
                      </Button>
                      <p className="text-sm text-slate-50 font-medium">请填写您的邀请人钱包地址！</p>
                    </div>}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 h-12" disabled={!account || loading.approve} onClick={onApprove}>
                    {loading.approve ? "授权中..." : "授权 (Approve)"}
                  </Button>
                  <Button variant="secondary" className="flex-1 h-12" disabled={!account || loading.deposit || needApprove} onClick={onDeposit}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {loading.deposit ? "投资中..." : "开始投资"}
                  </Button>
                </div>
                {needApprove && <p className="text-xs text-muted-foreground text-center">
                    💡 需先授权 ≥ 投资金额，投资按钮将自动解锁
                  </p>}
              </CardContent>
            </Card>

            {/* 我的仓位 */}
            <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  我的仓位
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
                  点亮心灯奖励
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">可领取奖励</span>
                    <span className="font-mono font-semibold">{formatUnits(vaultPending ?? 0n, USDT_DECIMALS)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">已点亮心灯奖励</span>
                    <span className="font-mono text-xs">{formatUnits(referralClaimed ?? 0n, USDT_DECIMALS)} USDT</span>
                  </div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90" disabled={!account || loading.vaultClaim || vaultPending === 0n} onClick={onVaultClaim}>
                  <Gift className="w-4 h-4 mr-2" />
                  {loading.vaultClaim ? "领取中..." : "领取奖励"}
                </Button>
              </CardContent>
            </Card>

            {/* 我的邀请地址 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  我的邀请地址
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!account ? <div className="text-sm text-muted-foreground text-center py-4">
                    请先连接钱包
                  </div> : !hasPositions ? <div className="text-sm text-muted-foreground text-center py-4">
                    只有投资人才有邀请资格
                  </div> : <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">邀请地址</label>
                      <div className="flex gap-2">
                        <Input value={referralCode} readOnly className="font-mono text-xs" />
                        <Button onClick={copyReferralCode} variant="outline" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">邀请链接</label>
                      <div className="flex gap-2">
                        <Input value={inviteLink} readOnly className="font-mono text-xs" />
                        <Button onClick={copyReferralLink} variant="outline" size="icon">
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