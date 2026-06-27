import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "ethers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Layers, Zap } from "lucide-react";
import { useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
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

  // 允许 CLASS-A 与 CLASS-B 仓位的利息都作为复投资金来源
  const eligibleActive = data.positions.filter(
    (p) => !p.withdrawn && (p.poolType === 1 || p.poolType === 2)
  );
  const pool2Active = data.positions.filter((p) => !p.withdrawn && p.poolType === 2);

  const toggle = (id: bigint) => {
    const key = id.toString();
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const selectedPositions = useMemo(
    () => eligibleActive.filter((p) => selected.has(p.id.toString())),
    [eligibleActive, selected]
  );
  const selectedIds = selectedPositions.map((p) => p.id);
  const selectedPending = selectedPositions.reduce((s, p) => s + p.pending, 0n);

  let amountWei: bigint = 0n;
  try {
    amountWei = amount ? parseUnits(amount, 18) : 0n;
  } catch {
    amountWei = 0n;
  }
  const amountNum = Number(amount || "0");
  const tooLow = amountNum > 0 && amountNum < 200;
  const tooHigh = amountWei > selectedPending;

  // 一键全选并最大复投：选中所有可用仓位，金额=所有未领利息向下取整到 USDT
  const handleMaxCompound = () => {
    setSelected(new Set(eligibleActive.map((p) => p.id.toString())));
    const total = eligibleActive.reduce((s, p) => s + p.pending, 0n);
    // 向下取整到整数 USDT（避免精度误差超过链上 pending 导致 revert）
    const whole = total / 10n ** 18n;
    setAmount(whole.toString());
  };

  const handleClear = () => {
    setSelected(new Set());
    setAmount("");
  };

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
          从 CLASS-A / CLASS-B 仓位的未领利息中扣除作为本金，进入新的 CLASS-B 仓位，锁仓 365 天。最低 200 USDT。
        </p>
      </Card>

      {/* 选择利息来源仓位 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-semibold">选择仓位的利息作为资金</div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-amber-400/40 text-amber-600 dark:text-amber-400"
              disabled={busy !== null || eligibleActive.length === 0}
              onClick={handleMaxCompound}
            >
              <Zap className="w-3 h-3 mr-1" />
              一键全选最大复投
            </Button>
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={handleClear}
            >
              清空
            </button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          已选 {selectedIds.length} · 合计利息 {fmt(selectedPending)} USDT
        </div>
        {eligibleActive.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            暂无活跃仓位，请先去「CLASS-A」存入
          </div>
        ) : (
          <div className="space-y-2">
            {eligibleActive.map((p) => (
              <div
                key={p.id.toString()}
                className="flex items-center gap-3 p-2 rounded border border-foreground/10 bg-foreground/[0.04]"
              >
                <Checkbox
                  checked={selected.has(p.id.toString())}
                  onCheckedChange={() => toggle(p.id)}
                />
                <div className="text-xs text-muted-foreground">#{p.id.toString()}</div>
                <Badge
                  variant="outline"
                  className={
                    p.poolType === 1
                      ? "border-amber-400/40 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0"
                      : "border-emerald-400/40 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0"
                  }
                >
                  {p.poolType === 1 ? "CLASS-A" : "CLASS-B"}
                </Badge>
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
        {tooHigh && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>复投金额不能超过所选仓位的未领利息合计</AlertDescription>
          </Alert>
        )}
        <Button
          disabled={
            busy !== null ||
            selectedIds.length === 0 ||
            tooLow ||
            tooHigh ||
            amountNum <= 0
          }
          onClick={async () => {
            const ok = await compoundToPool2(selectedIds, amount);
            if (ok) {
              setAmount("");
              setSelected(new Set());
            }
          }}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 h-12 text-base font-semibold"
        >
          {busy === "compound" ? "复投中..." : "确认复投到CLASS-B"}
        </Button>
      </Card>

      {/* 已有CLASS-B仓位 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="text-sm font-semibold mb-3">我的CLASS-B仓位（{pool2Active.length}）</div>
        {pool2Active.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">暂无CLASS-B仓位</div>
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
                      CLASS-B
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
