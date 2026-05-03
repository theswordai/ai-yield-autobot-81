import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Unlock, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useStakingData } from "@/hooks/useStakingData";
import { useStakingActions } from "@/hooks/useStakingActions";
import { ClaimYieldDialog } from "./ClaimYieldDialog";

interface PositionsManagerProps {
  onRefresh?: () => void;
  onReinvest?: (amount: string) => void;
}

export function PositionsManager({ onRefresh, onReinvest }: PositionsManagerProps) {
  const { data, formatAmount, loading: dataLoading } = useStakingData();
  const { loading, claimYield, withdraw, compoundYield } = useStakingActions();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    posId: bigint;
    yieldAmount: string;
    lockChoice: 0 | 1 | 2;
  } | null>(null);

  const handleClaimClick = (posId: bigint, pendingYield: bigint, lockChoice: 0 | 1 | 2) => {
    console.log('🎯 点击领取收益按钮', { posId: posId.toString(), pendingYield: pendingYield.toString(), lockChoice });
    const yieldAmountStr = formatAmount(pendingYield);
    console.log('💰 格式化后的收益金额:', yieldAmountStr);
    setSelectedPosition({
      posId,
      yieldAmount: yieldAmountStr,
      lockChoice,
    });
    console.log('📝 设置 showClaimDialog 为 true');
    setShowClaimDialog(true);
  };

  const handleReinvest = async () => {
    if (selectedPosition) {
      const success = await compoundYield(selectedPosition.posId, selectedPosition.lockChoice);
      setShowClaimDialog(false);
      setSelectedPosition(null);
      if (success && onRefresh) {
        onRefresh();
      }
    }
  };

  const handleDirectClaim = async () => {
    if (selectedPosition) {
      const success = await claimYield(selectedPosition.posId);
      setShowClaimDialog(false);
      setSelectedPosition(null);
      if (success && onRefresh) {
        onRefresh();
      }
    }
  };

  const handleWithdraw = async (posId: bigint) => {
    const success = await withdraw(posId);
    if (success && onRefresh) {
      onRefresh();
    }
  };

  if (dataLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            我的仓位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.activePositions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            我的仓位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">暂无质押仓位</p>
            <p className="text-sm text-muted-foreground">开始投资即可在此查看您的仓位详情</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStaked = formatAmount(data.totalStaked);
  const totalPending = formatAmount(data.totalPendingYield);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          我的仓位
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 汇总信息 */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">总质押金额</p>
            <p className="text-xl font-bold text-primary">{totalStaked} USDT</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">待领收益</p>
            <p className="text-xl font-bold text-accent">+{totalPending} USDT</p>
          </div>
        </div>

        <Separator />

        {/* 仓位列表 */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            活跃仓位 ({data.activePositions.length})
          </h3>
          
          {data.activePositions.map((position) => (
            <div
              key={position.posId.toString()}
              className="p-4 border border-border rounded-lg space-y-4 hover:bg-muted/20 transition-colors"
            >
              {/* 仓位基本信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    {position.isMatured ? (
                      <Unlock className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <Lock className="w-5 h-5 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{formatAmount(position.principal)} USDT</div>
                    <div className="text-sm text-muted-foreground">
                      {position.lockType} • {position.aprPercent}% 年化
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={position.isMatured ? "default" : "secondary"}>
                    {position.isMatured ? "已到期" : `${position.remainingDays} 天`}
                  </Badge>
                </div>
              </div>

              {/* 收益信息 */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg text-center">
                <div>
                  <p className="text-xs text-muted-foreground">本金</p>
                  <p className="font-medium">{formatAmount(position.principal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">待领收益</p>
                  <p className="font-medium text-accent">+{formatAmount(position.pendingYield)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">年化收益率</p>
                  <p className="font-medium text-primary">{position.aprPercent}%</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 按钮被点击');
                    const lockChoice = position.lockType === "3个月" ? 0 : position.lockType === "6个月" ? 1 : 2;
                    handleClaimClick(position.posId, position.pendingYield, lockChoice);
                  }}
                  disabled={loading.claim || loading.compound}
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {loading.claim || loading.compound ? "处理中..." : "领取收益"}
                </Button>
                
                {position.isMatured && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(position.posId)}
                    disabled={loading.withdraw}
                    className="flex-1"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {loading.withdraw ? "赎回中..." : "赎回本金"}
                  </Button>
                )}
              </div>

              {/* 提示信息 */}
              <div className="text-xs text-muted-foreground">
                {position.isMatured ? (
                  <p className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    已到期，可以赎回本金。赎回将收取 2% 手续费。
                  </p>
                ) : (
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    还有 {position.remainingDays} 天到期。提前赎回将收取较高手续费。
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <ClaimYieldDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        yieldAmount={selectedPosition?.yieldAmount || "0"}
        onReinvest={handleReinvest}
        onClaim={handleDirectClaim}
        loading={loading.claim || loading.compound}
        lockChoice={selectedPosition?.lockChoice}
      />
    </Card>
  );
}