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
import { TrendingUp, Wallet, Gift, Crown } from "lucide-react";
import { StatCard } from "@/components/legendary/StatCard";
import { useLegendaryDashboard, fmt, LegendaryPosition } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { useWeb3 } from "@/hooks/useWeb3";


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

export function PositionsTab() {
  const { account, connect } = useWeb3();
  const { data, refetch } = useLegendaryDashboard();
  const { claimInterest, withdraw, earlyWithdraw, compoundToPool2, busy } =
    useLegendaryActions(refetch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [earlyTarget, setEarlyTarget] = useState<LegendaryPosition | null>(null);
  const [compoundOpen, setCompoundOpen] = useState(false);
  const [compoundAmount, setCompoundAmount] = useState("");

  const active = data.positions.filter((p) => !p.withdrawn);

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
      <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <p className="text-muted-foreground mb-4">请先连接钱包查看你的仓位</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10 flex flex-wrap gap-2 items-center">
        <div className="text-sm text-muted-foreground mr-auto">
          共 {active.length} 个活跃仓位 · 已选 {selectedIds.length}
        </div>
        <Button
          size="sm"
          disabled={selectedIds.length === 0 || busy !== null}
          onClick={() => claimInterest(selectedIds)}
          variant="outline"
          className="border-white/20"
        >
          批量领利息
        </Button>
        <Button
          size="sm"
          disabled={selectedIds.length === 0 || busy !== null}
          onClick={() => setCompoundOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-600"
        >
          复投到二池
        </Button>
      </Card>

      {active.length === 0 && (
        <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center text-muted-foreground">
          暂无活跃仓位
        </Card>
      )}

      <div className="space-y-3">
        {active.map((p) => {
          const matured = Number(p.startTime) + LOCK_SEC <= Math.floor(Date.now() / 1000);
          return (
            <Card key={p.id.toString()} className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
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
                            ? "border-amber-400/40 text-amber-400"
                            : "border-emerald-400/40 text-emerald-400"
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
                    <div className="font-semibold text-amber-400">
                      {(Number(p.aprBps) / 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">已计利息</div>
                    <div className="font-semibold text-emerald-400">{fmt(p.pending)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">到期剩余</div>
                    <div className="font-semibold">{timeLeft(p.startTime)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2 items-center">
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
              将扣除 <span className="text-destructive font-bold">50% 本金</span>{" "}
              作为罚金，已计利息照付。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          {earlyTarget && (
            <div className="text-sm space-y-1">
              <div>本金：{fmt(earlyTarget.principal)} USDT</div>
              <div>
                返还本金：
                <span className="text-amber-400">
                  {fmt(earlyTarget.principal / 2n)} USDT
                </span>
              </div>
              <div>
                返还利息：
                <span className="text-emerald-400">{fmt(earlyTarget.pending)} USDT</span>
              </div>
            </div>
          )}
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

      {/* Compound to pool2 */}
      <Dialog open={compoundOpen} onOpenChange={setCompoundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>复投到二池（APR 360%）</DialogTitle>
            <DialogDescription>
              从已选 {selectedIds.length} 个仓位的未领利息中扣除，复投进入二池，锁 365 天。最低 200
              USDT。
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            min="200"
            step="1"
            placeholder="≥ 200"
            value={compoundAmount}
            onChange={(e) => setCompoundAmount(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompoundOpen(false)}>
              取消
            </Button>
            <Button
              disabled={busy !== null}
              onClick={async () => {
                const ok = await compoundToPool2(selectedIds, compoundAmount);
                if (ok) {
                  setCompoundOpen(false);
                  setCompoundAmount("");
                  setSelected(new Set());
                }
              }}
              className="bg-gradient-to-r from-amber-500 to-yellow-600"
            >
              确认复投
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
