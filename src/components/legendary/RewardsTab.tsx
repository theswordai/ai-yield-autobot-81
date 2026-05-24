import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUnits } from "ethers";
import { Gift, Clock } from "lucide-react";
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
          <div className="flex items-center gap-2 text-amber-300 mb-2">
            <span className="inline-flex w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 items-center justify-center">
              <Gift className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium tracking-wide">待领取奖励</span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            {fmt(data.referralClaimable)} <span className="text-2xl text-amber-300/80">USDT</span>
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
                      ? "border-emerald-400/40 text-emerald-400"
                      : e.type.startsWith("动态")
                      ? "border-purple-400/40 text-purple-400"
                      : "border-amber-400/40 text-amber-400"
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
    </div>
  );
}
