import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUnits } from "ethers";
import { Gift, Clock, RefreshCw, ExternalLink, Coins } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { CLAIM_COOLDOWN_SEC } from "@/config/legendary";
import {
  fetchClaimHistory,
  readClaimCache,
  writeClaimCache,
  type ClaimRecord,
} from "@/lib/legendaryClaimHistory";

export function RewardsTab() {
  const { account, connect } = useWeb3();
  const { data, refetch } = useLegendaryDashboard();
  const { claimRewards, claimTokenRewards, busy } = useLegendaryActions(refetch);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [claims, setClaims] = useState<ClaimRecord[] | null>(null);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Load claim history cache when account changes
  useEffect(() => {
    if (!account) {
      setClaims(null);
      return;
    }
    const cached = readClaimCache(account);
    setClaims(cached);
    setClaimsError(null);
  }, [account]);

  const loadClaims = async () => {
    if (!account) return;
    setLoadingClaims(true);
    setClaimsError(null);
    try {
      const records = await fetchClaimHistory(account);
      setClaims(records);
      writeClaimCache(account, records);
    } catch (e: any) {
      setClaimsError(e?.message || "加载失败");
    } finally {
      setLoadingClaims(false);
    }
  };

  if (!account) {
    return (
      <Card className="p-8 bg-foreground/5 backdrop-blur-xl border-foreground/15 text-center">
        <p className="text-muted-foreground mb-4">连接钱包查看你的奖励</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  const nextAt = Number(data.lastClaimAt) + CLAIM_COOLDOWN_SEC;
  const remain = nextAt - now;
  const canClaim = remain <= 0 && data.referralClaimable > 0n;
  const cd =
    remain <= 0
      ? "可立即领取"
      : `${Math.floor(remain / 3600)}h ${Math.floor((remain % 3600) / 60)}m ${remain % 60}s`;

  const totalClaimed = (claims ?? []).reduce((s, r) => s + r.amount, 0n);

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-500/15 via-yellow-600/8 to-transparent backdrop-blur-xl border-amber-400/30 animate-fade-in">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-yellow-600/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-2">
            <span className="inline-flex w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 items-center justify-center">
              <Gift className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium tracking-wide">领取奖励</span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            {fmt(data.referralClaimable)} <span className="text-2xl text-amber-700/90 dark:text-amber-300/80">USDT</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            距下次可领：<span className="text-foreground font-semibold">{cd}</span>
          </div>
          <Button
            disabled={!canClaim || busy !== null}
            onClick={async () => {
              await claimRewards();
              // sync history after claim
              loadClaims();
            }}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 h-12 px-8 font-semibold shadow-[0_8px_30px_-8px_rgba(251,191,36,0.6)] transition-all hover:scale-[1.02]"
          >
            一键领取奖励
          </Button>
        </div>
      </Card>

      {/* USDV / FDAO 代币奖励 */}
      {(() => {
        const usdvTotal = data.previewUsdvInterest + data.previewUsdvLevel;
        const fdaoTotal = data.previewFdaoInterest + data.previewFdaoLevel;
        const canClaimTokens = usdvTotal > 0n || fdaoTotal > 0n;
        return (
          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-500/15 via-fuchsia-600/8 to-transparent backdrop-blur-xl border-violet-400/30 animate-fade-in">
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 mb-4">
                <span className="inline-flex w-8 h-8 rounded-xl bg-violet-400/20 border border-violet-400/40 items-center justify-center">
                  <Coins className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium tracking-wide">代币奖励 USDV / FDAO</span>
                <Badge variant="outline" className="ml-auto border-violet-400/40 text-violet-700 dark:text-violet-300">
                  当前 V{data.level}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* USDV */}
                <div className="rounded-xl p-4 bg-foreground/5 border border-foreground/10">
                  <div className="text-xs text-muted-foreground mb-1">待领 USDV</div>
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    {fmt(usdvTotal, 2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                    <div>利息累计：<span className="text-foreground font-medium">{fmt(data.previewUsdvInterest, 2)}</span></div>
                    <div>等级一次性：<span className="text-foreground font-medium">{fmt(data.previewUsdvLevel, 2)}</span></div>
                    <div className="opacity-70">钱包余额：{fmt(data.usdvBalance, 2)}</div>
                  </div>
                </div>
                {/* FDAO */}
                <div className="rounded-xl p-4 bg-foreground/5 border border-foreground/10">
                  <div className="text-xs text-muted-foreground mb-1">待领 FDAO</div>
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                    {fmt(fdaoTotal, 2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                    <div>利息累计：<span className="text-foreground font-medium">{fmt(data.previewFdaoInterest, 2)}</span></div>
                    <div>等级一次性：<span className="text-foreground font-medium">{fmt(data.previewFdaoLevel, 2)}</span></div>
                    <div className="opacity-70">钱包余额：{fmt(data.fdaoBalance, 2)}</div>
                  </div>
                </div>
              </div>

              <Button
                disabled={!canClaimTokens || busy !== null}
                onClick={() => claimTokenRewards()}
                className="w-full md:w-auto bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 h-12 px-8 font-semibold shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] transition-all hover:scale-[1.02]"
              >
                领取 USDV / FDAO
              </Button>

            </div>
          </Card>
        );
      })()}


      {/* 历史领取记录 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div>
            <h3 className="font-bold">历史领取记录</h3>
            {claims && claims.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                累计领取：<span className="text-foreground font-semibold">{Number(formatUnits(totalClaimed, 18)).toFixed(4)} USDT</span>
                <span className="ml-2">· 共 {claims.length} 条</span>
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={loadingClaims}
            onClick={loadClaims}
            className="border-foreground/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingClaims ? "animate-spin" : ""}`} />
            {claims === null ? "加载领取记录" : "刷新记录"}
          </Button>
        </div>

        {claimsError && (
          <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded p-2 mb-3">
            {claimsError}
          </div>
        )}


        {claims === null ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            点击「加载领取记录」查询链上历史
          </div>
        ) : claims.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">暂无领取记录</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {claims.map((r) => (
              <div
                key={r.hash}
                className="flex items-center gap-3 p-2 rounded bg-foreground/5 text-xs"
              >
                <Badge variant="outline" className="border-emerald-400/40 text-emerald-600 dark:text-emerald-400">
                  领取
                </Badge>
                <span className="text-muted-foreground">
                  {r.ts ? new Date(r.ts * 1000).toLocaleString() : `#${r.block}`}
                </span>
                <a
                  href={`https://bscscan.com/tx/${r.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  {r.hash.slice(0, 8)}...{r.hash.slice(-6)}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="ml-auto font-semibold text-emerald-600 dark:text-emerald-400">
                  +{Number(formatUnits(r.amount, 18)).toFixed(4)} USDT
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
