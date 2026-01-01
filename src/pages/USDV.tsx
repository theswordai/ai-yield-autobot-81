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
import { Loader2, Wallet, Gift, TrendingUp, Target, Dice1, Copy } from "lucide-react";
import { USDV_ADDRESS } from "@/config/contracts";
import { toast } from "sonner";

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
        return t("usdv.spinStatus.noInvestment");
      case "cooldown":
        return t("usdv.spinStatus.cooldown");
      case "daily cap reached":
        return t("usdv.spinStatus.dailyCapReached");
      default:
        return data.canSpin.reason;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("usdv.pageTitle")}</title>
        <meta name="description" content={t("usdv.pageDescription")} />
      </Helmet>
      
      <Navbar />

      <div className="pt-16 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent neon-text">
                {t("usdv.header")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("usdv.subheader")}
              </p>
            </div>

            {/* USDV介绍 */}
            <Card className="max-w-4xl mx-auto hologram">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    {t("bluePoints.title")}
                  </h2>
                  <p className="text-lg font-medium text-foreground">
                    {t("bluePoints.subtitle")}
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">{t("bluePoints.positioning")}</h3>
                    <div className="text-muted-foreground space-y-3 leading-relaxed">
                      <p>{t("bluePoints.positioningDesc")}</p>
                      <div className="grid gap-2 ml-4">
                        <p>• {t("bluePoints.donation")}</p>
                        <p>• {t("bluePoints.holding")}</p>
                        <p>• {t("bluePoints.light")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">{t("bluePoints.features")}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">{t("bluePoints.wealthCertificate")}</Badge>
                        <p className="text-sm text-muted-foreground">{t("bluePoints.wealthDesc")}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">{t("bluePoints.charitySymbol")}</Badge>
                        <p className="text-sm text-muted-foreground">{t("bluePoints.charityDesc")}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">{t("bluePoints.honorSymbol")}</Badge>
                        <p className="text-sm text-muted-foreground">{t("bluePoints.honorDesc")}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-blue-200">{t("bluePoints.globalResonance")}</Badge>
                        <p className="text-sm text-muted-foreground">{t("bluePoints.globalDesc")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">{t("bluePoints.vision")}</h3>
                    <div className="text-muted-foreground space-y-3 leading-relaxed">
                      <p>{t("bluePoints.visionDesc")}:</p>
                      <div className="grid gap-2 ml-4">
                        <p>• {t("bluePoints.capitalFlowKindness")}</p>
                        <p>• {t("bluePoints.blockchainWitness")}</p>
                        <p>• {t("bluePoints.humanCommunity")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200">
                      <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
                        {t("bluePoints.oneLineVisionText")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center">{t("usdv.contractAddress")}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm bg-muted px-4 py-2 rounded-lg font-mono">
                        {USDV_ADDRESS}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(USDV_ADDRESS);
                          toast.success(t("usdv.contractCopied"));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
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
                  <span className="ml-2">{t("common.loading")}</span>
                </CardContent>
              </Card>
            )}

            {data && (
              <div className="grid gap-8 lg:grid-cols-2">
                {/* 资产概览 */}
                <Card className="cyberpunk-card data-stream">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-cyan-400" />
                      {t("usdv.assetOverview")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t("usdv.myAddress")}</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {data.address.slice(0, 6)}...{data.address.slice(-4)}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t("usdv.usdvBalance")}</span>
                        <span className="font-semibold text-lg">
                          {formatAmount(data.usdvBalance)} USDV
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t("usdv.bnbBalance")}</span>
                        <span className="text-sm">
                          {Number(formatAmount(data.bnbBalance)).toFixed(4)} BNB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 抽奖 */}
                <Card className="cyberpunk-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dice1 className="h-5 w-5 text-cyan-400" />
                      {t("usdv.dailySpin")}
                    </CardTitle>
                    <CardDescription>
                      {t("usdv.dailySpinDesc")}
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
                <Card className="electric-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      {t("usdv.dailyInterest")}
                    </CardTitle>
                    <CardDescription>
                      {t("usdv.dailyInterestDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAction(claimStakeUSDV)}
                      disabled={actionLoading.claimStake}
                      className="w-full"
                    >
                      {actionLoading.claimStake && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {t("usdv.claimReward")}
                    </Button>
                  </CardContent>
                </Card>

                {/* 新人奖励 */}
                <Card className="electric-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-yellow-400" />
                      {t("usdv.newcomerReward")}
                    </CardTitle>
                    <CardDescription>
                      {t("usdv.newcomerRewardDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAction(claimNewcomer)}
                      disabled={data.hasJoined || actionLoading.claimNewcomer}
                      className="w-full"
                    >
                      {actionLoading.claimNewcomer && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {data.hasJoined ? t("usdv.claimed") : t("usdv.claimReward")}
                    </Button>
                  </CardContent>
                </Card>

                {/* 利润跟随 */}
                <Card className="electric-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      {t("usdv.profitFollow")}
                    </CardTitle>
                    <CardDescription>
                      {t("usdv.profitFollowDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleClaimProfitFollow}
                      disabled={actionLoading.claimProfit}
                      className="w-full"
                    >
                      {actionLoading.claimProfit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {t("usdv.claimReward")} {selectedPositions.size > 0 ? `(${selectedPositions.size})` : ""}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 我的质押仓位 */}
            {data && data.positions.length > 0 && (
              <Card className="cyberpunk-card">
                <CardHeader>
                  <CardTitle>{t("usdv.myStakingPositions")}</CardTitle>
                  <CardDescription>
                    {t("usdv.selectPositionsDesc")}
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
                                {t("usdv.position")} #{posIdStr}
                              </label>
                            </div>
                            <div className="flex gap-2">
                               <Badge variant="outline">
                                 {formatPercent(position.aprBps || BigInt(0))}% APR
                               </Badge>
                              <Badge variant={position.principalWithdrawn ? "secondary" : "default"}>
                                {position.principalWithdrawn ? t("usdv.withdrawn") : t("usdv.locked")}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                             <div>
                               <div className="text-muted-foreground">{t("usdv.principal")}</div>
                               <div className="font-medium">
                                 {formatAmount(position.principal || BigInt(0))} USDT
                               </div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">{t("usdv.lockPeriod")}</div>
                               <div className="font-medium">{lockDays} {t("dashboard.days")}</div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">{t("usdv.startTime")}</div>
                               <div className="font-medium">
                                 {startDate.toLocaleDateString()}
                               </div>
                             </div>
                             <div>
                               <div className="text-muted-foreground">{t("usdv.lastClaim")}</div>
                               <div className="font-medium">
                                 {position.lastClaimTime && Number(position.lastClaimTime) > 0 
                                   ? new Date(Number(position.lastClaimTime) * 1000).toLocaleDateString()
                                   : t("usdv.neverClaimed")
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
                    {t("usdv.noPositions")} <a href={`/${t("nav.invest").toLowerCase() === 'invest' ? 'en' : 'zh'}/invest`} className="text-primary hover:underline">{t("usdv.goToInvest")}</a>
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