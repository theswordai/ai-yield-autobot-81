import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { formatUnits, parseUnits } from "ethers";
import {
  Wallet, Coins, TrendingUp, Users, Award, Gift,
  Copy, Check, Lock, Clock, Info, AlertTriangle, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import { useWeb3 } from "@/hooks/useWeb3";
import { useFlexiblePool, formatUSDT, FlexiblePosition } from "@/hooks/useFlexiblePool";
import { FLEXIBLE_ADDRESS, USDT_DECIMALS } from "@/config/flexible";
import { Navbar } from "@/components/Navbar";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Contract } from "ethers";
import { FlexiblePool_ABI } from "@/abis/FlexiblePool";
import { useRewarder, formatUSDV, UsdvPositionStatus } from "@/hooks/useRewarder";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const LEVEL_RULES = [
  { lvl: 1, min: 200,    gens: 1 },
  { lvl: 2, min: 1000,   gens: 3 },
  { lvl: 3, min: 5000,   gens: 5 },
  { lvl: 4, min: 20000,  gens: 7 },
  { lvl: 5, min: 50000,  gens: 10 },
];

const COMMISSION_RATES = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2];

const short = (a: string) => (a && a !== ZERO_ADDR ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("已复制 / Copied");
    setTimeout(() => setCopied(null), 1500);
  };
  return { copied, copy };
};

