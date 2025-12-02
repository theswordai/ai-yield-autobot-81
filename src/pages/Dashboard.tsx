import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Users, Gift, Lock, Unlock, ExternalLink, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Contract, formatUnits } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import { LockStaking_ABI } from "@/abis/LockStaking";
import { RewardsVault_ABI } from "@/abis/RewardsVault";
import { ReferralRegistry_ABI } from "@/abis/ReferralRegistry";
import { USDT_ADDRESS, LOCK_ADDRESS, VAULT_ADDRESS, REFERRAL_ADDRESS, USDT_DECIMALS } from "@/config/contracts";
import { useI18n } from "@/hooks/useI18n";
export default function Dashboard({
  embedded = false
}: {
  embedded?: boolean;
}) {
  const {
    account,
    provider
  } = useWeb3();
  const {
    t
  } = useI18n();
  const [stats, setStats] = useState({
    totalBalance: "0.00",
    dailyEarnings: "0.00",
    totalEarnings: "0.00",
    referralCount: 0,
    referralEarnings: "0.00"
  });
  const [stakingPositions, setStakingPositions] = useState<{
    amount: string;
    period: string;
    apy: string;
    status: 'active' | 'completed';
    remaining: number;
  }[]>([]);
  const [earn, setEarn] = useState({
    stakingPending: 0,
    referralPending: 0
  });
  const usdt = useMemo(() => provider ? new Contract(USDT_ADDRESS, MockUSDT_ABI, provider) : null, [provider]);
  const lock = useMemo(() => provider ? new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) : null, [provider]);
  const vault = useMemo(() => provider ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, provider) : null, [provider]);
  const registry = useMemo(() => provider ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, provider) : null, [provider]);
  useEffect(() => {
    const load = async () => {
      try {
        if (!account || !usdt || !lock) {
          setStakingPositions([]);
          return;
        }

        // Add mock data for special addresses
        const specialAddress1 = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";
        const specialAddress2 = "0x20E916206A2903A4993F639a9D073aE910B15D7c";
        if (account.toLowerCase() === specialAddress1.toLowerCase()) {
          setStats({
            totalBalance: "3,000.00",
            dailyEarnings: "84.00",
            totalEarnings: "631.00",
            referralCount: 1,
            referralEarnings: "4,050.00"
          });
          setStakingPositions([{
            amount: "3,000",
            period: "1年",
            apy: "280%",
            status: 'active',
            remaining: 335
          }]);
          setEarn({
            stakingPending: 84,
            referralPending: 4050
          });
          return;
        }
        if (account.toLowerCase() === specialAddress2.toLowerCase()) {
          setStats({
            totalBalance: "27,000.00",
            dailyEarnings: "480.00",
            totalEarnings: "4,221.00",
            referralCount: 0,
            referralEarnings: "0.00"
          });
          setStakingPositions([{
            amount: "27,000",
            period: "1年",
            apy: "280%",
            status: 'active',
            remaining: 335
          }]);
          setEarn({
            stakingPending: 480,
            referralPending: 0
          });
          return;
        }
        const [bal, ids, vaultPend, directs] = await Promise.all([(usdt as any).balanceOf(account) as Promise<bigint>, (lock as any).getUserPositions(account) as Promise<bigint[]>, vault ? (vault as any).pendingRewards(account) as Promise<bigint> : Promise.resolve(0n), registry ? (registry as any).getDirects(account) as Promise<string[]> : Promise.resolve([])]);
        const posDetails = await Promise.all(ids.map(async id => {
          const p = await (lock as any).positions(id);
          const pending = await (lock as any).pendingYield(id);
          const principal = p.principal as bigint;
          const aprBps = p.aprBps as bigint;
          const lockDuration = Number(p.lockDuration);
          const startTime = Number(p.startTime);
          const endTime = startTime + lockDuration;
          const now = Math.floor(Date.now() / 1000);
          const remainingDays = Math.max(0, Math.ceil((endTime - now) / 86400));
          const status = p.principalWithdrawn ? 'completed' : 'active';
          const period = lockDuration >= 31536000 ? '1年' : lockDuration >= 15552000 ? '6个月' : '3个月';
          const apyStr = `${Number(aprBps) / 100}%`;
          return {
            amount: Number(formatUnits(principal, USDT_DECIMALS)).toLocaleString(),
            period,
            apy: apyStr,
            status,
            remaining: remainingDays,
            pending,
            principal
          } as any;
        }));
        const sumPrincipal = posDetails.reduce((acc: bigint, x: any) => acc + (x.principal as bigint), 0n);
        const sumPending = posDetails.reduce((acc: bigint, x: any) => acc + (x.pending as bigint), 0n);
        setStakingPositions(posDetails.map(({
          amount,
          period,
          apy,
          status,
          remaining
        }) => ({
          amount,
          period,
          apy,
          status,
          remaining
        })));
        const totalBalanceNum = Number(formatUnits(bal + sumPrincipal, USDT_DECIMALS));
        const dailyEarningsNum = Number(formatUnits(sumPending, USDT_DECIMALS));
        const vaultPendingNum = Number(formatUnits(vaultPend, USDT_DECIMALS));
        setStats({
          totalBalance: totalBalanceNum.toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          dailyEarnings: dailyEarningsNum.toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          totalEarnings: vaultPendingNum.toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          referralCount: directs.length,
          referralEarnings: vaultPendingNum.toLocaleString(undefined, {
            maximumFractionDigits: 2
          })
        });
        setEarn({
          stakingPending: dailyEarningsNum,
          referralPending: vaultPendingNum
        });
      } catch (e) {
        setStakingPositions([]);
      }
    };
    load();
  }, [account, usdt, lock, vault, registry]);
  const Title = (embedded ? 'h2' : 'h1') as any;
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className={`${embedded ? 'pt-6' : 'pt-20'} pb-10 relative z-10`}>
      <div className="container mx-auto px-4">
        <div className="mb-4 sm:mb-8">
          <Title className="text-2xl sm:text-3xl font-bold mb-2">{t("dashboard.title")}</Title>
          
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                {t("dashboard.totalAssets")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base sm:text-2xl font-bold">${stats.totalBalance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                {t("dashboard.dailyEarnings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base sm:text-2xl font-bold text-accent">+${stats.dailyEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard.totalEarnings")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base sm:text-2xl font-bold text-primary">${stats.totalEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                {t("dashboard.referralCount")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base sm:text-2xl font-bold">{stats.referralCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                {t("dashboard.referralEarnings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base sm:text-2xl font-bold text-accent">${stats.referralEarnings}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Staking Positions */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">{t("dashboard.myStaking")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {stakingPositions.map((position, index) => <div key={index} className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      {position.status === 'active' ? <Lock className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" /> : <Unlock className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold">${position.amount}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{position.period} • {position.apy}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={position.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {position.status === 'active' ? `${position.remaining}${t("dashboard.days")}` : t("dashboard.completed")}
                    </Badge>
                  </div>
                </div>)}
              <Button className="w-full h-9 sm:h-10 text-sm sm:text-base bg-gradient-primary">
                {t("dashboard.newStaking")}
              </Button>
            </CardContent>
          </Card>

          {/* USDONLINE Compliance Staking */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                合规&质押
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs sm:text-sm font-mono text-foreground break-all">
                0x3F6e613BE21c733CB6f67D1D024634F8d7F1e4Bb
              </code>
            </CardContent>
          </Card>

          {/* USDONLINE Reserve Staking */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">储备&质押<Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                USDONLINE储备质押地址
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs sm:text-sm font-mono text-foreground break-all">
                0xba99D0A2016F43dA2c8AeB581b6076C8b487401A
              </code>
            </CardContent>
          </Card>
        </div>

        {/* Actions or Earnings Detail */}
        {embedded ? <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t("dashboard.earningsDetail")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t("dashboard.stakingRewards")}</div>
                  <div className="text-sm text-muted-foreground">{t("dashboard.pendingAmount")}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-accent">${earn.stakingPending.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}</div>
                  <Badge variant={earn.stakingPending > 0 ? "default" : "secondary"}>
                    {earn.stakingPending > 0 ? t("dashboard.pending") : t("dashboard.claimed")}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t("dashboard.referralRewards")}</div>
                  <div className="text-sm text-muted-foreground">{t("dashboard.pendingAmount")}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">${earn.referralPending.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}</div>
                  <Badge variant={earn.referralPending > 0 ? "default" : "secondary"}>
                    {earn.referralPending > 0 ? t("dashboard.pending") : t("dashboard.claimed")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Button size="lg" className="bg-gradient-primary">
              <Wallet className="w-5 h-5 mr-2" />
              {t("dashboard.connectWallet")}
            </Button>
            <Button size="lg" variant="outline">
              <TrendingUp className="w-5 h-5 mr-2" />
              {t("dashboard.viewEarnings")}
            </Button>
            <Button size="lg" variant="outline">
              <Users className="w-5 h-5 mr-2" />
              {t("dashboard.inviteFriends")}
            </Button>
          </div>}
      </div>
      </div>
    </div>;
}