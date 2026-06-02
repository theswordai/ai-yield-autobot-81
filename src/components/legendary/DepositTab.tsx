import { useEffect, useMemo, useState } from "react";
import { isAddress, parseUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, Check, Copy, Info, Lock, RefreshCw, TrendingUp, Users, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useLegendaryDashboard, fmt, fmtAllowance } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { calcPool1AprBps, aprBpsToApyPct } from "@/config/legendary";
import { useWeb3 } from "@/hooks/useWeb3";
import { useInviterReadback } from "@/hooks/useInviterReadback";

const ZERO = "0x0000000000000000000000000000000000000000";
const short = (a: string) => (a && a !== ZERO ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

export function DepositTab({ onDone }: { onDone: () => void }) {
  const { account, connect } = useWeb3();
  const { data, refetch, rpcDegraded } = useLegendaryDashboard();
  const { deposit, approve, bind, busy } = useLegendaryActions(() => {
    refetch();
  });

  const [amount, setAmount] = useState("");
  const [inviterInput, setInviterInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefreshBalance = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
      toast.success("余额已刷新");
    } finally {
      setRefreshing(false);
    }
  };

  // 预填邀请人（URL ?ref= / ?inviter= 或 localStorage）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || params.get("inviter");
    const stored = localStorage.getItem("inviter") || "";
    const candidate = ref || stored;
    if (candidate && isAddress(candidate)) setInviterInput(candidate);
  }, []);

  const amountWei = useMemo(() => {
    try {
      return parseUnits(amount || "0", 18);
    } catch {
      return 0n;
    }
  }, [amount]);

  const aprBps = calcPool1AprBps(amountWei);
  const apy = aprBpsToApyPct(aprBps);
  const needApprove = amountWei > 0n && data.allowance < amountWei;
  const tooLow = amountWei > 0n && amountWei < 200n * 10n ** 18n;
  const overBalance = amountWei > data.usdtBalance;
  const notBound = !data.inviter || data.inviter.toLowerCase() === ZERO;
  const baseInvalid =
    !account || data.paused || data.frozen || amountWei <= 0n || tooLow || overBalance;
  const approveDisabled = baseInvalid || busy !== null || !needApprove;
  // 不再因「未绑定上级」而禁用存款
  const depositDisabled = baseInvalid || busy !== null || needApprove;

  const myLink = useMemo(() => {
    if (!account) return "";
    return `${window.location.origin}/?ref=${account}`;
  }, [account]);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      toast.success("已复制邀请链接");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("复制失败");
    }
  };

  if (!account) {
    return (
      <Card className="backdrop-blur-md bg-card/40 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Wallet className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">请先连接钱包再进行存款</p>
          <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
            连接钱包
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 钱包状态条 */}
      <Card className="backdrop-blur-md bg-card/40 border-border/50">
        <CardContent className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-muted-foreground">钱包地址</span>
            <span className="font-mono text-foreground">{short(account)}</span>
          </div>
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-muted-foreground">USDT 余额</span>
            <span className="font-semibold">{fmt(data.usdtBalance)}</span>
          </div>
          <div className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-muted-foreground">已授权</span>
            <span className="font-semibold">{fmtAllowance(data.allowance)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat
          icon={<TrendingUp className="w-4 h-4" />}
          label="该笔 APR"
          value={`${(aprBps / 100).toFixed(2)}%`}
          sub={`复利 APY ≈ ${apy.toFixed(0)}%`}
          accent
        />
        <MiniStat
          icon={<Lock className="w-4 h-4" />}
          label="锁仓周期"
          value="365 天"
          sub="到期后可取本"
        />
        <MiniStat
          icon={<Wallet className="w-4 h-4" />}
          label="最低门槛"
          value="200 USDT"
          sub="每 5,000 +3% APR"
        />
        <MiniStat
          icon={<Users className="w-4 h-4" />}
          label="我的自投"
          value={fmt(data.selfStake, 0)}
          sub="USDT"
        />
      </div>

      {/* 我的上线 / 邀请人绑定 */}
      <Card className="backdrop-blur-md bg-card/40 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            我的上线
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rpcDegraded ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>网络异常，无法校验是否已绑定上级，请点击顶部「重新读取」后再试。</span>
            </div>
          ) : !notBound ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">已绑定上线</p>
                <span className="font-mono text-sm">{short(data.inviter)}</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                <Check className="w-3 h-3 mr-1" />
                已绑定（不可修改）
              </Badge>
            </div>
          ) : (
            <>
              <Label className="text-xs">上线钱包地址（选填）</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={inviterInput}
                  onChange={(e) => setInviterInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={async () => {
                    const ok = await bind(inviterInput.trim());
                    if (ok) localStorage.removeItem("inviter");
                  }}
                  disabled={!inviterInput || busy !== null}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600"
                >
                  {busy === "bind" ? "绑定中…" : "绑定"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                绑定为一次性操作，绑定后永久不可修改。上线需自投 ≥ 200 USDT 才能为你贡献奖励。
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 存款表单 */}
      <Card className="backdrop-blur-md bg-card/40 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />
            CLASS-A（锁仓 365 天）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notBound && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <b>温馨提醒：</b>您当前未绑定上线，仍可直接存款。
                绑定上线后，您的上线方可从您的存款中获得团队奖励；如有专属邀请人，建议先在上方完成绑定。
              </span>
            </div>
          )}

          <div>
            <Label className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
              <span>存入金额 (USDT)</span>
              <span className="inline-flex items-center gap-1.5">
                <span>钱包余额：{fmt(data.usdtBalance)}</span>
                <button
                  type="button"
                  onClick={onRefreshBalance}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-muted/50 transition-colors disabled:opacity-50"
                  title="刷新余额"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="200"
                step="1"
                placeholder="≥ 200"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(fmt(data.usdtBalance, 0).replace(/,/g, ""))}
                className="border-white/20"
              >
                最大
              </Button>
            </div>
          </div>


          {tooLow && <p className="text-xs text-destructive">最低存款 200 USDT</p>}
          {overBalance && !tooLow && <p className="text-xs text-destructive">余额不足</p>}
          {data.paused && (
            <p className="text-xs text-destructive">合约已暂停，暂时无法存款</p>
          )}
          {data.frozen && (
            <p className="text-xs text-destructive">账户已冻结，请联系客服</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              disabled={approveDisabled}
              onClick={async () => {
                await approve();
                await refetch();
              }}
              variant="outline"
              className="h-12 text-base font-semibold border-amber-400/40 text-amber-700 dark:text-amber-300 hover:bg-amber-400/10"
            >
              {busy === "approve"
                ? "授权中..."
                : !needApprove && amountWei > 0n
                ? "✓ 已授权"
                : "1. 授权 USDT"}
            </Button>
            <Button
              disabled={depositDisabled}
              onClick={async () => {
                const ok = await deposit(amount, data.allowance);
                if (ok) onDone();
              }}
              className="h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-yellow-600"
            >
              {busy === "deposit" ? "存款中..." : "2. 立即存款"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            已授权额度：{fmtAllowance(data.allowance)} USDT
            {needApprove && amountWei > 0n && (
              <span className="text-amber-600 dark:text-amber-400"> · 需先授权再存款</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* 我的邀请链接 */}
      <Card className="backdrop-blur-md bg-card/40 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="w-4 h-4" />
            我的邀请链接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={myLink} readOnly className="font-mono text-xs" />
            <Button variant="outline" onClick={onCopyLink} className="border-white/20">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <Card className={`backdrop-blur-md bg-card/40 border-border/50 ${accent ? "ring-1 ring-amber-400/40" : ""}`}>
      <CardContent className="p-3 sm:p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className={`text-base sm:text-xl font-bold ${accent ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
          {value}
        </div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
