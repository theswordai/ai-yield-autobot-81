import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Users, Gift, Share2, TrendingUp, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useStakingData } from "@/hooks/useStakingData";
import { useStakingActions } from "@/hooks/useStakingActions";
import { useWeb3 } from "@/hooks/useWeb3";

interface ReferralManagerProps {
  onRefresh?: () => void;
}

export function ReferralManager({ onRefresh }: ReferralManagerProps) {
  const { account } = useWeb3();
  const { data, formatAmount, formatPercent } = useStakingData();
  const { loading, claimReferralRewards, bindReferrer } = useStakingActions();
  const [detectedInviter, setDetectedInviter] = useState<string>("");

  const referralCode = account || "";
  const inviteLink = account ? `${window.location.origin}?inviter=${account}` : "";
  const isReferrerBound = data?.referralStats.inviterAddress !== "0x0000000000000000000000000000000000000000";

  // 检测邀请人地址
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviterFromUrl = urlParams.get('inviter');
    const inviterFromStorage = localStorage.getItem('inviter');
    
    if (inviterFromUrl) {
      localStorage.setItem('inviter', inviterFromUrl);
      setDetectedInviter(inviterFromUrl);
    } else if (inviterFromStorage) {
      setDetectedInviter(inviterFromStorage);
    }
  }, []);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("邀请码已复制到剪贴板");
    }
  };

  const copyReferralLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("邀请链接已复制到剪贴板");
    }
  };

  const handleClaimRewards = async () => {
    const success = await claimReferralRewards();
    if (success && onRefresh) {
      onRefresh();
    }
  };

  const handleOneClickBind = async () => {
    if (!detectedInviter) return;
    
    const success = await bindReferrer(detectedInviter);
    if (success) {
      localStorage.removeItem('inviter');
      setDetectedInviter("");
      if (onRefresh) {
        onRefresh();
      }
      toast.success("成功绑定邀请人!");
    }
  };

  // 等级门槛配置
  const levelThresholds = [
    { level: 1, threshold: "200", directBps: "10%" },
    { level: 2, threshold: "1,000", directBps: "11%" },
    { level: 3, threshold: "3,000", directBps: "12%" },
    { level: 4, threshold: "10,000", directBps: "13%" },
    { level: 5, threshold: "30,000", directBps: "15%" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 推荐关系绑定 */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            推荐关系
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {isReferrerBound ? (
            <div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium">已绑定推荐人</p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                    {data?.referralStats.inviterAddress.slice(0, 6)}...
                    {data?.referralStats.inviterAddress.slice(-4)}
                  </p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  已绑定
                </Badge>
              </div>
            </div>
          ) : detectedInviter ? (
            <div className="p-3 sm:p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-accent">检测到邀请人</p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                    {detectedInviter.slice(0, 6)}...{detectedInviter.slice(-4)}
                  </p>
                </div>
                <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                  待绑定
                </Badge>
              </div>
              <Button 
                onClick={handleOneClickBind}
                disabled={loading.bind}
                className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground 
                           transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-accent/25
                           active:scale-95 active:transition-all active:duration-150
                           animate-pulse hover:animate-none"
              >
                <UserPlus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                {loading.bind ? "绑定中..." : "一键绑定邀请关系"}
              </Button>
            </div>
          ) : (
            <div className="p-3 sm:p-4 bg-muted/10 border border-border rounded-lg">
              <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-muted-foreground">未绑定推荐人</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  您可以在首次投资时绑定推荐人
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 推荐统计 */}
      {data && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              推荐统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-2 sm:p-3 bg-muted/20 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">当前等级</p>
                <p className="text-lg sm:text-xl font-bold">L{data.referralStats.currentLevel.toString()}</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/20 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">直推奖励</p>
                <p className="text-lg sm:text-xl font-bold text-accent">
                  {formatPercent(data.referralStats.directBps)}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/20 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">团队业绩</p>
                <p className="text-base sm:text-xl font-bold">
                  {formatAmount(data.referralStats.totalTeamAmount)} USDT
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/20 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">可领奖励</p>
                <p className="text-base sm:text-xl font-bold text-primary">
                  {formatAmount(data.rewardsVaultPending)} USDT
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">直推人数</p>
                <p className="text-base sm:text-lg font-semibold">{data.referralStats.directReferrals.length}</p>
                <p className="text-xs text-muted-foreground">
                  业绩: {formatAmount(data.referralStats.pDirect)} USDT
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">间推人数</p>
                <p className="text-base sm:text-lg font-semibold">{data.referralStats.indirectReferrals.length}</p>
                <p className="text-xs text-muted-foreground">
                  业绩: {formatAmount(data.referralStats.pIndirect1)} USDT
                </p>
              </div>
            </div>

            <Button 
              onClick={handleClaimRewards}
              disabled={loading.claimReferral || data.rewardsVaultPending === 0n}
              className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-primary hover:bg-gradient-primary/90"
            >
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {loading.claimReferral ? "领取中..." : `领取奖励 (${formatAmount(data.rewardsVaultPending)} USDT)`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 我的邀请码 */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            我的邀请码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">邀请码 (钱包地址)</label>
            <div className="flex gap-1 sm:gap-2">
              <Input 
                value={referralCode} 
                readOnly 
                className="font-mono text-xs sm:text-sm h-8 sm:h-10"
              />
              <Button onClick={copyReferralCode} variant="outline" size="sm" className="h-8 w-8 sm:h-10 sm:w-10">
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">邀请链接</label>
            <div className="flex gap-1 sm:gap-2">
              <Input 
                value={inviteLink}
                readOnly 
                className="font-mono text-xs h-8 sm:h-10"
              />
              <Button onClick={copyReferralLink} variant="outline" size="sm" className="h-8 w-8 sm:h-10 sm:w-10">
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-sm sm:text-base font-medium">等级奖励</h4>
            <div className="space-y-1 sm:space-y-2">
              {levelThresholds.map((tier) => (
                <div key={tier.level} className="flex items-center justify-between p-2 border border-border rounded text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge variant="outline" className="text-xs">L{tier.level}</Badge>
                    <span>≥{tier.threshold} USDT</span>
                  </div>
                  <span className="font-medium text-accent">{tier.directBps} 直推奖励</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              • 间接奖励固定为直推奖励的 10%<br/>
              • 团队业绩达到对应门槛自动升级<br/>
              • 所有奖励实时计算并发放到奖励金库
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}