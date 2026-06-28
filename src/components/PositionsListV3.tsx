import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Contract, formatUnits } from "ethers";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/hooks/useI18n";
import { ClaimYieldDialog } from "./ClaimYieldDialog";
import { isStakePositionsHidden } from "@/config/hiddenPositionWallets";

export type PositionsListV3Props = {
  account?: string | null;
  /** New V3 contract (signer-bound). Used for new positions read + all writes. */
  lockV3: Contract | null;
  /** Old (legacy) contract — read only. Used to enumerate legacy posIds. */
  lockLegacy: Contract | null;
  chainId?: number | null;
  targetChain: number;
  usdtDecimals: number;
};

type PositionRow = {
  id: bigint;
  principal: bigint;
  startTime: bigint;
  lastClaimTime: bigint;
  lockDuration: bigint;
  aprBps: bigint;
  principalWithdrawn: boolean;
  pending: bigint;
  legacy: boolean;
};

export function PositionsListV3({
  account,
  lockV3,
  lockLegacy,
  chainId,
  targetChain,
  usdtDecimals,
}: PositionsListV3Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PositionRow[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    posId: bigint;
    yieldAmount: string;
    lockChoice: 0 | 1 | 2;
    legacy: boolean;
  } | null>(null);
  const { t } = useI18n();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();

  const canInteract = useMemo(
    () => !!account && !!lockV3 && chainId === targetChain,
    [account, lockV3, chainId, targetChain]
  );

  const fetchFromContract = useCallback(
    async (c: Contract, legacy: boolean): Promise<PositionRow[]> => {
      try {
        const ids: bigint[] = await (c as any).getUserPositions(account);
        if (!ids || ids.length === 0) return [];
        const rows = await Promise.all(
          ids.map(async (id) => {
            const [p, pend] = await Promise.all([
              (c as any).positions(id),
              (c as any).pendingYield(id).catch(() => 0n),
            ]);
            return {
              id,
              principal: p[1] as bigint,
              startTime: p[2] as bigint,
              lastClaimTime: p[3] as bigint,
              lockDuration: p[4] as bigint,
              aprBps: p[5] as bigint,
              principalWithdrawn: p[6] as boolean,
              pending: pend as bigint,
              legacy,
            } as PositionRow;
          })
        );
        return rows;
      } catch {
        return [];
      }
    },
    [account]
  );

  const load = useCallback(async () => {
    if (!account) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const results: PositionRow[] = [];
      if (lockLegacy) {
        results.push(...(await fetchFromContract(lockLegacy, true)));
      }
      if (lockV3) {
        results.push(...(await fetchFromContract(lockV3, false)));
      }
      // sort newest first, legacy and new mixed by id
      results.sort((a, b) => {
        if (a.legacy !== b.legacy) return a.legacy ? 1 : -1; // new first
        return Number(b.id - a.id);
      });
      setItems(results);
    } finally {
      setLoading(false);
    }
  }, [account, lockV3, lockLegacy, fetchFromContract]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleClaimClick = (row: PositionRow) => {
    const yieldAmountStr = Number(formatUnits(row.pending ?? 0n, usdtDecimals)).toFixed(6);
    const lockChoice: 0 | 1 | 2 =
      row.lockDuration <= 7776000n ? 0 : row.lockDuration <= 15552000n ? 1 : 2;
    setSelectedPosition({
      posId: row.id,
      yieldAmount: yieldAmountStr,
      lockChoice,
      legacy: row.legacy,
    });
    setShowClaimDialog(true);
  };

  const handleReinvest = () => {
    setShowClaimDialog(false);
    setSelectedPosition(null);
    const prefix = lang === "en" ? "/en" : "/zh";
    navigate(`${prefix}/flexible`);
  };

  const handleDirectClaim = async () => {
    if (!selectedPosition) return;
    const key = selectedPosition.posId.toString() + ":claim";
    try {
      if (!lockV3 || !account) throw new Error(t("positions.connectWallet"));
      if (chainId !== targetChain) {
        toast.warning("请切换到 BSC 主网再操作");
        return;
      }
      setBusy((s) => ({ ...s, [key]: true }));
      const tx = selectedPosition.legacy
        ? await (lockV3 as any).claimLegacy(selectedPosition.posId)
        : await (lockV3 as any).claim(selectedPosition.posId);
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("领取成功");
      setShowClaimDialog(false);
      setSelectedPosition(null);
      await load();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "领取失败");
    } finally {
      setBusy((s) => ({ ...s, [key]: false }));
    }
  };

  const withdraw = async (row: PositionRow) => {
    const key = row.id.toString() + ":withdraw";
    try {
      if (!lockV3 || !account) throw new Error(t("positions.connectWallet"));
      if (chainId !== targetChain) {
        toast.warning("请切换到 BSC 主网再操作");
        return;
      }
      const matureAt = Number(row.startTime + row.lockDuration) * 1000;
      if (Date.now() < matureAt) {
        toast.warning(t("positions.cannotWithdrawEarly"));
        return;
      }
      setBusy((s) => ({ ...s, [key]: true }));
      const tx = row.legacy
        ? await (lockV3 as any).withdrawLegacy(row.id)
        : await (lockV3 as any).withdraw(row.id);
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("取回成功");
      await load();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "取回失败");
    } finally {
      setBusy((s) => ({ ...s, [key]: false }));
    }
  };

  if (!account) {
    return <div className="text-sm text-muted-foreground">请先连接钱包后查看“我的仓位”。</div>;
  }

  const forceEmpty = isStakePositionsHidden(account);
  const visibleItems = forceEmpty ? [] : items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("common.loading")} {visibleItems.length} {t("positions.title")}
        </p>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          刷新
        </Button>
      </div>

      {visibleItems.length === 0 && (
        <div className="text-sm text-muted-foreground">
          {forceEmpty
            ? "暂未查询到链上仓位。请确认已连接正确钱包，且网络为 BSC 主网。若仍无法显示，请稍后重试或更换网络环境。"
            : t("positions.noPositions")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleItems.map((it) => {
          const matureAt = Number(it.startTime + it.lockDuration) * 1000;
          const matured = Date.now() >= matureAt;
          const aprPct = Number(it.aprBps) / 100;
          const pending = Number(formatUnits(it.pending ?? 0n, usdtDecimals));
          const principal = Number(formatUnits(it.principal ?? 0n, usdtDecimals));
          return (
            <Card key={(it.legacy ? "L-" : "N-") + it.id.toString()}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    {t("positions.title")}
                    {it.legacy && (
                      <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-700 dark:text-amber-300 bg-amber-400/10">
                        老仓位
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {matured ? t("positions.matured") : t("positions.inProgress")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <span className="text-muted-foreground">{t("positions.principal")}</span>
                  <span className="font-mono">{principal} USDT</span>
                  <span className="text-muted-foreground">{t("positions.annualRate")}</span>
                  <span>{aprPct}%</span>
                  <span className="text-muted-foreground">{t("dashboard.startTime")}</span>
                  <span>{new Date(Number(it.startTime) * 1000).toLocaleString()}</span>
                  <span className="text-muted-foreground">{t("positions.maturityTime")}</span>
                  <span>{new Date(matureAt).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("positions.currentRewards")}</span>
                  <span className="font-mono">{pending.toFixed(6)} USDT</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleClaimClick(it)}
                    disabled={!canInteract || busy[it.id.toString() + ":claim"]}
                  >
                    {t("positions.claimRewards")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => withdraw(it)}
                    disabled={!canInteract || busy[it.id.toString() + ":withdraw"] || it.principalWithdrawn}
                  >
                    {t("positions.withdraw")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ClaimYieldDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        yieldAmount={selectedPosition?.yieldAmount || "0"}
        onReinvest={handleReinvest}
        onClaim={handleDirectClaim}
        loading={selectedPosition ? busy[selectedPosition.posId.toString() + ":claim"] : false}
        lockChoice={selectedPosition?.lockChoice}
      />
    </div>
  );
}
