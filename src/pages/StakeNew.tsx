import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { WalletConnector } from "@/components/WalletConnector";
import { NetworkChecker } from "@/components/NetworkChecker";
import { StakingInterface } from "@/components/StakingInterface";
import { PositionsManager } from "@/components/PositionsManager";
import { ReferralManager } from "@/components/ReferralManager";
import { useStakingData } from "@/hooks/useStakingData";
import { useWeb3 } from "@/hooks/useWeb3";
import { Lock, Users, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InvitationLandingPage from "@/components/InvitationLandingPage";

export default function StakeNew() {
  const { account, chainId } = useWeb3();
  const { data, refreshData, formatAmount } = useStakingData();
  const [activeTab, setActiveTab] = useState("stake");
  const [showLandingPage, setShowLandingPage] = useState(false);

  const isCorrectNetwork = chainId === 56; // BSC Mainnet

  // Check if user has seen the landing page before
  useEffect(() => {
    const hasSeenLanding = localStorage.getItem('hasSeenStakeLandingPage');
    console.log('Landing page check:', { hasSeenLanding, showLandingPage });
    
    // Clear localStorage for testing - remove this line after testing
    localStorage.removeItem('hasSeenStakeLandingPage');
    
    if (!hasSeenLanding) {
      console.log('First visit detected, showing landing page');
      setShowLandingPage(true);
    } else {
      console.log('User has seen landing page before');
      setShowLandingPage(false);
    }
  }, []);

  const handleCloseLanding = () => {
    localStorage.setItem('hasSeenStakeLandingPage', 'true');
    setShowLandingPage(false);
  };

  const handleProceed = () => {
    localStorage.setItem('hasSeenStakeLandingPage', 'true');
    setShowLandingPage(false);
  };

  // Show landing page on first visit
  if (showLandingPage) {
    return (
      <InvitationLandingPage
        onClose={handleCloseLanding}
        onProceed={handleProceed}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl relative z-10">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            USDT 智能质押平台
          </h1>
          <p className="text-muted-foreground text-lg">
            安全透明的链上投资，享受稳定收益与推荐奖励
          </p>
        </div>

        {/* 网络检查 */}
        {account && <NetworkChecker />}

        {/* 用户状态概览 */}
        {account && data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">USDT 余额</p>
                  <p className="text-xl font-bold">{formatAmount(data.usdtBalance)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">质押金额</p>
                  <p className="text-xl font-bold text-accent">{formatAmount(data.totalStaked)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">待领收益</p>
                  <p className="text-xl font-bold text-primary">{formatAmount(data.totalPendingYield)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">推荐奖励</p>
                  <p className="text-xl font-bold text-yellow-500">{formatAmount(data.rewardsVaultPending)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 钱包连接提示 */}
        {!account && (
          <Card className="mb-8 p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">连接钱包开始投资</h2>
            <p className="text-muted-foreground mb-6">
              连接您的钱包以开始质押 USDT 并获得稳定收益
            </p>
            <WalletConnector />
          </Card>
        )}

        {/* 主要功能标签页 */}
        {account && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-1/2 mx-auto">
              <TabsTrigger value="stake" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                质押投资
              </TabsTrigger>
              <TabsTrigger value="positions" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                我的仓位
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                推荐奖励
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stake" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StakingInterface onSuccess={refreshData} />
                </div>
                <div className="space-y-6">
                  {/* 质押说明 */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      质押说明
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>• 最低投资金额：200 USDT</p>
                      <p>• 收益实时计算，随时可领取</p>
                      <p>• 到期后可无手续费赎回本金</p>
                      <p>• 提前赎回收取2%手续费</p>
                      <p>• 合约经过专业安全审计</p>
                    </div>
                  </Card>

                  {/* 收益率表 */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">收益率对比</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span>3个月</span>
                        <span className="font-semibold text-accent">91.25% 年化</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span>6个月</span>
                        <span className="font-semibold text-accent">146% 年化</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span>12个月</span>
                        <span className="font-semibold text-accent">365% 年化</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-6">
              <PositionsManager onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="referral" className="space-y-6">
              <ReferralManager onRefresh={refreshData} />
            </TabsContent>
          </Tabs>
        )}

        {/* 底部信息 */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            合约地址已公开透明，所有交易可在区块链浏览器中查看
          </p>
          <p className="mt-2">
            BSC 主网 • 合约经过安全审计 • 24/7 全天候运行
          </p>
        </div>
      </main>
    </div>
  );
}