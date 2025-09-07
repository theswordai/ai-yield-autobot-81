import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { useUSDVData } from "@/hooks/useUSDVData";
import { useUSDVActions } from "@/hooks/useUSDVActions";
import { Navbar } from "@/components/Navbar";
import { WalletConnector } from "@/components/WalletConnector";
import { SpinWheel } from "@/components/SpinWheel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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

            {/* USDV介绍 */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    USDV币（蓝光极慈币）
                  </h2>
                  <p className="text-lg font-medium text-foreground">
                    完成任务，赚取USDV
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">定位宣言</h3>
                    <div className="text-muted-foreground space-y-3 leading-relaxed">
                      <p>蓝光极慈币，不仅是一枚数字资产，更是一份人类善意的见证。它承载了财富的自由流动，也点亮了慈善的永恒光辉。</p>
                      <div className="grid gap-2 ml-4">
                        <p>• 每一份捐助，都是对未来的播种</p>
                        <p>• 每一次持有，都是对善意的呼应</p>
                        <p>• 每一枚蓝光极慈币，都是为全球自闭症儿童点亮的一束蓝光</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">特征</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">财富凭证</Badge>
                        <p className="text-sm text-muted-foreground">捐助者的收益凭证与参与生态的钥匙。</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">慈善符号</Badge>
                        <p className="text-sm text-muted-foreground">平台利润的一部分自动注入公益基金会。</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">荣誉象征</Badge>
                        <p className="text-sm text-muted-foreground">积分体系与身份等级绑定，让善意可见、荣耀可循。</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">国际共鸣</Badge>
                        <p className="text-sm text-muted-foreground">以蓝色为自闭症公益的国际象征，汇聚全球关怀之心。</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">愿景</h3>
                    <div className="text-muted-foreground space-y-3 leading-relaxed">
                      <p>蓝光极慈币将成为财富文明与慈善文明的交汇点：</p>
                      <div className="grid gap-2 ml-4">
                        <p>• 它让资本流动转化为爱心流动</p>
                        <p>• 它让区块链透明见证善意</p>
                        <p>• 它让捐助不仅止于利润，更升华为人类命运共同体的价值共鸣</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200">
                      <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
                        「蓝光极慈币，每一枚都在为人类点亮善意之光。」
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <CardContent className="py-8">
                    <SpinWheel
                      onSpin={spin}
                      disabled={!data.canSpin.ok || actionLoading.spin}
                      loading={actionLoading.spin}
                      canSpin={data.canSpin.ok}
                      statusText={getSpinStatusText()}
                    />
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