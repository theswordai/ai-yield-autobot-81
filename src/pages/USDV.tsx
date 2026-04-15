import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useUSDVData } from "@/hooks/useUSDVData";
import { useUSDVActions } from "@/hooks/useUSDVActions";
import { Navbar } from "@/components/Navbar";
import { PageWrapper } from "@/components/PageWrapper";
import { WalletConnector } from "@/components/WalletConnector";
import { SpinWheel } from "@/components/SpinWheel";
import { DexSwap } from "@/components/DexSwap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, Wallet, Gift, TrendingUp, Target, Dice1, Copy, Coins, ArrowDownUp,
  LayoutDashboard, PiggyBank, ScrollText, ChevronLeft, ChevronRight, Shield
} from "lucide-react";
import { USDV_ADDRESS } from "@/config/contracts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SidebarSection = "dashboard" | "assets" | "yield" | "dex" | "positions" | "spin";

const sidebarItems: { id: SidebarSection; labelZh: string; labelEn: string; icon: React.ElementType }[] = [
  { id: "dashboard", labelZh: "总览", labelEn: "Dashboard", icon: LayoutDashboard },
  { id: "assets", labelZh: "资产", labelEn: "Assets", icon: Wallet },
  { id: "yield", labelZh: "收益", labelEn: "Yield", icon: TrendingUp },
  { id: "dex", labelZh: "兑换", labelEn: "Swap", icon: ArrowDownUp },
  { id: "positions", labelZh: "仓位", labelEn: "Positions", icon: ScrollText },
  { id: "spin", labelZh: "抽奖", labelEn: "Spin", icon: Dice1 },
];

export default function USDV() {
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  const { data, loading, formatAmount, formatPercent, refreshData } = useUSDVData();
  const { loading: actionLoading, claimStakeUSDV, claimProfitFollow, claimNewcomer, spin } = useUSDVActions();
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<SidebarSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "dex") {
      setActiveSection("dex");
    }
  }, [searchParams]);

  // 移动端默认收起侧边栏
  useEffect(() => {
    const checkWidth = () => setSidebarOpen(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const handlePositionSelect = (posId: string, checked: boolean) => {
    const newSelected = new Set(selectedPositions);
    if (checked) newSelected.add(posId);
    else newSelected.delete(posId);
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
      case "no investment": return t("usdv.spinStatus.noInvestment");
      case "cooldown": return t("usdv.spinStatus.cooldown");
      case "daily cap reached": return t("usdv.spinStatus.dailyCapReached");
      default: return data.canSpin.reason;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection t={t} />;
      case "assets":
        return <AssetsSection data={data} loading={loading} formatAmount={formatAmount} t={t} />;
      case "yield":
        return (
          <YieldSection
            data={data}
            loading={loading}
            actionLoading={actionLoading}
            handleAction={handleAction}
            claimStakeUSDV={claimStakeUSDV}
            claimNewcomer={claimNewcomer}
            handleClaimProfitFollow={handleClaimProfitFollow}
            selectedPositions={selectedPositions}
            t={t}
          />
        );
      case "dex":
        return (
          <div className="space-y-6">
            <WalletConnector />
            <DexSwap />
          </div>
        );
      case "positions":
        return (
          <PositionsSection
            data={data}
            loading={loading}
            formatAmount={formatAmount}
            formatPercent={formatPercent}
            selectedPositions={selectedPositions}
            handlePositionSelect={handlePositionSelect}
            t={t}
            language={language}
          />
        );
      case "spin":
        return (
          <SpinSection
            data={data}
            loading={loading}
            actionLoading={actionLoading}
            spin={spin}
            getSpinStatusText={getSpinStatusText}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageWrapper className="overflow-x-hidden">
      <Helmet>
        <title>{t("usdv.pageTitle")}</title>
        <meta name="description" content={t("usdv.pageDescription")} />
      </Helmet>

      <Navbar />

      <div className="pt-16 min-h-screen flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-card/95 backdrop-blur-xl border-r border-border transition-all duration-300 flex flex-col",
            sidebarOpen ? "w-56" : "w-14"
          )}
        >
          {/* Toggle Button - prominent */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-4 top-6 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-110 transition-transform border-2 border-background"
            aria-label={sidebarOpen ? "收起侧栏" : "展开侧栏"}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Sidebar Header */}
          <div className={cn("px-4 py-5 border-b border-border", !sidebarOpen && "px-2 py-5")}>
            {sidebarOpen ? (
              <h2 className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wider">
                USDV {language === "zh" ? "控制台" : "Console"}
              </h2>
            ) : (
              <Coins className="w-5 h-5 mx-auto text-primary" />
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    // 移动端点击后自动收起
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    !sidebarOpen && "justify-center px-0"
                  )}
                  title={!sidebarOpen ? (language === "zh" ? item.labelZh : item.labelEn) : undefined}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
                  {sidebarOpen && (
                    <span>{language === "zh" ? item.labelZh : item.labelEn}</span>
                  )}
                  {active && sidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>BSC Mainnet</span>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 min-w-0 transition-all duration-300",
            sidebarOpen ? "md:ml-0 ml-0" : "ml-0"
          )}
        >
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Section Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {sidebarItems.find(i => i.id === activeSection)?.[language === "zh" ? "labelZh" : "labelEn"]}
              </h1>
              <p className="text-muted-foreground mt-1">{t("usdv.subheader")}</p>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}

/* ═══════════════════════════ Sub-sections ═══════════════════════════ */

function DashboardSection({ t }: { t: (key: string) => string }) {
  return (
    <Card className="hologram">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("bluePoints.title")}
          </h2>
          <p className="text-lg font-medium text-foreground">
            {t("bluePoints.subtitle")}
          </p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary">{t("bluePoints.positioning")}</h3>
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
            <h3 className="text-xl font-semibold mb-3 text-primary">{t("bluePoints.features")}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Badge variant="outline">{t("bluePoints.wealthCertificate")}</Badge>
                <p className="text-sm text-muted-foreground">{t("bluePoints.wealthDesc")}</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">{t("bluePoints.charitySymbol")}</Badge>
                <p className="text-sm text-muted-foreground">{t("bluePoints.charityDesc")}</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">{t("bluePoints.honorSymbol")}</Badge>
                <p className="text-sm text-muted-foreground">{t("bluePoints.honorDesc")}</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">{t("bluePoints.globalResonance")}</Badge>
                <p className="text-sm text-muted-foreground">{t("bluePoints.globalDesc")}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary">{t("bluePoints.vision")}</h3>
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
            <div className="inline-block px-6 py-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-lg font-medium text-primary">
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
  );
}

