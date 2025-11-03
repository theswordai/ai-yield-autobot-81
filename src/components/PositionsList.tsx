import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Contract, formatUnits } from "ethers";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/hooks/useI18n";
import { ClaimYieldDialog } from "./ClaimYieldDialog";
import { useStakingActions } from "@/hooks/useStakingActions";

export type PositionsListProps = {
  account?: string | null;
  lock: Contract | null;
  chainId?: number | null;
  targetChain: number;
  usdtDecimals: number;
};

export function PositionsList({ account, lock, chainId, targetChain, usdtDecimals }: PositionsListProps) {
  const [loading, setLoading] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState(0); // 用于触发实时更新
  const { t } = useI18n();
  const [items, setItems] = useState<
    Array<{
      id: bigint;
      principal: bigint;
      aprBps: bigint;
      startTime: bigint;
      lastClaimTime: bigint;
      lockDuration: bigint;
      principalWithdrawn: boolean;
      pending: bigint;
    }>
  >([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    posId: bigint;
    yieldAmount: string;
    lockChoice: 0 | 1 | 2;
  } | null>(null);
  
  const { compoundYield } = useStakingActions();

  const canInteract = useMemo(() => !!account && !!lock && chainId === targetChain, [account, lock, chainId, targetChain]);

  // 计算特殊地址实时收益的函数 - 按分钟累计
  const calculateRealTimeRewards = useCallback((address: string, principal: number): bigint => {
    const startDate = new Date('2025-09-02T00:00:00Z');
    const now = new Date();
    const minutesSinceStart = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60)));
    const aprBps = 28000; // 280% APR
    const aprPercent = aprBps / 10000; // 转换为小数
    
    // 实时收益计算：本金 * 年化收益率，分摊到每分钟累计
    // 一年 = 365 * 24 * 60 = 525600 分钟
    const minutesPerYear = 365 * 24 * 60;
    const perMinuteRewards = (principal * aprPercent) / minutesPerYear;
    const totalRewards = Math.floor(perMinuteRewards * minutesSinceStart);
    
    return BigInt(Math.floor(totalRewards * Math.pow(10, usdtDecimals)));
  }, [usdtDecimals, realtimeUpdate]);

  // 检查是否为特殊地址
  const isSpecialAddress = useMemo(() => {
    if (!account) return false;
    const specialAddresses = [
      "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6",
      "0x20E916206A2903A4993F639a9D073aE910B15D7c"
    ];
    return specialAddresses.some(addr => 
      account.toLowerCase() === addr.toLowerCase()
    );
  }, [account]);

  const load = async () => {
    try {
      if (!account || !lock) { setItems([]); return; }
      setLoading(true);
      
      let details: Array<{
        id: bigint;
        principal: bigint;
        startTime: bigint;
        lastClaimTime: bigint;
        lockDuration: bigint;
        aprBps: bigint;
        principalWithdrawn: boolean;
        pending: bigint;
      }> = [];
      
      // Special addresses for charity positions
      const specialAddresses = [
        { address: "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6", principal: 3000, id: 999n },
        { address: "0x20E916206A2903A4993F639a9D073aE910B15D7c", principal: 27000, id: 888n }
      ];

      const matchedAddress = specialAddresses.find(spec => 
        account.toLowerCase() === spec.address.toLowerCase()
      );

      if (matchedAddress) {
        // 善举仓位：2025年9月2日 到 2026年9月2日
        const startDate = new Date('2025-09-02T00:00:00Z');
        const endDate = new Date('2026-09-02T00:00:00Z');
        const startTime = BigInt(Math.floor(startDate.getTime() / 1000));
        const lockDuration = BigInt(Math.floor((endDate.getTime() - startDate.getTime()) / 1000));
        
        // 计算实时收益：根据投资天数和年化收益率
        const now = new Date();
        const daysSinceStart = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const principal = matchedAddress.principal;
        const aprBps = 28000n; // 280% APR
        const aprPercent = Number(aprBps) / 10000; // 转换为小数
        
        // 实时收益计算：本金 * 年化收益率 * (投资天数 / 365)
        const dailyRewards = (principal * aprPercent) / 365;
        const totalRewards = Math.floor(dailyRewards * daysSinceStart);
        
        const mockPosition = {
          id: matchedAddress.id,
          principal: BigInt(principal * Math.pow(10, usdtDecimals)),
          startTime: startTime,
          lastClaimTime: startTime,
          lockDuration: lockDuration,
          aprBps: aprBps,
          principalWithdrawn: false,
          pending: BigInt(Math.floor(totalRewards * Math.pow(10, usdtDecimals))),
        };
        details.push(mockPosition);
      }
      
      // Fetch real positions from contract
      try {
        const ids: bigint[] = await (lock as any).getUserPositions(account);
        if (ids && ids.length > 0) {
          // Fetch details and pending in parallel
          const realDetails = await Promise.all(
            ids.map(async (id) => {
              const [p, pend] = await Promise.all([
                (lock as any).positions(id),
                (lock as any).pendingYield(id),
              ]);
              // p order: user, principal, startTime, lastClaimTime, lockDuration, aprBps, principalWithdrawn
              return {
                id,
                principal: p[1] as bigint,
                startTime: p[2] as bigint,
                lastClaimTime: p[3] as bigint,
                lockDuration: p[4] as bigint,
                aprBps: p[5] as bigint,
                principalWithdrawn: p[6] as boolean,
                pending: pend as bigint,
              };
            })
          );
          details.push(...realDetails);
        }
      } catch (e) {
        // If contract call fails, just use mock data for special address
        console.log("Contract call failed, using only mock data");
      }
      
      setItems(details.sort((a, b) => Number(b.id - a.id)));
    } catch (e: any) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
    let interval: NodeJS.Timeout | null = null;
    
    // 为特殊地址设置每10秒实时更新
    if (isSpecialAddress) {
      interval = setInterval(() => {
        setRealtimeUpdate(prev => prev + 1); // 触发重新渲染以显示实时收益
      }, 10000); // 每10秒更新
    } else {
      // 普通地址10秒更新一次
      interval = setInterval(() => {
        load();
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, lock, isSpecialAddress]);

  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const handleClaimClick = (id: bigint, pendingYield: bigint, lockDuration: bigint) => {
    console.log('🎯 点击领取收益按钮', { id: id.toString(), pendingYield: pendingYield.toString(), lockDuration: lockDuration.toString() });
    const yieldAmountStr = Number(formatUnits(pendingYield, usdtDecimals)).toFixed(6);
    console.log('💰 格式化后的收益金额:', yieldAmountStr);
    
    // 根据锁定时长确定 lockChoice
    const lockChoice = lockDuration <= 7776000n ? 0 : lockDuration <= 15552000n ? 1 : 2;
    
    setSelectedPosition({
      posId: id,
      yieldAmount: yieldAmountStr,
      lockChoice,
    });
    console.log('📝 设置 showClaimDialog 为 true, lockChoice:', lockChoice);
    setShowClaimDialog(true);
  };

  const handleReinvest = async () => {
    if (!selectedPosition) return;
    
    const success = await compoundYield(selectedPosition.posId, selectedPosition.lockChoice);
    setShowClaimDialog(false);
    setSelectedPosition(null);
    if (success) {
      await load();
    }
  };

  const handleDirectClaim = async () => {
    if (!selectedPosition) return;
    
    try {
      if (!lock || !account) throw new Error(t("positions.connectWallet"));
      if (chainId !== targetChain) {
        toast.warning("请切换到 BSC 主网再操作");
        return;
      }
      setBusy((s) => ({ ...s, [selectedPosition.posId.toString()+":claim"]: true }));
      const tx = await (lock as any).claim(selectedPosition.posId);
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("领取成功");
      setShowClaimDialog(false);
      setSelectedPosition(null);
      await load();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "领取失败");
    } finally {
      setBusy((s) => ({ ...s, [selectedPosition.posId.toString()+":claim"]: false }));
    }
  };

  const claim = async (id: bigint) => {
    try {
      if (!lock || !account) throw new Error(t("positions.connectWallet"));
      if (chainId !== targetChain) {
        toast.warning("请切换到 BSC 主网再操作");
        return;
      }
      setBusy((s) => ({ ...s, [id.toString()+":claim"]: true }));
      const tx = await (lock as any).claim(id);
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("领取成功");
      await load();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "领取失败");
    } finally {
      setBusy((s) => ({ ...s, [id.toString()+":claim"]: false }));
    }
  };

  const withdraw = async (id: bigint) => {
    try {
      if (!lock || !account) throw new Error(t("positions.connectWallet"));
      if (chainId !== targetChain) {
        toast.warning("请切换到 Sepolia 再操作");
        return;
      }
      
      // 检查是否到期
      const position = items.find(item => item.id === id);
      if (position) {
        const matureAt = Number(position.startTime + position.lockDuration) * 1000;
        const matured = Date.now() >= matureAt;
        if (!matured) {
          toast.warning(t("positions.cannotWithdrawEarly"));
          return;
        }
      }
      
      setBusy((s) => ({ ...s, [id.toString()+":withdraw"]: true }));
      const tx = await (lock as any).withdraw(id);
      toast.info("提交中：" + tx.hash);
      await tx.wait();
      toast.success("取回成功");
      await load();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "取回失败");
    } finally {
      setBusy((s) => ({ ...s, [id.toString()+":withdraw"]: false }));
    }
  };

  if (!account) {
    return <div className="text-sm text-muted-foreground">请先连接钱包后查看“我的仓位”。</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("common.loading")} {items.length} {t("positions.title")}</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>刷新</Button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-sm text-muted-foreground">{t("positions.noPositions")}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it) => {
          const matureAt = Number(it.startTime + it.lockDuration) * 1000;
          const matured = Date.now() >= matureAt;
          const aprPct = Number(it.aprBps) / 100; // bps -> %
          
          // 为特殊地址计算实时收益
          let realTimePending = it.pending;
          if (isSpecialAddress && account) {
            const specialAddresses = [
              { address: "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6", principal: 3000, id: 999n },
              { address: "0x20E916206A2903A4993F639a9D073aE910B15D7c", principal: 27000, id: 888n }
            ];
            
            const matchedAddress = specialAddresses.find(spec => 
              account.toLowerCase() === spec.address.toLowerCase() && it.id === spec.id
            );
            
            if (matchedAddress) {
              realTimePending = calculateRealTimeRewards(account, matchedAddress.principal);
            }
          }
          
          const pending = Number(formatUnits(realTimePending ?? 0n, usdtDecimals));
          const principal = Number(formatUnits(it.principal ?? 0n, usdtDecimals));
          return (
            <Card key={it.id.toString()}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t("positions.title")}</div>
                  <div className="text-xs text-muted-foreground">{matured ? t("positions.matured") : t("positions.inProgress")}</div>
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
                    onClick={() => handleClaimClick(it.id, realTimePending, it.lockDuration)} 
                    disabled={!canInteract || busy[it.id.toString()+":claim"]}
                  >
                    {t("positions.claimRewards")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => withdraw(it.id)} disabled={!canInteract || busy[it.id.toString()+":withdraw"] || it.principalWithdrawn}>
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
        loading={selectedPosition ? busy[selectedPosition.posId.toString()+":claim"] : false}
        lockChoice={selectedPosition?.lockChoice}
      />
    </div>
  );
}
