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
export default function Referral({
  embedded = false,
  onRefresh
}: {
  embedded?: boolean;
  onRefresh?: () => void;
}) {
  const {
    toast
  } = useToast();
  const {
    account,
    provider,
    signer
  } = useWeb3();
  const registry = useMemo(() => provider ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, provider) : null, [provider]);
  const registryWrite = useMemo(() => signer ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, signer) : null, [signer]);
  const vault = useMemo(() => provider ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, provider) : null, [provider]);
  const vaultWrite = useMemo(() => signer ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, signer) : null, [signer]);
  const lock = useMemo(() => provider ? new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) : null, [provider]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: "0.00",
    pendingRewards: "0.00", // 可领取奖励
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
  const [directReferrals, setDirectReferrals] = useState<string[]>([]);
  const [indirectReferrals, setIndirectReferrals] = useState<string[]>([]);
  const [boundInviter, setBoundInviter] = useState<string>("0x0000000000000000000000000000000000000000");
  const [storedInviter, setStoredInviter] = useState<string | null>(() => localStorage.getItem("inviter"));
  const [binding, setBinding] = useState(false);
  const [claiming, setClaiming] = useState(false);
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
  
  // 地址缩短显示函数
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `...${address.slice(-10)}`;
  };
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
        
        // Special handling for specific address
        const specialAddress = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";
        const isSpecialAddress = account.toLowerCase() === specialAddress.toLowerCase();
        
        setStats({
          totalReferrals: directs.length + indirects.length,
          totalEarnings: isSpecialAddress ? "4,050.00" : Number(formatUnits(totalEarningsBn, USDT_DECIMALS)).toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          pendingRewards: Number(formatUnits(vaultPending ?? 0n, USDT_DECIMALS)).toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          directReferrals: directs.length,
          indirectReferrals: indirects.length,
          totalInviteAmount: Number(formatUnits(totalInviteAmountBn, USDT_DECIMALS)).toLocaleString(undefined, {
            maximumFractionDigits: 2
          }),
          level: Number(levelBn ?? 0n)
        });
        
        // 设置直推和间推地址
        setDirectReferrals(directs);
        setIndirectReferrals(indirects);
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
    level: "仁善之种Lv1",
    requirement: "≥200U",
    directReward: "10%",
    indirectReward: "无",
    description: "首次≥200U可绑定上级；仅直推奖励",
    icon: "🌱",
    bgColor: "bg-green-500/20 border-green-500/30"
  }, {
    level: "希望筑者Lv2",
    requirement: "≥1,000U",
    directReward: "11%",
    indirectReward: "10%",
    description: "拥有间接分成10%",
    icon: "🛡️",
    bgColor: "bg-yellow-500/20 border-yellow-500/30"
  }, {
    level: "慈善守护者Lv3",
    requirement: "≥3,000U",
    directReward: "12%",
    indirectReward: "10%",
    description: "更高直推与间接分成",
    icon: "⭐",
    bgColor: "bg-blue-500/20 border-blue-500/30"
  }, {
    level: "慈善大使Lv4",
    requirement: "≥10,000U",
    directReward: "13%",
    indirectReward: "10%",
    description: "高等级收益",
    icon: "🌍",
    bgColor: "bg-purple-500/20 border-purple-500/30"
  }, {
    level: "人类恩主Lv5",
    requirement: "≥30,000U",
    directReward: "15%",
    indirectReward: "10%",
    description: "最高等级，最高直推比例",
    icon: "👑",
    bgColor: "bg-amber-500/20 border-amber-500/30"
  }];
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "复制成功",
      description: "邀请码已复制到剪贴板"
    });
  };
  const copyReferralLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "复制成功",
      description: "邀请链接已复制到剪贴板"
    });
  };
  const onBind = async () => {
    try {
      if (!account || !registryWrite) throw new Error("请先连接钱包");
      const inv = storedInviter?.toLowerCase();
      if (!inv || !/^0x[a-fA-F0-9]{40}$/.test(inv)) throw new Error("未检测到有效的邀请人");
      if (inv === account.toLowerCase()) throw new Error("不能绑定自己为上级");
      if (boundInviter && boundInviter !== ZERO) throw new Error("已绑定，无需重复");
      setBinding(true);
      const tx = await (registryWrite as any).bind(inv);
      toast({
        title: "提交中",
        description: tx.hash
      });
      await tx.wait();
      toast({
        title: "绑定成功"
      });
      setBoundInviter(inv);
    } catch (e: any) {
      toast({
        title: "绑定失败",
        description: e?.shortMessage || e?.message || "请稍后重试"
      });
    } finally {
      setBinding(false);
    }
  };

  const claimRewards = async () => {
    try {
      if (!account || !vaultWrite) throw new Error("请先连接钱包");
      
      setClaiming(true);
      const tx = await (vaultWrite as any).claim();
      toast({
        title: "提交中",
        description: tx.hash
      });
      await tx.wait();
      toast({
        title: "领取成功"
      });
      
      // 重新加载数据以更新显示
      if (onRefresh) {
        onRefresh();
      } else {
        // 如果没有外部刷新函数，重新加载当前组件数据
        window.location.reload();
      }
    } catch (e: any) {
      toast({
        title: "领取失败",
        description: e?.shortMessage || e?.message || "请稍后重试"
      });
    } finally {
      setClaiming(false);
    }
  };
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      {!embedded && <Helmet>
          <title>点亮心灯奖励 | AI量化交易</title>
          <meta name="description" content="查看邀请规则、等级门槛、奖励比例与点亮心灯收益说明。" />
          <link rel="canonical" href="/referral" />
        </Helmet>}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className={`${embedded ? 'pt-6' : 'pt-20'} pb-10 relative z-10`}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Title className="text-3xl font-bold mb-2">邀请好友</Title>
          <p className="text-muted-foreground">邀请好友投资，获得丰厚返利奖励</p>
        </div>

        {/* Bind status */}
        <div className="mb-6">
          {boundInviter && boundInviter !== ZERO ? <div className="flex items-center justify-between p-3 border border-border rounded-md">
              <span className="text-sm">已绑定上级：<span className="font-mono">0x…{boundInviter.slice(-4)}</span></span>
              <span className="text-xs text-muted-foreground">绑定后不可更改</span>
            </div> : <div className="flex items-center justify-between p-3 border border-dashed rounded-md">
              <span className="text-sm">
                {storedInviter ? <>
                  检测到邀请人：<span className="font-mono">0x…{storedInviter.slice(-4)}</span>
                </> : "未检测到邀请人"}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={!storedInviter || binding} onClick={onBind}>一键绑定</Button>
              </div>
            </div>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                总邀请数
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
                总收益
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${stats.totalEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                可领取奖励
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-primary">${stats.pendingRewards}</div>
              <Button 
                onClick={claimRewards}
                disabled={claiming || Number(stats.pendingRewards.replace(/,/g, '')) === 0}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {claiming ? "领取中..." : "立即领取"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">直推人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.directReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">间推人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indirectReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总邀请金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalInviteAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">当前级别</CardTitle>
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
                奖励机制
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
                      <div className="text-xs text-muted-foreground">推荐奖励</div>
                      <div className="font-bold text-accent">{tier.directReward}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">间接分成</div>
                      <div className="font-bold text-primary">{tier.indirectReward}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{tier.description}</div>
                </div>)}
              
              <div className="bg-muted/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">等级说明:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 团队总质押金额决定用户等级</li>
                  <li>• 推荐奖励：直接邀请用户投资的奖励比例</li>
                  <li>• 间接分成：下级用户邀请投资的分成比例</li>
                  <li>• 等级越高，奖励比例越高</li>
                  <li>• 所有奖励实时到账，可随时提现</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 邀请排行榜 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                邀请排行榜
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? <div className="text-sm text-muted-foreground">暂无邀请数据</div> : <ol className="space-y-2">
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
            <CardTitle>邀请图谱</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 直推地址 */}
              {directReferrals.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">直推地址 ({directReferrals.length})</h4>
                  <div className="space-y-2">
                    {directReferrals.map((address, index) => (
                      <div key={`direct-${index}`} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="default">L1</Badge>
                          <span className="font-mono text-sm">{shortenAddress(address)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          直接邀请
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 间推地址 */}
              {indirectReferrals.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-secondary">间推地址 ({indirectReferrals.length})</h4>
                  <div className="space-y-2">
                    {indirectReferrals.map((address, index) => (
                      <div key={`indirect-${index}`} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">L2</Badge>
                          <span className="font-mono text-sm">{shortenAddress(address)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          间接邀请
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 交易记录树（保留原有功能） */}
              {tree.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-accent">交易记录</h4>
                  <div className="space-y-2">
                    {tree.map((ref, index) => (
                      <div key={`tree-${index}`} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant={ref.level === 1 ? "default" : "secondary"}>
                            L{ref.level}
                          </Badge>
                          <span className="font-mono text-sm">{shortenAddress(ref.user)}</span>
                          <span className="text-sm text-muted-foreground">{ref.date}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>投资: <span className="font-semibold">${ref.amount}</span></span>
                          <span className="text-accent">奖励: <span className="font-semibold">+${ref.earnings}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {directReferrals.length === 0 && indirectReferrals.length === 0 && tree.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无邀请记录</p>
                <p className="text-sm">分享邀请码给好友开始赚取奖励</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>;
}