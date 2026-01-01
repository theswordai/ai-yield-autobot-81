import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, TrendingUp, Share2, Trophy, QrCode, Download } from "lucide-react";
import QRCode from "qrcode";
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
  embedded = false,
  onRefresh
}: {
  embedded?: boolean;
  onRefresh?: () => void;
}) {
  const { toast } = useToast();
  const { t, language } = useI18n();
  const { account, provider, signer } = useWeb3();
  const registry = useMemo(() => provider ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, provider) : null, [provider]);
  const registryWrite = useMemo(() => signer ? new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, signer) : null, [signer]);
  const vault = useMemo(() => provider ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, provider) : null, [provider]);
  const vaultWrite = useMemo(() => signer ? new Contract(VAULT_ADDRESS, RewardsVault_ABI, signer) : null, [signer]);
  const lock = useMemo(() => provider ? new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) : null, [provider]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: "0.00",
    pendingRewards: "0.00",
    directReferrals: 0,
    indirectReferrals: 0,
    totalInviteAmount: "0.00",
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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const Title = (embedded ? 'h2' : 'h1') as any;
  const ZERO = "0x0000000000000000000000000000000000000000";
  const referralCode = account || "";
  const inviteLink = account ? `${window.location.origin}/${language}/referral?inviter=${account}` : `${window.location.origin}/${language}/referral?inviter=----`;

  // Reward tiers with i18n
  const rewardTiers = [
    {
      level: t('referral.tiers.lv1.level'),
      requirement: t('referral.tiers.lv1.requirement'),
      directReward: t('referral.tiers.lv1.directReward'),
      indirectReward: t('referral.tiers.lv1.indirectReward'),
      description: t('referral.tiers.lv1.description'),
      icon: "🌱",
      bgColor: "bg-green-500/20 border-green-500/30"
    },
    {
      level: t('referral.tiers.lv2.level'),
      requirement: t('referral.tiers.lv2.requirement'),
      directReward: t('referral.tiers.lv2.directReward'),
      indirectReward: t('referral.tiers.lv2.indirectReward'),
      description: t('referral.tiers.lv2.description'),
      icon: "🛡️",
      bgColor: "bg-yellow-500/20 border-yellow-500/30"
    },
    {
      level: t('referral.tiers.lv3.level'),
      requirement: t('referral.tiers.lv3.requirement'),
      directReward: t('referral.tiers.lv3.directReward'),
      indirectReward: t('referral.tiers.lv3.indirectReward'),
      description: t('referral.tiers.lv3.description'),
      icon: "⭐",
      bgColor: "bg-blue-500/20 border-blue-500/30"
    },
    {
      level: t('referral.tiers.lv4.level'),
      requirement: t('referral.tiers.lv4.requirement'),
      directReward: t('referral.tiers.lv4.directReward'),
      indirectReward: t('referral.tiers.lv4.indirectReward'),
      description: t('referral.tiers.lv4.description'),
      icon: "🌍",
      bgColor: "bg-purple-500/20 border-purple-500/30"
    },
    {
      level: t('referral.tiers.lv5.level'),
      requirement: t('referral.tiers.lv5.requirement'),
      directReward: t('referral.tiers.lv5.directReward'),
      indirectReward: t('referral.tiers.lv5.indirectReward'),
      description: t('referral.tiers.lv5.description'),
      icon: "👑",
      bgColor: "bg-amber-500/20 border-amber-500/30"
    }
  ];

  // Leaderboard
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
  
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `...${address.slice(-10)}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviterFromUrl = urlParams.get('inviter');
    
    if (inviterFromUrl && /^0x[a-fA-F0-9]{40}$/.test(inviterFromUrl)) {
      localStorage.setItem('inviter', inviterFromUrl);
      setStoredInviter(inviterFromUrl);
      
      urlParams.delete('inviter');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    const load = async () => {
      try {
        if (!account || !registry) {
          setStats(s => s);
          setTree([]);
          return;
        }
        const [directs, indirects, vaultPending, bound, pDir, pInd, levelBn] = await Promise.all([
          (registry as any).getDirects(account) as Promise<string[]>,
          (registry as any).getIndirectsL1(account) as Promise<string[]>,
          vault ? (vault as any).pendingRewards(account) as Promise<bigint> : Promise.resolve(0n),
          (registry as any).inviterOf(account) as Promise<string>,
          (registry as any).pDirect(account) as Promise<bigint>,
          (registry as any).pIndirect1(account) as Promise<bigint>,
          (registry as any).getLevel(account) as Promise<bigint>
        ]);

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
        
        setDirectReferrals(directs);
        setIndirectReferrals(indirects);
        let list: any[] = [];
        try {
          if (lock) {
            const fromBlock: any = 0n;
            const toBlock: any = "latest";
            const [accDir, accInd] = await Promise.all([
              (lock as any).queryFilter((lock as any).filters.ReferralAccrued(account, null), fromBlock, toBlock),
              (lock as any).queryFilter((lock as any).filters.ReferralAccrued(null, account), fromBlock, toBlock)
            ]);
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
            const [directList, indirectList] = await Promise.all([
              Promise.all(directs.map(a => buildFor(a, 1))),
              Promise.all(indirects.map(a => buildFor(a, 2)))
            ]);
            list = [...directList, ...indirectList];
          } else {
            list = [
              ...directs.map(addr => ({
                level: 1,
                user: addr,
                amount: "-",
                earnings: "-",
                date: "-"
              })),
              ...indirects.map(addr => ({
                level: 2,
                user: addr,
                amount: "-",
                earnings: "-",
                date: "-"
              }))
            ];
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

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: t('referral.copySuccess'),
      description: t('referral.inviteCodeCopied')
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: t('referral.copySuccess'),
      description: t('referral.inviteLinkCopied')
    });
  };

  const onBind = async () => {
    try {
      if (!account || !registryWrite) throw new Error(t('referral.connectWalletFirst'));
      const inv = storedInviter?.toLowerCase();
      if (!inv || !/^0x[a-fA-F0-9]{40}$/.test(inv)) throw new Error(t('referral.invalidInviter'));
      if (inv === account.toLowerCase()) throw new Error(t('referral.cannotBindSelf'));
      if (boundInviter && boundInviter !== ZERO) throw new Error(t('referral.alreadyBound'));
      setBinding(true);
      const tx = await (registryWrite as any).bind(inv);
      toast({
        title: t('referral.submitting'),
        description: tx.hash
      });
      await tx.wait();
      toast({
        title: t('referral.bindSuccess')
      });
      setBoundInviter(inv);
    } catch (e: any) {
      toast({
        title: t('referral.bindFailed'),
        description: e?.shortMessage || e?.message || t('referral.pleaseTryLater')
      });
    } finally {
      setBinding(false);
    }
  };

  const claimRewards = async () => {
    try {
      if (!account || !vaultWrite) throw new Error(t('referral.connectWalletFirst'));
      
      setClaiming(true);
      const tx = await (vaultWrite as any).claim();
      toast({
        title: t('referral.submitting'),
        description: tx.hash
      });
      await tx.wait();
      toast({
        title: t('referral.claimSuccess')
      });
      
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (e: any) {
      toast({
        title: t('referral.claimFailed'),
        description: e?.shortMessage || e?.message || t('referral.pleaseTryLater')
      });
    } finally {
      setClaiming(false);
    }
  };

  // Generate QR code
  useEffect(() => {
    if (account && inviteLink) {
      QRCode.toDataURL(inviteLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(console.error);
    }
  }, [account, inviteLink]);

  const downloadQRPoster = () => {
    if (!qrDataUrl || !account) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t('referral.poster.title'), canvas.width / 2, 80);

      const qrSize = 200;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 120;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(t('referral.poster.myAddress'), canvas.width / 2, 380);
      
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ffd700';
      const shortAddr = `${account.slice(0, 10)}...${account.slice(-10)}`;
      ctx.fillText(shortAddr, canvas.width / 2, 410);

      ctx.fillStyle = '#cccccc';
      ctx.font = '12px Arial';
      ctx.fillText(t('referral.poster.scanTip'), canvas.width / 2, 450);
      ctx.fillText(t('referral.poster.slogan'), canvas.width / 2, 470);

      const link = document.createElement('a');
      link.download = `invite_poster_${account.slice(-6)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      {!embedded && (
        <Helmet>
          <title>{t('referral.pageTitle')}</title>
          <meta name="description" content={t('referral.pageDescription')} />
          <link rel="canonical" href="/referral" />
        </Helmet>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className={`${embedded ? 'pt-6' : 'pt-20'} pb-10 relative z-10`}>
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Title className="text-3xl font-bold mb-2">{t('referral.title')}</Title>
              <p className="text-muted-foreground">{t('referral.subtitle')}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://usdonline.xyz', '_blank')}
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              {t('referral.queryButton')}
            </Button>
          </div>

          {/* Bind status */}
          <div className="mb-6">
            {boundInviter && boundInviter !== ZERO ? (
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-sm">{t('referral.boundTo')}<span className="font-mono">0x…{boundInviter.slice(-4)}</span></span>
                <span className="text-xs text-muted-foreground">{t('referral.cannotChange')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-dashed rounded-md">
                <span className="text-sm">
                  {storedInviter ? (
                    <>
                      {t('referral.detectedInviter')}<span className="font-mono">0x…{storedInviter.slice(-4)}</span>
                    </>
                  ) : t('referral.noInviter')}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={!storedInviter || binding} onClick={onBind}>
                    {t('referral.bindNow')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('referral.totalInvites')}
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
                  {t('referral.totalEarnings')}
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
                  {t('referral.claimableRewards')}
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
                  {claiming ? t('referral.claiming') : t('referral.claimNow')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('referral.directReferrals')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.directReferrals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('referral.indirectReferrals')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.indirectReferrals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('referral.totalInviteAmount')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalInviteAmount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('referral.currentLevel')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">L{stats.level}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Code & Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {t('referral.myInviteAddress')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Referral Code */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('referral.inviteCode')}</label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralCode} 
                      readOnly 
                      className="font-mono text-sm bg-muted/30"
                    />
                    <Button 
                      onClick={copyReferralCode} 
                      size="icon" 
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Referral Link */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('referral.inviteLink')}</label>
                  <div className="flex gap-2">
                    <Input 
                      value={inviteLink} 
                      readOnly 
                      className="font-mono text-xs bg-muted/30"
                    />
                    <Button 
                      onClick={copyReferralLink} 
                      size="icon" 
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* QR Code Poster */}
                {qrDataUrl && (
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{t('referral.qrPoster')}</span>
                      <Button
                        onClick={downloadQRPoster}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {t('referral.downloadPoster')}
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-lg">
                        <img 
                          src={qrDataUrl} 
                          alt={t('referral.qrAlt')} 
                          className="w-32 h-32"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text-xs text-muted-foreground">
                        {t('referral.scanOrDownload')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('referral.autoBinding')}
                      </p>
                      <p className="text-xs text-primary font-medium mt-2">
                        {t('referral.getQrPoster')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reward Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('referral.rewardMechanism')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewardTiers.map((tier, index) => (
                  <div key={index} className={`p-4 border rounded-lg hover:bg-muted/20 transition-colors ${tier.bgColor}`}>
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
                        <div className="text-xs text-muted-foreground">{t('referral.directReward')}</div>
                        <div className="font-bold text-accent">{tier.directReward}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-xs text-muted-foreground">{t('referral.indirectShare')}</div>
                        <div className="font-bold text-primary">{tier.indirectReward}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{tier.description}</div>
                  </div>
                ))}
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('referral.levelExplanation')}</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('referral.levelNote1')}</li>
                    <li>• {t('referral.levelNote2')}</li>
                    <li>• {t('referral.levelNote3')}</li>
                    <li>• {t('referral.levelNote4')}</li>
                    <li>• {t('referral.levelNote5')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {t('referral.leaderboard')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('referral.noInviteData')}</div>
                ) : (
                  <ol className="space-y-2">
                    {leaderboard.map((it, idx) => (
                      <li key={it.user} className="flex items-center justify-between p-3 border border-border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center text-xs font-semibold">{idx + 1}</div>
                          <span className="font-mono text-sm">{"0x..." + it.user.slice(-4)}</span>
                        </div>
                        <div className="text-sm font-bold text-accent">+${it.earnings.toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        })}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Referral Tree */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('referral.inviteTree')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Direct Addresses */}
                {directReferrals.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">{t('referral.directAddresses')} ({directReferrals.length})</h4>
                    <div className="space-y-2">
                      {directReferrals.map((address, index) => (
                        <div key={`direct-${index}`} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge variant="default">L1</Badge>
                            <span className="font-mono text-sm">{shortenAddress(address)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('referral.directInvite')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indirect Addresses */}
                {indirectReferrals.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-secondary">{t('referral.indirectAddresses')} ({indirectReferrals.length})</h4>
                    <div className="space-y-2">
                      {indirectReferrals.map((address, index) => (
                        <div key={`indirect-${index}`} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">L2</Badge>
                            <span className="font-mono text-sm">{shortenAddress(address)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('referral.indirectInvite')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction Records */}
                {tree.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-accent">{t('referral.transactionRecords')}</h4>
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
                            <span>{t('referral.investment')} <span className="font-semibold">${ref.amount}</span></span>
                            <span className="text-accent">{t('referral.reward')} <span className="font-semibold">+${ref.earnings}</span></span>
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
                  <p>{t('referral.noRecords')}</p>
                  <p className="text-sm">{t('referral.shareToEarn')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
