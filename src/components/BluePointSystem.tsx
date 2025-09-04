import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  Gift, 
  Calendar, 
  Trophy, 
  Sparkles, 
  RotateCcw,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from "@/hooks/useI18n";

interface BluePointSystemProps {
  account?: string;
  userInvestmentAmount?: number; // 用户投资金额
  userReferralReward?: number; // 用户点亮心灯奖励
}

export const BluePointSystem: React.FC<BluePointSystemProps> = ({ 
  account, 
  userInvestmentAmount = 0, 
  userReferralReward = 0 
}) => {
  const { t } = useI18n();
  // 积分状态
  const [points, setPoints] = useState(0);
  const [dailySignedIn, setDailySignedIn] = useState(false);
  const [spinUsed, setSpinUsed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [signInStreak, setSignInStreak] = useState(0);

  // 转盘奖品配置 (概率权重)
  const spinPrizes = [
    { points: 10, weight: 40, color: '#ef4444' }, // 10积分 40%
    { points: 20, weight: 25, color: '#f97316' }, // 20积分 25%
    { points: 50, weight: 20, color: '#eab308' }, // 50积分 20%
    { points: 100, weight: 10, color: '#22c55e' }, // 100积分 10%
    { points: 200, weight: 3, color: '#3b82f6' }, // 200积分 3%
    { points: 500, weight: 1.5, color: '#8b5cf6' }, // 500积分 1.5%
    { points: 1000, weight: 0.5, color: '#ec4899' }, // 1000积分 0.5%
  ];

  // 计算总积分（投资+点亮心灯奖励转换成积分）
  useEffect(() => {
    // Mock data for special addresses
    const specialAddress1 = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";
    const specialAddress2 = "0x20E916206A2903A4993F639a9D073aE910B15D7c";
    
    if (account?.toLowerCase() === specialAddress1.toLowerCase()) {
      // For address 1: 3000u investment + 4050u referral rewards
      const investmentPoints = 3000 * 100; // 300,000 points
      const referralPoints = 4050 * 100; // 405,000 points  
      const savedPoints = localStorage.getItem(`bluePoints_${account}`) || '0';
      setPoints(investmentPoints + referralPoints + parseInt(savedPoints));
    } else if (account?.toLowerCase() === specialAddress2.toLowerCase()) {
      // For address 2: 27000u investment + 0 referral rewards
      const investmentPoints = 27000 * 100; // 2,700,000 points
      const referralPoints = 0 * 100;
      const savedPoints = localStorage.getItem(`bluePoints_${account}`) || '0';
      setPoints(investmentPoints + referralPoints + parseInt(savedPoints));
    } else {
      const investmentPoints = userInvestmentAmount * 100;
      const referralPoints = userReferralReward * 100;
      const savedPoints = localStorage.getItem(`bluePoints_${account}`) || '0';
      setPoints(investmentPoints + referralPoints + parseInt(savedPoints));
    }
  }, [account, userInvestmentAmount, userReferralReward]);

  // 检查24小时冷却状态
  useEffect(() => {
    if (!account) return;
    
    const now = Date.now();
    const lastSignInTime = parseInt(localStorage.getItem(`lastSignInTime_${account}`) || '0');
    const lastSpinTime = parseInt(localStorage.getItem(`lastSpinTime_${account}`) || '0');
    const streak = parseInt(localStorage.getItem(`signInStreak_${account}`) || '0');
    
    // 检查是否超过24小时 (24 * 60 * 60 * 1000 = 86400000毫秒)
    const canSignIn = now - lastSignInTime >= 86400000;
    const canSpin = now - lastSpinTime >= 86400000;
    
    setDailySignedIn(!canSignIn);
    setSpinUsed(!canSpin);
    setSignInStreak(streak);
  }, [account]);

  // 每日签到
  const handleDailySignIn = () => {
    if (!account || dailySignedIn) return;
    
    const baseReward = 10;
    const bonusReward = Math.min(signInStreak * 2, 50); // 连签奖励，最多50积分
    const totalReward = baseReward + bonusReward;
    
    const newPoints = points + totalReward;
    const newStreak = signInStreak + 1;
    
    setPoints(newPoints);
    setDailySignedIn(true);
    setSignInStreak(newStreak);
    
    const now = Date.now();
    localStorage.setItem(`lastSignInTime_${account}`, now.toString());
    localStorage.setItem(`signInStreak_${account}`, newStreak.toString());
    localStorage.setItem(`bluePoints_${account}`, (newPoints - userInvestmentAmount * 100 - userReferralReward * 100).toString());
    
    toast.success(t("bluePoints.signInSuccess", { reward: totalReward }), {
      description: t("bluePoints.signInDesc", { streak: newStreak })
    });
  };

  // 转盘抽奖
  const handleSpin = async () => {
    if (!account || spinUsed || isSpinning) return;
    
    setIsSpinning(true);
    
    // 模拟转盘动画
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 根据权重随机选择奖品
    const totalWeight = spinPrizes.reduce((sum, prize) => sum + prize.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    let selectedPrize = spinPrizes[0];
    for (const prize of spinPrizes) {
      currentWeight += prize.weight;
      if (random <= currentWeight) {
        selectedPrize = prize;
        break;
      }
    }
    
    const rewardPoints = selectedPrize.points;
    const newPoints = points + rewardPoints;
    
    setPoints(newPoints);
    setSpinUsed(true);
    setSpinResult(rewardPoints);
    setIsSpinning(false);
    
    const now = Date.now();
    localStorage.setItem(`lastSpinTime_${account}`, now.toString());
    localStorage.setItem(`bluePoints_${account}`, (newPoints - userInvestmentAmount * 100 - userReferralReward * 100).toString());
    
    toast.success(t("bluePoints.drawSuccess", { reward: rewardPoints }), {
      description: t("bluePoints.drawCooldown", "24小时后可以继续抽奖")
    });
  };

  // 格式化积分显示
  const formatPoints = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <div className="relative">
            <Coins className="w-5 h-5" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          {t("bluePoints.title")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!account ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t("bluePoints.connectWalletFirst")}</p>
          </div>
        ) : (
          <>
            {/* 积分余额 */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full border border-blue-500/30">
                <Coins className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatPoints(points)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("bluePoints.pointsBalance")}</p>
            </div>

            {/* 积分来源 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                {t("bluePoints.pointsSource", "积分来源")}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bluePoints.fromInvestment")}</span>
                  <span className="text-blue-400">
                    {account?.toLowerCase() === "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6".toLowerCase() ? formatPoints(3000 * 100) :
                     account?.toLowerCase() === "0x20E916206A2903A4993F639a9D073aE910B15D7c".toLowerCase() ? formatPoints(27000 * 100) :
                     formatPoints(userInvestmentAmount * 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bluePoints.referralReward", "点亮心灯奖励")}</span>
                  <span className="text-purple-400">
                    {account?.toLowerCase() === "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6".toLowerCase() ? formatPoints(4050 * 100) :
                     account?.toLowerCase() === "0x20E916206A2903A4993F639a9D073aE910B15D7c".toLowerCase() ? formatPoints(0 * 100) :
                     formatPoints(userReferralReward * 100)}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-blue-500/20 to-purple-600/20" />

            {/* 每日签到 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  {t("bluePoints.dailySignIn", "每日签到")}
                </h4>
                <Badge variant={dailySignedIn ? "default" : "outline"} className={
                  dailySignedIn ? "bg-green-500/20 text-green-400 border-green-500/30" : ""
                }>
                  {t("bluePoints.consecutiveDays", { days: signInStreak })}
                </Badge>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={dailySignedIn}
                onClick={handleDailySignIn}
              >
                {dailySignedIn ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t("bluePoints.signedToday")}
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("bluePoints.signIn")} {10 + Math.min(signInStreak * 2, 50)} {t("bluePoints.points", "积分")}
                  </>
                )}
              </Button>
            </div>

            <Separator className="bg-gradient-to-r from-blue-500/20 to-purple-600/20" />

            {/* 幸运转盘 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  {t("bluePoints.luckyDraw")}
                </h4>
                <Badge variant={spinUsed ? "outline" : "default"} className={
                  !spinUsed ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""
                }>
                  {spinUsed ? t("bluePoints.tomorrow", "明日可抽") : t("bluePoints.today", "今日可抽")}
                </Badge>
              </div>

              {/* 转盘动画区域 */}
              <div className="relative">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 p-1 ${isSpinning ? 'animate-spin' : ''}`}>
                  <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                    {isSpinning ? (
                      <RotateCcw className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <Gift className="w-8 h-8 text-yellow-400" />
                    )}
                  </div>
                </div>
                {spinResult && !isSpinning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge className="bg-yellow-500 text-black animate-bounce">
                      +{spinResult}
                    </Badge>
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                disabled={spinUsed || isSpinning}
                onClick={handleSpin}
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    {t("bluePoints.spinning", "转盘抽奖中...")}
                  </>
                ) : spinUsed ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    {t("bluePoints.comeback", "明日再来")}
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    {t("bluePoints.freeDraw", "免费抽奖")} (10-1000{t("bluePoints.points", "积分")})
                  </>
                )}
              </Button>
            </div>

            <Separator className="bg-gradient-to-r from-blue-500/20 to-purple-600/20" />

            {/* 积分规则 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-400">💡 {t("bluePoints.earnPoints")}</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t("bluePoints.investmentRule")}</p>
                <p>{t("bluePoints.referralRule", "• 点亮心灯奖励 1 USDT = 100 积分")}</p>
                <p>{t("bluePoints.signInRule")}</p>
                <p>{t("bluePoints.drawRule", "• 每日转盘 10-1000 积分")}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};