function AssetsSection({ data, loading, formatAmount, t }: any) {
  return (
    <div className="space-y-6">
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
        <Card className="cyberpunk-card data-stream">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
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
      )}
    </div>
  );
}

function YieldSection({ data, loading, actionLoading, handleAction, claimStakeUSDV, claimNewcomer, handleClaimProfitFollow, selectedPositions, t }: any) {
  return (
    <div className="space-y-6">
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
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                {t("usdv.dailyInterest")}
              </CardTitle>
              <CardDescription>{t("usdv.dailyInterestDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleAction(claimStakeUSDV)} disabled={actionLoading.claimStake} className="w-full">
                {actionLoading.claimStake && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("usdv.claimReward")}
              </Button>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-400" />
                {t("usdv.newcomerReward")}
              </CardTitle>
              <CardDescription>{t("usdv.newcomerRewardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleAction(claimNewcomer)} disabled={data.hasJoined || actionLoading.claimNewcomer} className="w-full">
                {actionLoading.claimNewcomer && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {data.hasJoined ? t("usdv.claimed") : t("usdv.claimReward")}
              </Button>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                {t("usdv.profitFollow")}
              </CardTitle>
              <CardDescription>{t("usdv.profitFollowDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleClaimProfitFollow} disabled={actionLoading.claimProfit} className="w-full">
                {actionLoading.claimProfit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("usdv.claimReward")} {selectedPositions.size > 0 ? `(${selectedPositions.size})` : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function PositionsSection({ data, loading, formatAmount, formatPercent, selectedPositions, handlePositionSelect, t, language }: any) {
  return (
    <div className="space-y-6">
      <WalletConnector />
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t("common.loading")}</span>
          </CardContent>
        </Card>
      )}
      {data && data.positions.length > 0 && (
        <Card className="cyberpunk-card">
          <CardHeader>
            <CardTitle>{t("usdv.myStakingPositions")}</CardTitle>
            <CardDescription>{t("usdv.selectPositionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.positions.map((position: any) => {
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
                          onCheckedChange={(checked) => handlePositionSelect(posIdStr, checked as boolean)}
                        />
                        <label htmlFor={`position-${posIdStr}`} className="text-sm font-medium cursor-pointer">
                          {t("usdv.position")} #{posIdStr}
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{formatPercent(position.aprBps || BigInt(0))}% APR</Badge>
                        <Badge variant={position.principalWithdrawn ? "secondary" : "default"}>
                          {position.principalWithdrawn ? t("usdv.withdrawn") : t("usdv.locked")}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">{t("usdv.principal")}</div>
                        <div className="font-medium">{formatAmount(position.principal || BigInt(0))} USDT</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("usdv.lockPeriod")}</div>
                        <div className="font-medium">{lockDays} {t("dashboard.days")}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("usdv.startTime")}</div>
                        <div className="font-medium">{startDate.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("usdv.lastClaim")}</div>
                        <div className="font-medium">
                          {position.lastClaimTime && Number(position.lastClaimTime) > 0
                            ? new Date(Number(position.lastClaimTime) * 1000).toLocaleDateString()
                            : t("usdv.neverClaimed")}
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
              {t("usdv.noPositions")}{" "}
              <a href={`/${language === "en" ? "en" : "zh"}/invest`} className="text-primary hover:underline">
                {t("usdv.goToInvest")}
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SpinSection({ data, loading, actionLoading, spin, getSpinStatusText, t }: any) {
  return (
    <div className="space-y-6">
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
        <Card className="cyberpunk-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5 text-primary" />
              {t("usdv.dailySpin")}
            </CardTitle>
            <CardDescription>{t("usdv.dailySpinDesc")}</CardDescription>
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
      )}
    </div>
  );
}
