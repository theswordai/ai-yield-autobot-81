import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Wallet, ListChecks, Users, Gift, Layers, Sparkles, ShieldCheck } from "lucide-react";
import goldBarsLogo from "@/assets/gold-bars-logo.png";
import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepositTab } from "@/components/legendary/DepositTab";
import { PositionsTab } from "@/components/legendary/PositionsTab";
import { Pool2Tab } from "@/components/legendary/Pool2Tab";
import { ReferralTab } from "@/components/legendary/ReferralTab";
import { RewardsTab } from "@/components/legendary/RewardsTab";
import { useLegendaryDashboard, fmt, fmtAllowance } from "@/hooks/useLegendary";
import { LegendaryDashboardProvider } from "@/hooks/LegendaryDashboardProvider";
import { useWeb3 } from "@/hooks/useWeb3";


export default function Legendary() {
  return (
    <LegendaryDashboardProvider>
      <LegendaryPageContent />
    </LegendaryDashboardProvider>
  );
}

function LegendaryPageContent() {
  const [tab, setTab] = useState("deposit");
  const { account } = useWeb3();
  const { data } = useLegendaryDashboard();

  return (
    <PageWrapper>
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-32 md:pb-12 max-w-6xl">
        {/* === Hero header === */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent backdrop-blur-xl p-5 sm:p-6 animate-fade-in">
          {/* decorative glows */}
          <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-yellow-600/10 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0">
              <span className="absolute inset-0 rounded-2xl bg-amber-400/40 blur-xl animate-pulse" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-300/30 to-yellow-600/20 border border-amber-200/60 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(251,191,36,0.6)]">
                <img src={goldBarsLogo} alt="增值资本" width={512} height={512} loading="lazy" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-500 bg-clip-text text-transparent">
                  增值资本
                </h1>
                <span className="text-xs sm:text-sm font-semibold text-amber-700/90 dark:text-amber-700 dark:text-amber-300/80 tracking-[0.2em] uppercase">
                  Legendary Staking
                </span>
                <Badge
                  variant="outline"
                  className="border-amber-400/40 text-amber-700 dark:text-amber-300 bg-amber-400/10 ml-auto sm:ml-2"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> BSC · 365D
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {account && (
          <Card className="mb-6 relative overflow-hidden p-3 sm:p-4 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border-foreground/15 animate-fade-in">
            <div className="pointer-events-none absolute -top-16 right-0 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 border border-amber-400/30 items-center justify-center">
                  <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </span>
                <div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">USDT 余额</p>
                  <p className="text-sm sm:text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-700 dark:from-amber-200 dark:to-yellow-400 bg-clip-text text-transparent">
                    {fmt(data.usdtBalance)} <span className="text-[10px] text-muted-foreground font-medium">USDT</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-600/10 border border-emerald-400/30 items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">已授权额度</p>
                  <p className="text-sm sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-200 dark:to-teal-400 bg-clip-text text-transparent">
                    {fmtAllowance(data.allowance)} <span className="text-[10px] text-muted-foreground font-medium">USDT</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1 h-auto bg-foreground/5 backdrop-blur-xl border border-foreground/15 p-1 rounded-xl">
            {[
              { v: "deposit", icon: Wallet, label: "CLASS-A" },
              { v: "positions", icon: ListChecks, label: "我的仓位" },
              { v: "pool2", icon: Layers, label: "CLASS-B" },
              { v: "referral", icon: Users, label: "邀请团队" },
              { v: "rewards", icon: Gift, label: "佣金与分红" },
            ].map(({ v, icon: Icon, label }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="flex flex-col md:flex-row gap-1 py-2 text-xs md:text-sm rounded-lg transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-background data-[state=active]:shadow-[0_6px_20px_-6px_rgba(251,191,36,0.5)] data-[state=active]:font-semibold"
              >
                <Icon className="w-4 h-4" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="deposit"
            forceMount
            className="mt-6 animate-fade-in data-[state=inactive]:hidden"
          >
            <DepositTab onDone={() => setTab("positions")} />
          </TabsContent>
          <TabsContent
            value="positions"
            forceMount
            className="mt-6 animate-fade-in data-[state=inactive]:hidden"
          >
            <PositionsTab onSwitchToPool2={() => setTab("pool2")} />
          </TabsContent>
          <TabsContent
            value="pool2"
            forceMount
            className="mt-6 animate-fade-in data-[state=inactive]:hidden"
          >
            <Pool2Tab />
          </TabsContent>
          <TabsContent
            value="referral"
            forceMount
            className="mt-6 animate-fade-in data-[state=inactive]:hidden"
          >
            <ReferralTab />
          </TabsContent>
          <TabsContent
            value="rewards"
            forceMount
            className="mt-6 animate-fade-in data-[state=inactive]:hidden"
          >
            <RewardsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

function Pill({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "amber" | "emerald" | "primary";
}) {
  const map = {
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    primary: "border-primary/30 bg-primary/10 text-primary",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${map[tone]}`}
    >
      {icon}
      <span className="opacity-80">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
