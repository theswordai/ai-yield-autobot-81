import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, Gift, Crown, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/legendary/StatCard";
import { useLegendaryDashboard, fmt, LegendaryPosition } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { useWeb3 } from "@/hooks/useWeb3";
import { LEVELS } from "@/config/legendary";


const LOCK_SEC = 365 * 24 * 3600;

function timeLeft(startTime: bigint): string {
  const end = Number(startTime) + LOCK_SEC;
  const remain = end - Math.floor(Date.now() / 1000);
  if (remain <= 0) return "已到期";
  const d = Math.floor(remain / 86400);
  const h = Math.floor((remain % 86400) / 3600);
  return `${d}天 ${h}小时`;
}

function fmtDate(ts: bigint): string {
  if (ts === 0n) return "-";
  return new Date(Number(ts) * 1000).toLocaleString("zh-CN");
}

export function PositionsTab({ onSwitchToPool2 }: { onSwitchToPool2?: () => void } = {}) {
  const { account, connect } = useWeb3();
  const { data, refetch } = useLegendaryDashboard();
  const { claimInterest, withdraw, earlyWithdraw, busy } =
    useLegendaryActions(refetch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [earlyTarget, setEarlyTarget] = useState<LegendaryPosition | null>(null);
  const [claimTarget, setClaimTarget] = useState<LegendaryPosition | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  const active = data.positions.filter((p) => !p.withdrawn);
  const totalPrincipal = data.pool1Principal + data.pool2Principal;

  const toggle = (id: bigint) => {
    const key = id.toString();
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const selectedIds = useMemo(
    () => active.filter((p) => selected.has(p.id.toString())).map((p) => p.id),
    [active, selected]
  );

  if (!account) {
    return (
      <Card className="p-8 bg-foreground/5 backdrop-blur-xl border-foreground/15 text-center">
        <p className="text-muted-foreground mb-4">请先连接钱包查看你的仓位</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Wallet}
          label="我的总锁仓本金"
          value={`${fmt(totalPrincipal)} USDT`}
          sub={`一池 ${fmt(data.pool1Principal)} · 二池 ${fmt(data.pool2Principal)}`}
          tone="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="累计可领利息"
          value={`${fmt(data.totalPending)} USDT`}
          tone="emerald"
        />
        <StatCard
          icon={Gift}
          label="可领奖励"
          value={`${fmt(data.referralClaimable)} USDT`}
          tone="primary"
        />
        <StatCard
          icon={Crown}
          label="我的等级"
          value={data.level === 0 ? "V0" : `V${data.level}`}
          sub={`自投 ${fmt(data.selfStake, 0)} · 业绩 ${fmt(data.teamPerf, 0)}`}
          tone="amber"
        />
      </div>

      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15 flex flex-wrap gap-2 items-center">
        <div className="text-sm text-muted-foreground mr-auto">
          共 {active.length} 个活跃仓位 · 已选 {selectedIds.length}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20"
          disabled={refreshing}
          onClick={handleRefresh}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </Card>


      {active.length === 0 && (
        <Card className="p-8 bg-foreground/5 backdrop-blur-xl border-foreground/15 text-center text-muted-foreground">
          暂无活跃仓位
        </Card>
      )}

      <div className="space-y-3">
        {active.map((p) => {
          const matured = Number(p.startTime) + LOCK_SEC <= Math.floor(Date.now() / 1000);
          return (
            <Card key={p.id.toString()} className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selected.has(p.id.toString())}
                    onCheckedChange={() => toggle(p.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          p.poolType === 1
                            ? "border-amber-400/40 text-amber-600 dark:text-amber-400"
                            : "border-emerald-400/40 text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {p.poolType === 1 ? "一池" : "二池"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{p.id.toString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 min-w-[260px] text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">本金</div>
                    <div className="font-semibold">{fmt(p.principal)} USDT</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">APR</div>
                    <div className="font-semibold text-amber-600 dark:text-amber-400">
                      {(Number(p.aprBps) / 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">已计利息</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(p.pending)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">到期剩余</div>
                    <div className="font-semibold">{timeLeft(p.startTime)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-foreground/10 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground mr-auto">
                  开始：{fmtDate(p.startTime)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  disabled={busy !== null || p.pending === 0n}
                  onClick={() => claimInterest([p.id])}
                >
                  领利息
                </Button>
                <Button
                  size="sm"
                  disabled={busy !== null || !matured}
                  onClick={() => withdraw(p.id)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  到期取本金
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy !== null || matured}
                  onClick={() => setEarlyTarget(p)}
                >
                  提前赎回
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Early withdraw confirm */}
      <Dialog open={!!earlyTarget} onOpenChange={(o) => !o && setEarlyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提前赎回</DialogTitle>
            <DialogDescription>
              将扣除{" "}
              <span className="text-destructive font-bold">
                {((data.earlyPenaltyBps || 5000) / 100).toFixed(data.earlyPenaltyBps % 100 === 0 ? 0 : 2)}% 本金
              </span>{" "}
              作为罚金，已计利息照付。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          {earlyTarget && (() => {
            const bps = BigInt(data.earlyPenaltyBps || 5000);
            const penalty = (earlyTarget.principal * bps) / 10000n;
            const returned = earlyTarget.principal - penalty;
            const MIN_REF = 200n * 10n ** 18n;
            let newSelf = data.selfStake - earlyTarget.principal;
            if (newSelf < 0n) newSelf = 0n;
            // recompute level by frontend LEVELS table
            let newLevel = 0;
            for (const L of LEVELS) {
              const selfMin = L.self * 10n ** 18n;
              const teamMin = L.team * 10n ** 18n;
              if (newSelf >= selfMin && data.teamPerf >= teamMin) newLevel = L.v;
            }
            const levelDown = newLevel < data.level;
            const losesRef = newSelf < MIN_REF;
            return (
              <div className="text-sm space-y-1">
                <div>本金：{fmt(earlyTarget.principal)} USDT</div>
                <div>
                  返还本金：
                  <span className="text-amber-600 dark:text-amber-400"> {fmt(returned)} USDT</span>
                </div>
                <div>
                  罚金：
                  <span className="text-destructive"> {fmt(penalty)} USDT</span>
                </div>
                <div>
                  返还利息：
                  <span className="text-emerald-600 dark:text-emerald-400">{fmt(earlyTarget.pending)} USDT</span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEarlyTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={busy !== null}
              onClick={async () => {
                if (earlyTarget) {
                  await earlyWithdraw(earlyTarget.id);
                  setEarlyTarget(null);
                }
              }}
            >
              确认提前赎回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
