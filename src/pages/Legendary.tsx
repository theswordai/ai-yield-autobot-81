import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, LayoutDashboard, Wallet, ListChecks, Users, Gift } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { DashboardTab } from "@/components/legendary/DashboardTab";
import { DepositTab } from "@/components/legendary/DepositTab";
import { PositionsTab } from "@/components/legendary/PositionsTab";
import { ReferralTab } from "@/components/legendary/ReferralTab";
import { RewardsTab } from "@/components/legendary/RewardsTab";
import { useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useWeb3 } from "@/hooks/useWeb3";


export default function Legendary() {
  const [tab, setTab] = useState("dashboard");
  const { account } = useWeb3();
  const { data } = useLegendaryDashboard();

  return (
    <PageWrapper>
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-32 md:pb-12 max-w-6xl">

        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-yellow-600/30 backdrop-blur-xl border border-amber-400/40 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              传奇锁仓 Legendary Staking
            </h1>
            <p className="text-sm text-muted-foreground">
              BSC 链上 365 天锁仓 · 一池 APR 260% 起 · 二池复投 APR 360%
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1 h-auto bg-white/5 backdrop-blur-xl border border-white/10 p-1">
            <TabsTrigger value="dashboard" className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
              <LayoutDashboard className="w-4 h-4" /> 看板
            </TabsTrigger>
            <TabsTrigger value="deposit" className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
              <Wallet className="w-4 h-4" /> 一池存款
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
              <ListChecks className="w-4 h-4" /> 我的仓位
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
              <Users className="w-4 h-4" /> 邀请团队
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
              <Gift className="w-4 h-4" /> 奖励
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab onGoto={setTab} />
          </TabsContent>
          <TabsContent value="deposit" className="mt-6">
            <DepositTab onDone={() => setTab("positions")} />
          </TabsContent>
          <TabsContent value="positions" className="mt-6">
            <PositionsTab />
          </TabsContent>
          <TabsContent value="referral" className="mt-6">
            <ReferralTab />
          </TabsContent>
          <TabsContent value="rewards" className="mt-6">
            <RewardsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
