import { useMemo, useState } from "react";
import { parseUnits } from "ethers";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLegendaryDashboard, fmt, fmtAllowance } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { calcPool1AprBps, aprBpsToApyPct } from "@/config/legendary";
import { useWeb3 } from "@/hooks/useWeb3";

export function DepositTab({ onDone }: { onDone: () => void }) {
  const { account, connect } = useWeb3();
  const { data, refetch } = useLegendaryDashboard();
  const { deposit, approve, busy } = useLegendaryActions(() => {
    refetch();
  });

  const [amount, setAmount] = useState("");

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
  const baseInvalid =
    !account || data.paused || data.frozen || amountWei <= 0n || tooLow || overBalance;
  const approveDisabled = baseInvalid || busy !== null || !needApprove;
  const depositDisabled = baseInvalid || busy !== null || needApprove;


  if (!account) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <p className="text-muted-foreground mb-4">请先连接钱包再进行存款</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 max-w-2xl">
      <h3 className="text-lg font-bold mb-1">一池存款（锁仓 365 天）</h3>
      <p className="text-sm text-muted-foreground mb-4">
        基础 APR 260%，每 5,000 USDT +3%，最高 +30%。最低 200 USDT。
      </p>

      <div className="space-y-4">
        <div>
          <Label className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>存入金额 (USDT)</span>
            <span>钱包余额：{fmt(data.usdtBalance)}</span>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-muted-foreground">该笔 APR</div>
            <div className="text-xl font-bold text-amber-400">{(aprBps / 100).toFixed(2)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-muted-foreground">日复利 APY</div>
            <div className="text-xl font-bold text-emerald-400">{apy.toFixed(0)}%</div>
          </div>
        </div>

        {tooLow && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>最低存款 200 USDT</AlertDescription>
          </Alert>
        )}
        {overBalance && !tooLow && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>余额不足</AlertDescription>
          </Alert>
        )}
        {data.paused && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>合约已暂停，暂时无法存款</AlertDescription>
          </Alert>
        )}
        {data.frozen && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>账户已冻结，请联系客服</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled={approveDisabled}
            onClick={async () => {
              await approve();
              await refetch();
            }}
            variant="outline"
            className="h-12 text-base font-semibold border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
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
            <span className="text-amber-400"> · 需先授权再存款</span>
          )}
        </p>

      </div>
    </Card>
  );
}
