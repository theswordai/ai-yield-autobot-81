import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, TrendingUp, Share2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Contract, formatUnits } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { ReferralRegistry_ABI } from "@/abis/ReferralRegistry";
import { RewardsVault_ABI } from "@/abis/RewardsVault";
import { LockStaking_ABI } from "@/abis/LockStaking";
import { REFERRAL_ADDRESS, VAULT_ADDRESS, USDT_DECIMALS, LOCK_ADDRESS } from "@/config/contracts";
import { useI18n } from "@/hooks/useI18n";
export default function Referral({
  embedded = false
}: {
  embedded?: boolean;
}) {
  const {
    toast
  } = useToast();
  const { t } = useI18n();
  const {
    account,
    provider,
    signer
  } = useWeb3();
  const registry = useMemo(() => provider ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, provider) : null, [provider]);
  const registryWrite = useMemo(() => signer ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, signer) : null, [signer]);
  const vault = useMemo(() => provider ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, provider) : null, [provider]);
  const lock = useMemo(() => provider ? new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) : null, [provider]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: "0.00",
    // pending + claimed (USDT)
    directReferrals: 0,
    indirectReferrals: 0,
    totalInviteAmount: "0.00",
    // pDirect + pIndirect1 (USDT)
    level: 0
  });
  const [tree, setTree] = useState<{
    level: 1 | 2;
    user: string;
    amount: string;
    earnings: string;
    date: string;
  }[]>([]);
  const [boundInviter, setBoundInviter] = useState<string>("0x0000000000000000000000000000000000000000");
  const [storedInviter, setStoredInviter] = useState<string | null>(() => localStorage.getItem("inviter"));
  const [binding, setBinding] = useState(false);
  const Title = (embedded ? 'h2' : 'h1') as any;
  const ZERO = "0x0000000000000000000000000000000000000000";
  const referralCode = account || "";
  const inviteLink = account ? `${window.location.origin}/invite/${account}` : `${window.location.origin}/invite/----`;

  // 邀请排行榜（合并直推与间推的贡献奖励，按金额降序，最多10条）
  const leaderboard = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of tree) {
      const addr = (r.user || '').toLowerCase();
      const val = Number(String(r.earnings || '0').replace(/,/g, ''));
      if (!addr || !Number.isFinite(val)) continue;
      map.set(addr, (map.get(addr) ?? 0) + val);
    }
    return Array.from(map.entries()).map(([user, earnings]) => ({
      user,
      earnings
    })).sort((a, b) => b.earnings - a.earnings).slice(0, 10);
  }, [tree]);
  useEffect(() => {
    const load = async () => {
      try {
        if (!account || !registry) {
          setStats(s => s);
          setTree([]);
          return;
        }
        const [directs, indirects, vaultPending, bound, pDir, pInd, levelBn] = await Promise.all([(registry as any).getDirects(account) as Promise<string[]>, (registry as any).getIndirectsL1(account) as Promise<string[]>, vault ? (vault as any).pendingRewards(account) as Promise<bigint> : Promise.resolve(0n), (registry as any).inviterOf(account) as Promise<string>, (registry as any).pDirect(account) as Promise<bigint>, (registry as any).pIndirect1(account) as Promise<bigint>, (registry as any).getLevel(account) as Promise<bigint>]);

        // Sum claimed rewards from Vault events
        let claimed: bigint = 0n;
        try {
          if (account && vault && (vault as any).filters?.Claimed) {
            const logs = await (vault as any).queryFilter((vault as any).filters.Claimed(account), 0n, "latest");
            for (const lg of logs) {
              const amt = BigInt((lg as any).args?.[1] ?? 0);
              claimed += amt;
            }
          }
        } catch {}
        const totalEarningsBn = (vaultPending ?? 0n) + claimed;
        const totalInviteAmountBn = (pDir ?? 0n) + (pInd ?? 0n);
        setStats({
          totalReferrals: directs.length + indirects.length,
          totalEarnings: Number(formatUnits(totalEarningsBn, USDT_DECIMALS)).toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          directReferrals: directs.length,
          indirectReferrals: indirects.length,
          totalInviteAmount: Number(formatUnits(totalInviteAmountBn, USDT_DECIMALS)).toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          level: Number(levelBn ?? 0n)
        });
        let list: any[] = [];
        try {
          if (lock) {
            const fromBlock: any = 0n;
            const toBlock: any = "latest";
            const [accDir, accInd] = await Promise.all([(lock as any).queryFilter((lock as any).filters.ReferralAccrued(account, null), fromBlock, toBlock), (lock as any).queryFilter((lock as any).filters.ReferralAccrued(null, account), fromBlock, toBlock)]);
            const directTx = new Map<string, bigint>();
            for (const lg of accDir as any[]) {
              const h = (lg as any).transactionHash as string;
              const r1 = BigInt((lg as any).args?.[2] ?? 0);
              directTx.set(h, (directTx.get(h) ?? 0n) + r1);
            }
            const indirectTx = new Map<string, bigint>();
            for (const lg of accInd as any[]) {
              const h = (lg as any).transactionHash as string;
              const r2 = BigInt((lg as any).args?.[3] ?? 0);
              indirectTx.set(h, (indirectTx.get(h) ?? 0n) + r2);
            }
            const toStr = (v: bigint) => Number(formatUnits(v, USDT_DECIMALS)).toLocaleString(undefined, {
              maximumFractionDigits: 2
            });
            const buildFor = async (addr: string, level: 1 | 2) => {
              let depLogs: any[] = [];
              try {
                depLogs = await (lock as any).queryFilter((lock as any).filters.Deposited(addr), fromBlock, toBlock);
              } catch {}
              let invest = 0n;
              let reward = 0n;
              for (const lg of depLogs) {
                const amt = BigInt((lg as any).args?.[2] ?? 0);
                invest += amt;
                const h = (lg as any).transactionHash as string;
                reward += level === 1 ? directTx.get(h) ?? 0n : indirectTx.get(h) ?? 0n;
              }
              return {
                level,
                user: addr,
                amount: toStr(invest),
                earnings: toStr(reward),
                date: "-"
              };
            };
            const [directList, indirectList] = await Promise.all([Promise.all(directs.map(a => buildFor(a, 1))), Promise.all(indirects.map(a => buildFor(a, 2)))]);
            list = [...directList, ...indirectList];
          } else {
            list = [...directs.map(addr => ({
              level: 1,
              user: addr,
              amount: "-",
              earnings: "-",
              date: "-"
            })), ...indirects.map(addr => ({
              level: 2,
              user: addr,
              amount: "-",
              earnings: "-",
              date: "-"
            }))];
          }
        } catch {}
        setTree(list);
        setBoundInviter((bound || ZERO).toLowerCase());
      } catch (e) {
        setTree([]);
      }
    };
    load();
  }, [account, registry, vault, lock]);
  const rewardTiers = [{
    level: t("referral.rewards.tiers.lv1.name"),
    requirement: t("referral.rewards.tiers.lv1.requirement"),
    directReward: "10%",
    indirectReward: t("referral.rewards.none"),
    description: t("referral.rewards.tiers.lv1.description"),
    icon: "🌱",
    bgColor: "bg-green-500/20 border-green-500/30"
  }, {
    level: t("referral.rewards.tiers.lv2.name"),
    requirement: t("referral.rewards.tiers.lv2.requirement"),
    directReward: "11%",
    indirectReward: "10%",
    description: t("referral.rewards.tiers.lv2.description"),
    icon: "🛡️",
    bgColor: "bg-yellow-500/20 border-yellow-500/30"
  }, {
    level: t("referral.rewards.tiers.lv3.name"),
    requirement: t("referral.rewards.tiers.lv3.requirement"),
    directReward: "12%",
    indirectReward: "10%",
    description: t("referral.rewards.tiers.lv3.description"),
    icon: "⭐",
    bgColor: "bg-blue-500/20 border-blue-500/30"
  }, {
    level: t("referral.rewards.tiers.lv4.name"),
    requirement: t("referral.rewards.tiers.lv4.requirement"),
    directReward: "13%",
    indirectReward: "10%",
    description: t("referral.rewards.tiers.lv4.description"),
    icon: "🌍",
    bgColor: "bg-purple-500/20 border-purple-500/30"
  }, {
    level: t("referral.rewards.tiers.lv5.name"),
    requirement: t("referral.rewards.tiers.lv5.requirement"),
    directReward: "15%",
    indirectReward: "10%",
    description: t("referral.rewards.tiers.lv5.description"),
    icon: "👑",
    bgColor: "bg-amber-500/20 border-amber-500/30"
  }];
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: t("referral.share.copySuccess"),
      description: t("referral.share.codeDescription")
    });
  };
  const copyReferralLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: t("referral.share.copySuccess"),
      description: t("referral.share.linkDescription")
    });
  };
  const onBind = async () => {
    try {
      if (!account || !registryWrite) throw new Error(t("referral.binding.connectWallet"));
      const inv = storedInviter?.toLowerCase();
      if (!inv || !/^0x[a-fA-F0-9]{40}$/.test(inv)) throw new Error(t("referral.binding.invalidInviter"));
      if (inv === account.toLowerCase()) throw new Error(t("referral.binding.cannotBindSelf"));
      if (boundInviter && boundInviter !== ZERO) throw new Error(t("referral.binding.alreadyBound"));
      setBinding(true);
      const tx = await (registryWrite as any).bind(inv);
      toast({
        title: t("referral.binding.bindSubmitting"),
        description: tx.hash
      });
      await tx.wait();
      toast({
        title: t("referral.binding.bindSuccess")
      });
      setBoundInviter(inv);
    } catch (e: any) {
      toast({
        title: t("referral.binding.bindFailed"),
        description: e?.shortMessage || e?.message || t("referral.binding.retryLater")
      });
    } finally {
      setBinding(false);
    }
  };
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      {!embedded && <Helmet>
          <title>{t("referral.title")} | AI量化交易</title>
          <meta name="description" content={t("referral.description")} />
          <link rel="canonical" href="/referral" />
        </Helmet>}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className={`${embedded ? 'pt-6' : 'pt-20'} pb-10 relative z-10`}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Title className="text-3xl font-bold mb-2">{t("referral.header")}</Title>
          <p className="text-muted-foreground">{t("referral.subtitle")}</p>
        </div>

        {/* Bind status */}
        <div className="mb-6">
          {boundInviter && boundInviter !== ZERO ? <div className="flex items-center justify-between p-3 border border-border rounded-md">
              <span className="text-sm">{t("referral.binding.bound")}<span className="font-mono">0x…{boundInviter.slice(-4)}</span></span>
              <span className="text-xs text-muted-foreground">{t("referral.binding.boundNote")}</span>
            </div> : <div className="flex items-center justify-between p-3 border border-dashed rounded-md">
              <span className="text-sm">
                {storedInviter ? <>
                  {t("referral.binding.detected")}<span className="font-mono">0x…{storedInviter.slice(-4)}</span>
                </> : t("referral.binding.notDetected")}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={!storedInviter || binding} onClick={onBind}>{t("referral.binding.bindButton")}</Button>
              </div>
            </div>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t("referral.stats.totalReferrals")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent" />
                {t("referral.stats.totalEarnings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${stats.totalEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("referral.stats.directReferrals")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.directReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("referral.stats.indirectReferrals")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indirectReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("referral.stats.totalInviteAmount")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalInviteAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("referral.stats.currentLevel")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">L{stats.level}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Code & Link */}
          

          {/* Reward Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t("referral.rewards.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewardTiers.map((tier, index) => <div key={index} className={`p-4 border rounded-lg hover:bg-muted/20 transition-colors ${tier.bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {tier.icon}
                      </div>
                      <div>
                        <div className="font-semibold">{tier.level}</div>
                        <div className="text-sm text-muted-foreground">{tier.requirement}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">{t("referral.rewards.directReward")}</div>
                      <div className="font-bold text-accent">{tier.directReward}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">{t("referral.rewards.indirectReward")}</div>
                      <div className="font-bold text-primary">{tier.indirectReward}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{tier.description}</div>
                </div>)}
              
              <div className="bg-muted/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">{t("referral.rewards.explanation.title")}</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("referral.rewards.explanation.totalStake")}</li>
                  <li>• {t("referral.rewards.explanation.directDesc")}</li>
                  <li>• {t("referral.rewards.explanation.indirectDesc")}</li>
                  <li>• {t("referral.rewards.explanation.higherLevel")}</li>
                  <li>• {t("referral.rewards.explanation.realTime")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 邀请排行榜 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                {t("referral.leaderboard.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? <div className="text-sm text-muted-foreground">{t("referral.leaderboard.noData")}</div> : <ol className="space-y-2">
                  {leaderboard.map((it, idx) => <li key={it.user} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-xs font-semibold">{idx + 1}</div>
                        <span className="font-mono text-sm">{"0x..." + it.user.slice(-4)}</span>
                      </div>
                      <div className="text-sm font-bold text-accent">+${it.earnings.toLocaleString(undefined, {
                      maximumFractionDigits: 2
                    })}</div>
                    </li>)}
                </ol>}
            </CardContent>
          </Card>

        </div>

        {/* Referral Tree */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("referral.tree.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tree.map((ref, index) => <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge variant={ref.level === 1 ? "default" : "secondary"}>
                      {t("referral.tree.level", { level: ref.level })}
                    </Badge>
                    <span className="font-mono text-sm">{ref.user}</span>
                    <span className="text-sm text-muted-foreground">{ref.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{t("referral.tree.investment", { amount: ref.amount })}</span>
                    <span className="text-accent">{t("referral.tree.earnings", { amount: ref.earnings })}</span>
                  </div>
                </div>)}
            </div>
            
            {tree.length === 0 && <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("referral.tree.noData")}</p>
                <p className="text-sm">{t("referral.share.subtitle")}</p>
              </div>}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>;
}