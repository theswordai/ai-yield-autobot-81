import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUnits } from "ethers";
import { Gift, Clock, History } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useLegendaryContracts, useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { CLAIM_COOLDOWN_SEC } from "@/config/legendary";

type Evt = {
  hash: string;
  block: number;
  type: string;
  from?: string;
  amount: bigint;
};

export function RewardsTab() {
  const { account, connect } = useWeb3();
  const { read } = useLegendaryContracts();
  const { data, refetch } = useLegendaryDashboard();
  const { claimRewards, busy } = useLegendaryActions(refetch);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [events, setEvents] = useState<Evt[]>([]);
  const [claimHistory, setClaimHistory] = useState<{ hash: string; block: number; amount: bigint; ts?: number }[]>([]);
  const [claimTotal, setClaimTotal] = useState<bigint>(0n);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      if (!read || !account) return;
      try {
        const provider = (read.staking as any).runner?.provider;
        if (!provider) return;
        const latest = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latest - 5000);
        const [refLogs, dynLogs, clmLogs] = await Promise.all([
          read.staking
            .queryFilter(read.staking.filters.ReferralAccrued(null, account), fromBlock, latest)
            .catch(() => []),
          read.staking
            .queryFilter(read.staking.filters.DynamicAccrued(null, account), fromBlock, latest)
            .catch(() => []),
          read.staking
            .queryFilter(read.staking.filters.RewardsClaimed(account), fromBlock, latest)
            .catch(() => []),
        ]);
        const evs: Evt[] = [];
        for (const l of refLogs as any[]) {
          const lvl = Number(l.args?.level ?? 0);
          evs.push({
            hash: l.transactionHash,
            block: l.blockNumber,
            type: lvl === 1 ? "直推" : "间推",
            from: l.args?.from,
            amount: l.args?.amount ?? 0n,
          });
        }
        for (const l of dynLogs as any[]) {
          evs.push({
            hash: l.transactionHash,
            block: l.blockNumber,
            type: `动态 V${Number(l.args?.vLevel ?? 0)}`,
            from: l.args?.from,
            amount: l.args?.amount ?? 0n,
          });
        }
        for (const l of clmLogs as any[]) {
          evs.push({
            hash: l.transactionHash,
            block: l.blockNumber,
            type: "已领取",
            amount: l.args?.amount ?? 0n,
          });
        }
        evs.sort((a, b) => b.block - a.block);
        setEvents(evs.slice(0, 30));
      } catch {
        setEvents([]);
      }
    })();
  }, [read, account, data.referralClaimable]);

  // 历史领取记录：分块扫描更长区间（约 ~30 天 @ 3s 出块 ≈ 864k；这里扫描 30 万区块）
  useEffect(() => {
    (async () => {
      if (!read || !account) return;
      setHistoryLoading(true);
      try {
        const provider = (read.staking as any).runner?.provider;
        if (!provider) {
          setHistoryLoading(false);
          return;
        }
        const latest: number = await provider.getBlockNumber();
        const TOTAL = 300_000;
        const CHUNK = 4_900; // 多数 BSC RPC 限制 5000
        const earliest = Math.max(0, latest - TOTAL);
        const all: { hash: string; block: number; amount: bigint }[] = [];
        for (let to = latest; to >= earliest; to -= CHUNK + 1) {
          const from = Math.max(earliest, to - CHUNK);
          try {
            const logs = await read.staking.queryFilter(
              read.staking.filters.RewardsClaimed(account),
              from,
              to
            );
            for (const l of logs as any[]) {
              all.push({
                hash: l.transactionHash,
                block: l.blockNumber,
                amount: l.args?.amount ?? 0n,
              });
            }
          } catch {
            // ignore chunk errors
          }
          if (from === earliest) break;
        }
        all.sort((a, b) => b.block - a.block);
        // 取最近 30 条 fetch 区块时间戳
        const top = all.slice(0, 30);
        await Promise.all(
          top.map(async (e) => {
            try {
              const b = await provider.getBlock(e.block);
              (e as any).ts = Number(b?.timestamp ?? 0);
            } catch {}
          })
        );
        setClaimHistory(top);
        setClaimTotal(all.reduce((s, e) => s + e.amount, 0n));
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [read, account, data.lastClaimAt]);

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
            <span className="text-sm font-medium tracking-wide">待领取奖励</span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            {fmt(data.referralClaimable)} <span className="text-2xl text-amber-700/90 dark:text-amber-700 dark:text-amber-300/80">USDT</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            距下次可领：<span className="text-foreground font-semibold">{cd}</span>
          </div>
          <Button
            disabled={!canClaim || busy !== null}
            onClick={() => claimRewards()}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 h-12 px-8 font-semibold shadow-[0_8px_30px_-8px_rgba(251,191,36,0.6)] transition-all hover:scale-[1.02]"
          >
            一键领取奖励
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <h3 className="font-bold mb-3">最近事件（最近 5000 区块）</h3>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">暂无记录</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((e, i) => (
              <div
                key={`${e.hash}-${i}`}
                className="flex items-center gap-3 p-2 rounded bg-foreground/5 text-xs"
              >
                <Badge
                  variant="outline"
                  className={
                    e.type === "已领取"
                      ? "border-emerald-400/40 text-emerald-600 dark:text-emerald-400"
                      : e.type.startsWith("动态")
                      ? "border-purple-400/40 text-purple-600 dark:text-purple-400"
                      : "border-amber-400/40 text-amber-600 dark:text-amber-400"
                  }
                >
                  {e.type}
                </Badge>
                {e.from && (
                  <span className="font-mono text-muted-foreground">
                    来自 {e.from.slice(0, 6)}...{e.from.slice(-4)}
                  </span>
                )}
                <span className="ml-auto font-semibold">
                  +{Number(formatUnits(e.amount, 18)).toFixed(4)} USDT
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 历史领取记录 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            历史领取记录
          </h3>
          <div className="text-xs text-muted-foreground">
            累计：
            <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">
              {Number(formatUnits(claimTotal, 18)).toFixed(4)} USDT
            </span>
          </div>
        </div>
        {historyLoading && claimHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">加载中…</div>
        ) : claimHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">暂无领取记录</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {claimHistory.map((e, i) => (
              <div
                key={`${e.hash}-${i}`}
                className="flex items-center gap-3 p-2 rounded bg-foreground/5 text-xs"
              >
                <Badge
                  variant="outline"
                  className="border-emerald-400/40 text-emerald-600 dark:text-emerald-400"
                >
                  领取
                </Badge>
                <span className="text-muted-foreground">
                  {e.ts
                    ? new Date(e.ts * 1000).toLocaleString()
                    : `区块 #${e.block}`}
                </span>
                <a
                  href={`https://bscscan.com/tx/${e.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                >
                  {e.hash.slice(0, 8)}…
                </a>
                <span className="ml-auto font-semibold text-emerald-600 dark:text-emerald-400">
                  +{Number(formatUnits(e.amount, 18)).toFixed(4)} USDT
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
