import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Layers } from "lucide-react";
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

export function Pool2Tab() {
  const { account, connect } = useWeb3();
  const { data, refetch } = useLegendaryDashboard();
  const { compoundToPool2, claimInterest, withdraw, busy } = useLegendaryActions(refetch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState("");

  const pool1Active = data.positions.filter((p) => !p.withdrawn && p.poolType === 1);
  const pool2Active = data.positions.filter((p) => !p.withdrawn && p.poolType === 2);

  const toggle = (id: bigint) => {
    const key = id.toString();
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const selectedPositions = useMemo(
    () => pool1Active.filter((p) => selected.has(p.id.toString())),
    [pool1Active, selected]
  );
  const selectedIds = selectedPositions.map((p) => p.id);
  const selectedPending = selectedPositions.reduce((s, p) => s + p.pending, 0n);

  const amountNum = Number(amount || "0");
  const tooLow = amountNum > 0 && amountNum < 200;

  if (!account) {
    return (
      <Card className="p-8 bg-foreground/5 backdrop-blur-xl border-foreground/15 text-center">
        <p className="text-muted-foreground mb-4">请先连接钱包再进行复投</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 说明卡 */}
      <Card className="p-6 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold">CLASS-B（APR 360%）</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          从一池仓位的未领利息中扣除作为本金，进入二池，锁仓 365 天。最低 200 USDT。
        </p>
      </Card>

      {/* 选择一池仓位 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">选择一池仓位的利息作为资金</div>
          <div className="text-xs text-muted-foreground">
            已选 {selectedIds.length} · 合计利息 {fmt(selectedPending)} USDT
          </div>
        </div>
        {pool1Active.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            暂无一池活跃仓位，请先去"CLASS-A"
          </div>
        ) : (
          <div className="space-y-2">
            {pool1Active.map((p) => (
              <div
                key={p.id.toString()}
                className="flex items-center gap-3 p-2 rounded border border-foreground/10 bg-foreground/[0.04]"
              >
                <Checkbox
                  checked={selected.has(p.id.toString())}
                  onCheckedChange={() => toggle(p.id)}
                />
                <div className="text-xs text-muted-foreground">#{p.id.toString()}</div>
                <div className="text-sm flex-1">本金 {fmt(p.principal)}</div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">利息 {fmt(p.pending)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 输入复投金额 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15 space-y-3">
        <div>
          <Label className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>复投金额 (USDT)</span>
            <span>可用利息：{fmt(selectedPending)}</span>
          </Label>
          <Input
            type="number"
            min="200"
            step="1"
            placeholder="≥ 200"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
          />
        </div>
        {tooLow && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>最低复投 200 USDT</AlertDescription>
          </Alert>
        )}
        <Button
          disabled={busy !== null || selectedIds.length === 0 || tooLow || amountNum <= 0}
          onClick={async () => {
            const ok = await compoundToPool2(selectedIds, amount);
            if (ok) {
              setAmount("");
              setSelected(new Set());
            }
          }}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 h-12 text-base font-semibold"
        >
          {busy === "compound" ? "复投中..." : "确认复投到二池"}
        </Button>
      </Card>

      {/* 已有二池仓位 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="text-sm font-semibold mb-3">我的二池仓位（{pool2Active.length}）</div>
        {pool2Active.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">暂无二池仓位</div>
        ) : (
          <div className="space-y-3">
            {pool2Active.map((p) => {
              const matured = Number(p.startTime) + LOCK_SEC <= Math.floor(Date.now() / 1000);
              return (
                <div
                  key={p.id.toString()}
                  className="p-3 rounded-lg border border-foreground/15 bg-foreground/[0.04]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-emerald-400/40 text-emerald-600 dark:text-emerald-400">
                      二池
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{p.id.toString()}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                  <div className="mt-3 pt-3 border-t border-foreground/10 flex flex-wrap gap-2 justify-end">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