export default function Flexible() {
  const { language } = useI18n();
  const isZh = language === "zh";
  const { account, connect, provider } = useWeb3();
  const poolRead = useMemo(
    () => (provider ? new Contract(FLEXIBLE_ADDRESS, FlexiblePool_ABI, provider) : null),
    [provider]
  );
  const {
    data, refresh, isBSC,
    bind, approve, deposit, closePosition, previewClose, claimCommission,
    loadDownlineByGen,
    actionLoading,
  } = useFlexiblePool();
  const rewarder = useRewarder(isZh);
  const { copied, copy } = useCopy();

  // Track positions for which the activate prompt has been shown to avoid spamming
  const promptedRef = useRef<Set<string>>(new Set());
  const prevPosIdsRef = useRef<Set<string>>(new Set());
  const [activatePrompt, setActivatePrompt] = useState<{ id: bigint } | null>(null);
  const [claimUsdvPrompt, setClaimUsdvPrompt] = useState<{ id: bigint; amount: bigint } | null>(null);

  // ---- inviter input (prefill from URL/localStorage) ----
  const [inviterInput, setInviterInput] = useState("");
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("inviter");
    const stored = localStorage.getItem("inviter") || "";
    setInviterInput(url || stored || "");
  }, []);

  // ---- deposit form ----
  const [amount, setAmount] = useState("");
  const minDepositNum = useMemo(
    () => Number(formatUnits(data.minDeposit, USDT_DECIMALS)),
    [data.minDeposit]
  );
  const amountBn = useMemo(() => {
    try { return parseUnits(amount || "0", USDT_DECIMALS); } catch { return 0n; }
  }, [amount]);
  const needApprove = amountBn > 0n && data.usdtAllowance < amountBn;
  const insufficient = amountBn > data.usdtBalance;
  const belowMin = amount !== "" && amountBn < data.minDeposit;

  const aprPct = Number(data.aprBps) / 100; // bps -> %
  const apyPct = aprPct > 0
    ? (Math.pow(1 + aprPct / 100 / 365, 365) - 1) * 100
    : 0;

  const isBound = data.inviter !== ZERO_ADDR;

  const principalFeePct = Number(data.principalFeeBps) / 100;
  const yieldFeePct = Number(data.yieldFeeBps) / 100;
  const commissionFeePct = Number(data.commissionFeeBps) / 100;

  // ---- close confirm dialog ----
  const [closeTarget, setCloseTarget] = useState<FlexiblePosition | null>(null);
  const [closePreview, setClosePreview] = useState<{
    principal: bigint; yieldAmt: bigint; principalFee: bigint; yieldFee: bigint; netPaid: bigint;
  } | null>(null);

  const openCloseDialog = async (p: FlexiblePosition) => {
    setCloseTarget(p);
    setClosePreview(null);
    const r = await previewClose(p.id);
    if (r) setClosePreview(r);
  };

  const confirmClose = async () => {
    if (!closeTarget) return;
    const closingId = closeTarget.id;
    const wasRegistered = rewarder.statusMap[closingId.toString()]?.registered;
    const ok = await closePosition(closingId);
    if (ok) {
      setCloseTarget(null);
      setClosePreview(null);
      if (wasRegistered) {
        // Wait briefly for refresh, then prompt to claim USDV
        setTimeout(async () => {
          await rewarder.fetchStatuses(
            data.positions.map((pp) => ({ id: pp.id, closed: pp.id === closingId ? true : pp.closed }))
          );
          // previewClaim is now valid since position is closed
          const amt = rewarder.statusMap[closingId.toString()]?.preview ?? 0n;
          setClaimUsdvPrompt({ id: closingId, amount: amt });
        }, 1200);
      }
    }
  };

  // ---- USDV reward: fetch statuses whenever positions change ----
  useEffect(() => {
    if (!account || !isBSC) return;
    rewarder.fetchStatuses(
      data.positions.map((p) => ({ id: p.id, closed: p.closed }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isBSC, data.positions.map((p) => `${p.id}-${p.closed}`).join(",")]);

  // ---- Auto-prompt to activate USDV on newly opened positions ----
  useEffect(() => {
    if (!account || !isBSC) return;
    const currentIds = new Set(data.positions.filter((p) => !p.closed).map((p) => p.id.toString()));
    const prev = prevPosIdsRef.current;
    if (prev.size > 0) {
      for (const id of currentIds) {
        if (!prev.has(id) && !promptedRef.current.has(id)) {
          const status = rewarder.statusMap[id];
          if (!status?.registered) {
            const pos = data.positions.find((p) => p.id.toString() === id);
            if (pos) {
              promptedRef.current.add(id);
              setActivatePrompt({ id: pos.id });
              break;
            }
          }
        }
      }
    }
    prevPosIdsRef.current = currentIds;
  }, [account, isBSC, data.positions, rewarder.statusMap]);

  // ---- downline by generation ----
  const [genRows, setGenRows] = useState<Array<{ gen: number; count: number; principal: bigint }>>([]);
  const [genLoading, setGenLoading] = useState(false);
  const effectiveMaxGen = Math.max(1, data.maxGeneration || 1);
  const reloadGens = async () => {
    if (!account || !isBSC) return;
    setGenLoading(true);
    try {
      const rows = await loadDownlineByGen(effectiveMaxGen);
      setGenRows(rows);
    } finally {
      setGenLoading(false);
    }
  };
  useEffect(() => {
    if (account && isBSC) reloadGens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isBSC, effectiveMaxGen]);

  return (
    <>
      <Helmet>
        <title>{isZh ? "活期理财 · USD.online" : "Flexible Pool · USD.online"}</title>
        <meta
          name="description"
          content={isZh
            ? "USD.online 活期理财池，连接 BNB 智能链，灵活存取，10 代返佣。"
            : "USD.online Flexible Pool on BNB Smart Chain — flexible deposit/withdraw, 10-generation commission."}
        />
      </Helmet>

      <Navbar />
      <div className="relative min-h-screen pt-16 pb-24 md:pb-12">
        {/* Background grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {isZh ? "活期理财池" : "Flexible Pool"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? "灵活存取 · 10 代返佣 · 部署于 BNB 智能链"
                : "Flexible deposit · 10-gen commission · BNB Smart Chain"}
            </p>
            {(data.paused || data.frozen) && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full border border-destructive/40 bg-destructive/10 text-destructive text-xs">
                <AlertTriangle className="w-3 h-3" />
                {data.paused
                  ? (isZh ? "合约已暂停存取" : "Contract paused")
                  : (isZh ? "合约已冻结" : "Contract frozen")}
              </div>
            )}
          </header>

          {/* Connect / wallet status */}
          {!account ? (
            <Card className="backdrop-blur-md bg-card/40 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Wallet className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  {isZh ? "请连接钱包以使用活期理财" : "Connect wallet to access Flexible Pool"}
                </p>
                <Button onClick={connect} className="bg-gradient-to-r from-primary to-accent">
                  {isZh ? "连接钱包" : "Connect Wallet"}
                </Button>
              </CardContent>
            </Card>
          ) : !isBSC ? (
            <Card className="backdrop-blur-md bg-card/40 border-destructive/50">
              <CardContent className="py-8 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-sm">
                  {isZh ? "请切换到 BNB 智能链 (BSC Mainnet)" : "Please switch to BNB Smart Chain"}
                </p>
                <Button onClick={connect} variant="outline">
                  {isZh ? "切换网络" : "Switch Network"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Wallet bar */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardContent className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{isZh ? "钱包地址" : "Wallet"}</span>
                    <button
                      onClick={() => copy(account, "wallet")}
                      className="font-mono text-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      {short(account)}
                      {copied === "wallet" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">USDT {isZh ? "余额" : "Balance"}</span>
                    <span className="font-semibold">{formatUSDT(data.usdtBalance)}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{isZh ? "已授权" : "Allowance"}</span>
                    <span className="font-semibold">{formatUSDT(data.usdtAllowance)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Core stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label={isZh ? "当前 APR" : "Current APR"}
                  value={`${aprPct.toFixed(2)}%`}
                  sub={`${isZh ? "复利 APY" : "Compound APY"} ≈ ${apyPct.toFixed(2)}%`}
                  accent
                />
                <StatCard
                  icon={<Coins className="w-4 h-4" />}
                  label={isZh ? "我的活期本金" : "My Principal"}
                  value={`${formatUSDT(data.myPrincipal)}`}
                  sub="USDT"
                />
                <StatCard
                  icon={<Users className="w-4 h-4" />}
                  label={isZh ? "等级本金" : "Level Principal"}
                  value={`${formatUSDT(data.levelPrincipal)}`}
                  sub={isZh ? "= 自己 + 直推" : "= self + directs"}
                />
                <StatCard
                  icon={<Award className="w-4 h-4" />}
                  label={isZh ? "我的等级" : "My Level"}
                  value={data.level > 0 ? `Lv${data.level}` : "—"}
                  sub={`${isZh ? "可拿" : "Up to"} ${data.maxGeneration} ${isZh ? "代返佣" : "gens"}`}
                />
              </div>

              {/* Inviter binding */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {isZh ? "邀请人绑定" : "Inviter Binding"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isBound ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{isZh ? "我的上级" : "My Inviter"}</p>
                        <button
                          onClick={() => copy(data.inviter, "inviter")}
                          className="font-mono text-sm hover:text-primary inline-flex items-center gap-1"
                        >
                          {short(data.inviter)}
                          {copied === "inviter" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        <Check className="w-3 h-3 mr-1" />
                        {isZh ? "已绑定（不可修改）" : "Bound (immutable)"}
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <Label className="text-xs">{isZh ? "上级钱包地址" : "Inviter Address"}</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="0x..."
                          value={inviterInput}
                          onChange={(e) => setInviterInput(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <Button
                          onClick={() => bind(inviterInput).then((ok) => ok && localStorage.removeItem("inviter"))}
                          disabled={!inviterInput || actionLoading.bind}
                        >
                          {actionLoading.bind ? (isZh ? "绑定中…" : "Binding…") : (isZh ? "绑定" : "Bind")}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        {isZh
                          ? "绑定为一次性操作，绑定后永久不可修改。"
                          : "Binding is one-time and immutable once set."}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Deposit */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isZh ? "活期存款" : "Deposit"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isBound && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {isZh
                          ? "建议先绑定上级，否则您的存款无法为您的上级带来佣金。"
                          : "Bind an inviter first, otherwise no commission will flow upline from your deposit."}
                      </span>
                    </div>
                  )}
                  <Label className="text-xs">{isZh ? "存款金额 (USDT)" : "Amount (USDT)"}</Label>
                  <Input
                    type="number"
                    placeholder={`${minDepositNum}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={minDepositNum}
                  />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{isZh ? "最低" : "Min"}: {minDepositNum} USDT</span>
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setAmount(formatUnits(data.usdtBalance, USDT_DECIMALS))}
                    >
                      {isZh ? "全部" : "Max"}: {formatUSDT(data.usdtBalance)}
                    </button>
                  </div>

                  {belowMin && (
                    <p className="text-xs text-destructive">
                      {isZh ? `最低存款 ${minDepositNum} USDT` : `Min deposit ${minDepositNum} USDT`}
                    </p>
                  )}
                  {insufficient && (
                    <p className="text-xs text-destructive">
                      {isZh ? "余额不足" : "Insufficient balance"}
                    </p>
                  )}

                  {needApprove ? (
                    <Button
                      onClick={() => approve(amount)}
                      disabled={actionLoading.approve || !amount || belowMin || insufficient || data.paused}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      {actionLoading.approve
                        ? (isZh ? "授权中…" : "Approving…")
                        : `${isZh ? "授权" : "Approve"} ${amount || 0} USDT`}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => deposit(amount)}
                      disabled={actionLoading.deposit || !amount || belowMin || insufficient || data.paused}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      {actionLoading.deposit
                        ? (isZh ? "存款中…" : "Depositing…")
                        : `${isZh ? "存款" : "Deposit"} ${amount || 0} USDT`}
                    </Button>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    {isZh
                      ? `平仓时平台扣除平仓金额 2% 的手续费`
                      : `On close: platform charges a 2% fee on the close amount`}
                  </p>
                </CardContent>
              </Card>

              {/* USDV Reward overview */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-primary/10 via-card/40 to-accent/10 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {isZh ? "USDV 奖励" : "USDV Rewards"}
                    <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px]">
                      ×{Number(rewarder.global.multiplier)} {isZh ? "利息" : "yield"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    <p className="text-[11px] text-muted-foreground mb-1">{isZh ? "我的 USDV 余额" : "My USDV Balance"}</p>
                    <p className="text-xl font-bold text-primary tabular-nums">{formatUSDV(rewarder.global.usdvBalance)}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    <p className="text-[11px] text-muted-foreground mb-1">{isZh ? "全网累计铸造" : "Total Minted"}</p>
                    <p className="text-xl font-bold tabular-nums">{formatUSDV(rewarder.global.totalMinted, 0)}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    <p className="text-[11px] text-muted-foreground mb-1">{isZh ? "奖励倍数" : "Multiplier"}</p>
                    <p className="text-xl font-bold tabular-nums">×{Number(rewarder.global.multiplier)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{isZh ? "活期利息 → USDV 空投" : "yield → USDV airdrop"}</p>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    {isZh
                      ? "存款后请激活 USDV 奖励，平仓前必须激活，否则该仓位将无法领取 USDV。"
                      : "Activate USDV reward after deposit. Activation must happen before closing the position."}
                  </p>
                </CardContent>
              </Card>

              {/* Positions */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isZh ? "我的仓位" : "My Positions"}
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={refresh}>
                    {isZh ? "刷新" : "Refresh"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.positions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {isZh ? "暂无仓位" : "No positions yet"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.positions.map((p) => (
                        <PositionCard
                          key={p.id.toString()}
                          p={p}
                          isZh={isZh}
                          loading={!!actionLoading[`close-${p.id}`]}
                          paused={data.paused}
                          onClose={() => openCloseDialog(p)}
                          usdvStatus={rewarder.statusMap[p.id.toString()]}
                          usdvMultiplier={Number(rewarder.global.multiplier)}
                          onRegister={() => rewarder.register(p.id)}
                          onClaimUsdv={() => rewarder.claim(p.id)}
                          registerBusy={!!rewarder.actionLoading[`register-${p.id}`]}
                          claimBusy={!!rewarder.actionLoading[`claim-usdv-${p.id}`]}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My on-chain history */}
              <TransactionHistory
                title={isZh ? "我的历史记录" : "My History"}
                account={account}
                decimals={USDT_DECIMALS}
                isZh={isZh}
                contracts={[
                  {
                    contract: poolRead,
                    events: [
                      {
                        name: "PositionOpened",
                        label: isZh ? "活期存入" : "Deposit",
                        badgeClass: "bg-primary/15 text-primary border-primary/30 text-[11px]",
                        parse: (a) => ({
                          amount: a[2] as bigint,
                          sub: isZh ? `仓位 #${(a[1] as bigint).toString()}` : `Pos #${(a[1] as bigint).toString()}`,
                        }),
                      },
                      {
                        name: "PositionClosed",
                        label: isZh ? "活期平仓" : "Close",
                        badgeClass: "bg-secondary text-secondary-foreground border-border text-[11px]",
                        parse: (a) => {
                          const principal = a[2] as bigint;
                          const yieldAmt = a[3] as bigint;
                          const netPaid = a[6] as bigint;
                          return {
                            amount: netPaid,
                            sub: isZh
                              ? `本金 ${formatUSDT(principal)} · 利息 ${formatUSDT(yieldAmt, 6)}`
                              : `Principal ${formatUSDT(principal)} · Yield ${formatUSDT(yieldAmt, 6)}`,
                          };
                        },
                      },
                      {
                        name: "CommissionClaimed",
                        label: isZh ? "领取佣金" : "Claim Commission",
                        badgeClass: "bg-accent/20 text-accent border-accent/30 text-[11px]",
                        parse: (a) => ({
                          amount: a[3] as bigint,
                          sub: isZh
                            ? `毛 ${formatUSDT(a[1] as bigint)} · 费 ${formatUSDT(a[2] as bigint)}`
                            : `Gross ${formatUSDT(a[1] as bigint)} · Fee ${formatUSDT(a[2] as bigint)}`,
                        }),
                      },
                    ],
                  },
                ]}
              />

              {/* Team by generation */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {isZh
                      ? `团队层级数据 (Lv${data.level || 0} · 可统计 ${effectiveMaxGen} 代)`
                      : `Team by Generation (Lv${data.level || 0} · ${effectiveMaxGen} gens)`}
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={reloadGens} disabled={genLoading}>
                    {genLoading ? (isZh ? "加载中…" : "Loading…") : (isZh ? "刷新" : "Refresh")}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {genLoading && genRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isZh ? "正在聚合链上数据…" : "Aggregating on-chain data…"}
                    </p>
                  ) : genRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isZh ? "暂无下级" : "No downline yet"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {genRows.map((r) => (
                        <div
                          key={r.gen}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
                        >
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[11px]">
                            {isZh ? `第 ${r.gen} 代` : `Gen ${r.gen}`}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground text-xs">
                              {isZh ? "人数" : "Users"}{" "}
                              <span className="font-semibold text-foreground tabular-nums">{r.count}</span>
                            </span>
                            <span className="font-semibold tabular-nums text-primary">
                              {formatUSDT(r.principal)} USDT
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {isZh
                      ? "* 链上实时聚合，最多统计 800 个地址；等级提升后将展示更多代。"
                      : "* On-chain aggregation, capped at 800 addresses. Higher level reveals more generations."}
                  </p>
                </CardContent>
              </Card>

              {/* Commission claim */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    {isZh ? "可领取佣金" : "Claimable Commission"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {formatUSDT(data.claimableCommission)} <span className="text-base text-muted-foreground">USDT</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isZh
                        ? `领取手续费 ${commissionFeePct}%（基于利息计算，不扣本金）`
                        : `${commissionFeePct}% claim fee (paid on interest, principal untouched)`}
                    </p>
                  </div>
                  <Button
                    onClick={claimCommission}
                    disabled={data.claimableCommission === 0n || actionLoading.claim || data.paused}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    {actionLoading.claim ? (isZh ? "领取中…" : "Claiming…") : (isZh ? "领取佣金" : "Claim Commission")}
                  </Button>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card className="backdrop-blur-md bg-card/40 border-border/50">
                <CardContent className="p-2">
                  <Accordion type="single" collapsible defaultValue="rules">
                    <AccordionItem value="rules" className="border-0">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <span className="text-base font-semibold flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {isZh ? "等级与返佣规则" : "Level & Commission Rules"}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 sm:px-4 space-y-3 sm:space-y-4">
                        <div>
                          <p className="text-xs sm:text-sm font-medium mb-2">{isZh ? "等级门槛（等级本金 = 自己 + 直推）" : "Level Thresholds (Self + Direct)"}</p>
                          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                            {LEVEL_RULES.map((r) => (
                              <div key={r.lvl} className="rounded-md sm:rounded-lg border border-border/50 bg-muted/20 p-1.5 sm:p-3 text-center">
                                <Badge className="bg-primary/15 text-primary border-primary/30 mb-0.5 sm:mb-1 text-[9px] sm:text-xs px-1 sm:px-2 py-0">Lv{r.lvl}</Badge>
                                <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight">≥{r.min >= 1000 ? `${r.min / 1000}k` : r.min}</p>
                                <p className="text-[10px] sm:text-sm font-semibold mt-0.5 sm:mt-1">{isZh ? `${r.gens}代` : `${r.gens}g`}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-xs sm:text-sm font-medium mb-2">{isZh ? "10 代返佣比例（基于利息）" : "10-Gen Commission (on interest)"}</p>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
                            {COMMISSION_RATES.map((rate, i) => (
                              <div key={i} className="rounded border border-border/50 bg-muted/20 p-1 sm:p-2 text-center">
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">{isZh ? `${i + 1}代` : `G${i + 1}`}</p>
                                <p className="text-xs sm:text-sm font-bold text-primary">{rate}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isZh
                            ? "返佣全部基于您下级用户产生的利息，不会从其本金中扣除。等级与可拿代数实时随您的等级本金变化。"
                            : "Commission is calculated on interest generated by your downline, not deducted from their principal. Level updates in real time."}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

            </>
          )}
        </div>
      </div>

      {/* Close confirm dialog */}
      <Dialog open={!!closeTarget} onOpenChange={(o) => { if (!o) { setCloseTarget(null); setClosePreview(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "确认平仓" : "Confirm Close"}</DialogTitle>
            <DialogDescription>
              {isZh
                ? "请确认下方明细。平仓将一次性结算本金与利息，并扣除合约规定的手续费。"
                : "Review the breakdown. Closing settles principal and yield, with protocol fees deducted."}
            </DialogDescription>
          </DialogHeader>
          {!closePreview ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{isZh ? "加载中…" : "Loading…"}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label={isZh ? "本金" : "Principal"} value={`${formatUSDT(closePreview.principal)} USDT`} />
              <Row label={isZh ? "利息" : "Yield"} value={`${formatUSDT(closePreview.yieldAmt)} USDT`} accent />
              <Row label={isZh ? "本金手续费" : "Principal Fee"} value={`- ${formatUSDT(closePreview.principalFee)} USDT`} muted />
              <Row label={isZh ? "利息手续费" : "Yield Fee"} value={`- ${formatUSDT(closePreview.yieldFee)} USDT`} muted />
              <Separator />
              <Row label={isZh ? "实际到账" : "Net Paid"} value={`${formatUSDT(closePreview.netPaid)} USDT`} bold />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCloseTarget(null); setClosePreview(null); }}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button
              onClick={confirmClose}
              disabled={!closePreview || !!(closeTarget && actionLoading[`close-${closeTarget.id}`])}
            >
              {closeTarget && actionLoading[`close-${closeTarget.id}`]
                ? (isZh ? "平仓中…" : "Closing…")
                : (isZh ? "确认平仓" : "Confirm Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate USDV prompt (after deposit) */}
      <Dialog open={!!activatePrompt} onOpenChange={(o) => { if (!o) setActivatePrompt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isZh ? "激活 USDV 奖励" : "Activate USDV Reward"}
            </DialogTitle>
            <DialogDescription>
              {isZh
                ? `存款成功！激活后您将额外获得 ${Number(rewarder.global.multiplier)} 倍利息的 USDV 空投。⚠️ 必须在平仓前激活，否则 USDV 奖励将作废。`
                : `Deposit successful! Activate to earn ${Number(rewarder.global.multiplier)}× your yield as USDV airdrop. Must be done before closing or the reward is forfeit.`}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm rounded-lg border border-border/50 bg-muted/20 p-3">
            {isZh ? "仓位 ID" : "Position ID"}: <span className="font-mono font-semibold">#{activatePrompt?.id.toString()}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivatePrompt(null)}>
              {isZh ? "稍后激活" : "Later"}
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-accent"
              disabled={activatePrompt ? !!rewarder.actionLoading[`register-${activatePrompt.id}`] : false}
              onClick={async () => {
                if (!activatePrompt) return;
                const ok = await rewarder.register(activatePrompt.id);
                if (ok) {
                  setActivatePrompt(null);
                  await rewarder.fetchStatuses(data.positions.map((p) => ({ id: p.id, closed: p.closed })));
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {activatePrompt && rewarder.actionLoading[`register-${activatePrompt.id}`]
                ? (isZh ? "激活中…" : "Activating…")
                : (isZh ? "立即激活" : "Activate now")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim USDV prompt (after close) */}
      <Dialog open={!!claimUsdvPrompt} onOpenChange={(o) => { if (!o) setClaimUsdvPrompt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {isZh ? "领取 USDV 奖励" : "Claim USDV Reward"}
            </DialogTitle>
            <DialogDescription>
              {isZh
                ? "🎉 平仓成功！您可以领取本仓位对应的 USDV 奖励。"
                : "🎉 Position closed! You can now claim the USDV reward for this position."}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-primary">
              {formatUSDV(claimUsdvPrompt?.amount ?? 0n)} <span className="text-base text-muted-foreground">USDV</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimUsdvPrompt(null)}>
              {isZh ? "稍后领取" : "Later"}
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-accent"
              disabled={claimUsdvPrompt ? !!rewarder.actionLoading[`claim-usdv-${claimUsdvPrompt.id}`] : false}
              onClick={async () => {
                if (!claimUsdvPrompt) return;
                const ok = await rewarder.claim(claimUsdvPrompt.id);
                if (ok) {
                  setClaimUsdvPrompt(null);
                  await rewarder.fetchStatuses(data.positions.map((p) => ({ id: p.id, closed: p.closed })));
                }
              }}
            >
              {claimUsdvPrompt && rewarder.actionLoading[`claim-usdv-${claimUsdvPrompt.id}`]
                ? (isZh ? "领取中…" : "Claiming…")
                : (isZh ? "立即领取" : "Claim now")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card className={`backdrop-blur-md bg-card/40 border-border/50 ${accent ? "border-primary/40" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          {icon}
          {label}
        </div>
        <p className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function PositionCard({
  p, isZh, loading, paused, onClose,
  usdvStatus, usdvMultiplier, onRegister, onClaimUsdv, registerBusy, claimBusy,
}: {
  p: FlexiblePosition; isZh: boolean; loading: boolean; paused: boolean; onClose: () => void;
  usdvStatus?: UsdvPositionStatus;
  usdvMultiplier: number;
  onRegister: () => void;
  onClaimUsdv: () => void;
  registerBusy: boolean;
  claimBusy: boolean;
}) {
  const date = p.startTime
    ? new Date(p.startTime * 1000).toLocaleString(isZh ? "zh-CN" : "en-US", { hour12: false })
    : "—";
  const registered = !!usdvStatus?.registered;
  const claimed = !!usdvStatus?.claimed;
  const previewAmt = usdvStatus?.preview ?? 0n;
  return (
    <div className={`rounded-xl border p-4 ${p.closed ? "opacity-80 border-border/30 bg-muted/10" : "border-border/50 bg-card/30"}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="font-mono text-[11px]">#{p.id.toString()}</Badge>
        {p.closed ? (
          <Badge variant="secondary" className="text-[10px]">{isZh ? "已平仓" : "Closed"}</Badge>
        ) : (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{isZh ? "进行中" : "Active"}</Badge>
        )}
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">{isZh ? "本金" : "Principal"}</span>
          <span className="font-semibold">{formatUSDT(p.principal)} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">{isZh ? "待领利息" : "Pending Yield"}</span>
          <span className="font-semibold text-primary">{formatUSDT(p.pendingYield, 6)} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">{isZh ? "开始时间" : "Started"}</span>
          <span className="text-xs">{date}</span>
        </div>
      </div>

      {/* USDV reward row */}
      <div className="mt-3 pt-3 border-t border-border/40">
        {!p.closed && !registered && (
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-[10px]">
              ⚠️ {isZh ? "USDV 未激活" : "USDV not activated"}
            </Badge>
            <Button size="sm" variant="default" className="h-7 px-3 text-[11px] bg-gradient-to-r from-primary to-accent"
              onClick={onRegister} disabled={registerBusy}>
              <Sparkles className="w-3 h-3 mr-1" />
              {registerBusy ? (isZh ? "激活中…" : "Activating…") : (isZh ? "激活 USDV" : "Activate")}
            </Button>
          </div>
        )}
        {!p.closed && registered && (
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 text-[10px]">
              🟢 {isZh ? `USDV 已激活 (×${usdvMultiplier})` : `USDV active (×${usdvMultiplier})`}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              ≈ {formatUSDV(previewAmt)} USDV
            </span>
          </div>
        )}
        {p.closed && registered && !claimed && (
          <Button size="sm" className="w-full h-8 text-[12px] bg-gradient-to-r from-primary to-accent"
            onClick={onClaimUsdv} disabled={claimBusy}>
            🎁 {claimBusy ? (isZh ? "领取中…" : "Claiming…") : (isZh ? `领取 ${formatUSDV(previewAmt)} USDV` : `Claim ${formatUSDV(previewAmt)} USDV`)}
          </Button>
        )}
        {p.closed && claimed && (
          <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 text-[10px]">
            ✅ {isZh ? "USDV 已领取" : "USDV claimed"}
          </Badge>
        )}
        {p.closed && !registered && (
          <span className="text-[11px] text-muted-foreground">
            ❌ {isZh ? "未激活，无 USDV 奖励" : "Not activated — no USDV reward"}
          </span>
        )}
      </div>

      {!p.closed && (
        <Button
          size="sm" variant="outline" className="w-full mt-3"
          onClick={onClose} disabled={loading || paused}
        >
          {loading ? (isZh ? "平仓中…" : "Closing…") : (isZh ? "平仓" : "Close Position")}
        </Button>
      )}
    </div>
  );
}

function Row({ label, value, accent, muted, bold }: { label: string; value: string; accent?: boolean; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold text-base" : ""} ${accent ? "text-primary" : ""} ${muted ? "text-muted-foreground" : ""}`}>
        {value}
      </span>
    </div>
  );
}
