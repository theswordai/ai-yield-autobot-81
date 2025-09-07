import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { useUSDVData } from "@/hooks/useUSDVData";
import { useUSDVActions } from "@/hooks/useUSDVActions";
import { Navbar } from "@/components/Navbar";
import { WalletConnector } from "@/components/WalletConnector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wallet, Gift, TrendingUp, Target, Dice1 } from "lucide-react";

export default function USDV() {
  const { t } = useI18n();
  const { data, loading, formatAmount, formatPercent, refreshData } = useUSDVData();
  const { loading: actionLoading, claimStakeUSDV, claimProfitFollow, claimNewcomer, spin } = useUSDVActions();
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());

  const handlePositionSelect = (posId: string, checked: boolean) => {
    const newSelected = new Set(selectedPositions);
    if (checked) {
      newSelected.add(posId);
    } else {
      newSelected.delete(posId);
    }
    setSelectedPositions(newSelected);
  };

  const handleClaimProfitFollow = () => {
    const posIds = Array.from(selectedPositions).map(id => BigInt(id));
    claimProfitFollow(posIds).then(() => {
      setSelectedPositions(new Set());
      refreshData();
    });
  };

  const handleAction = async (actionFn: () => Promise<void>) => {
    await actionFn();
    refreshData();
  };

  const getSpinStatusText = () => {
    if (!data?.canSpin) return "";
    
    if (data.canSpin.ok) return "";
    
    switch (data.canSpin.reason) {
      case "no investment":
        return "需有投资才可抽奖";
      case "cooldown":
        return "24 小时冷却中";
      case "daily cap reached":
        return "今日奖池已达上限";
      default:
        return data.canSpin.reason;
    }
  };

  const dailyProgress = data?.dailyProgress && data.dailyProgress.cap > 0
    ? (Number(data.dailyProgress.minted) / Number(data.dailyProgress.cap)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>USDV 奖励系统 - 善举即财富</title>
        <meta name="description" content="领取 USDV 奖励，参与抽奖，获得更多收益" />
      </Helmet>
      
      <Navbar />

      <div className="pt-16 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                USDV 奖励系统
              </h1>
              <p className="text-muted-foreground text-lg">
                领取你的 USDV 奖励，参与抽奖获得更多收益
              </p>
            </div>

            <WalletConnector />

            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">加载数据中...</span>
                </CardContent>
              </Card>
            )}

            {data && (
              <div className="grid gap-8 lg:grid-cols-2">
                {/* 资产概览 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      资产概览
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">我的地址</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {data.address.slice(0, 6)}...{data.address.slice(-4)}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">USDV 余额</span>
                        <span className="font-semibold text-lg">
                          {formatAmount(data.usdvBalance)} USDV
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">BNB 余额</span>
                        <span className="text-sm">
                          {Number(formatAmount(data.bnbBalance)).toFixed(4)} BNB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 抽奖 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dice1 className="h-5 w-5" />
                      每日抽奖
                    </CardTitle>
                    <CardDescription>
                      每 24 小时一次；开奖为 1–100 USDV；今日上限用尽则不可抽
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>今日进度</span>
                        <span>
                          {formatAmount(data.dailyProgress.minted)} / {formatAmount(data.dailyProgress.cap)}
                        </span>
                      </div>
                      <Progress value={dailyProgress} className="h-2" />
                    </div>

                    {!data.canSpin.ok && (
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {getSpinStatusText()}
                      </div>
                    )}

                    <Button
                      onClick={() => handleAction(spin)}
                      disabled={!data.canSpin.ok || actionLoading.spin}
                      className="w-full"
                    >
                      {actionLoading.spin && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {data.canSpin.ok ? "开始抽奖" : "暂不可用"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {data && (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* 按天生息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      按天生息
                    </CardTitle>
                    <CardDescription>
                      按"整天"结算，不足 24 小时会返回 nothing to claim
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAction(claimStakeUSDV)}
                      disabled={actionLoading.claimStake}
                      className="w-full"
                    >
                      {actionLoading.claimStake && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      领取奖励
                    </Button>
                  </CardContent>
                </Card>

                {/* 新人奖励 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      新人奖励
                    </CardTitle>
                    <CardDescription>
                      首次有效入金可领；60% 给你，40% 自动发给 1–10 级上级
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAction(claimNewcomer)}
                      disabled={data.hasJoined || actionLoading.claimNewcomer}
                      className="w-full"
                    >
                      {actionLoading.claimNewcomer && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {data.hasJoined ? "已领取" : "领取奖励"}
                    </Button>
                  </CardContent>
                </Card>

                {/* 利润跟随 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      利润跟随
                    </CardTitle>
                    <CardDescription>
                      先去 LockStakingV2.claim(posId) 领取 USDT，再来领 10×USDV
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleClaimProfitFollow}
                      disabled={actionLoading.claimProfit}
                      className="w-full"
                    >
                      {actionLoading.claimProfit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      领取奖励 {selectedPositions.size > 0 ? `(${selectedPositions.size})` : ""}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 我的质押仓位 */}
            {data && data.positions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>我的质押仓位</CardTitle>
                  <CardDescription>
                    选择仓位进行利润跟随奖励领取（需先在收益页领取 USDT）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {data.positions.map((position) => {
                       const posIdStr = position.posId?.toString() || "0";
                       const isSelected = selectedPositions.has(posIdStr);
                       const startDate = new Date(Number(position.startTime || 0) * 1000);
                       const lockDays = Number(position.lockDuration || 0) / (24 * 60 * 60);

                      return (
                        <div
                          key={posIdStr}
                          className={`border rounded-lg p-4 space-y-3 transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`position-${posIdStr}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  handlePositionSelect(posIdStr, checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`position-${posIdStr}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                仓位 #{posIdStr}
                              </label>
                            </div>
                            <div className="flex gap-2">
                               <Badge variant="outline">
                                 {formatPercent(position.aprBps || BigInt(0))}% APR
                               </Badge>
                              <Badge variant={position.principalWithdrawn ? "secondary" : "default"}>
                                {position.principalWithdrawn ? "已提取" : "锁定中"}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                             <div>
                               <div className="text-muted-foreground">本金</div>
                               <div className="font-medium">
                                 {formatAmount(position.principal || BigInt(0))} USDT
                               </div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">锁定期</div>
                               <div className="font-medium">{lockDays} 天</div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">开始时间</div>
                               <div className="font-medium">
                                 {startDate.toLocaleDateString()}
                               </div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">上次领取</div>
                               <div className="font-medium">
                                 {position.lastClaimTime && Number(position.lastClaimTime) > 0 
                                   ? new Date(Number(position.lastClaimTime) * 1000).toLocaleDateString()
                                   : "未领取"
                                 }
                               </div>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {data && data.positions.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    暂无质押仓位，去 <a href="/zh/invest" className="text-primary hover:underline">投资页面</a> 开始质押
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}