import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Gift, Calendar, Trophy, Sparkles, RotateCcw, CheckCircle, Clock, Zap, Star, Target, Award, TrendingUp, Users, Heart, Crown, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { useWeb3 } from '@/hooks/useWeb3';
import { useStakingData } from '@/hooks/useStakingData';
import { formatUnits } from 'ethers';
import { useI18n } from "@/hooks/useI18n";
export default function BluePoints() {
  const {
    account
  } = useWeb3();
  const {
    data: stakingData
  } = useStakingData();
  const { t } = useI18n();

  // USDV状态
  const [points, setPoints] = useState(0);
  const [dailySignedIn, setDailySignedIn] = useState(false);
  const [spinUsed, setSpinUsed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [signInStreak, setSignInStreak] = useState(0);
  const [vipLevel, setVipLevel] = useState(0);
  const [dailyTasks, setDailyTasks] = useState({
    signIn: false,
    spin: false,
    trade: false
  });
  const [investmentRewardsClaimed, setInvestmentRewardsClaimed] = useState<string[]>([]);

  // 转盘奖品配置
  const spinPrizes = [{
    points: 10,
    weight: 35,
    color: '#ef4444',
    label: `10${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 20,
    weight: 25,
    color: '#f97316',
    label: `20${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 50,
    weight: 20,
    color: '#eab308',
    label: `50${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 100,
    weight: 12,
    color: '#22c55e',
    label: `100${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 200,
    weight: 5,
    color: '#3b82f6',
    label: `200${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 500,
    weight: 2,
    color: '#8b5cf6',
    label: `500${t('bluePoints.spin.pointsLabel')}`
  }, {
    points: 1000,
    weight: 1,
    color: '#ec4899',
    label: `1000${t('bluePoints.spin.pointsLabel')}`
  }];

  // VIP等级配置
  const vipLevels = [{
    level: 0,
    name: t('bluePoints.vip.levels.novice'),
    points: 0,
    benefits: [t('bluePoints.vip.benefits.basicFeatures')],
    color: '#6b7280'
  }, {
    level: 1,
    name: t('bluePoints.vip.levels.bronze'),
    points: 50000,
    benefits: [t('bluePoints.vip.benefits.signInBonus10'), t('bluePoints.vip.benefits.spinCount1')],
    color: '#cd7f32'
  }, {
    level: 2,
    name: t('bluePoints.vip.levels.silver'),
    points: 200000,
    benefits: [t('bluePoints.vip.benefits.signInBonus20'), t('bluePoints.vip.benefits.spinCount2')],
    color: '#c0c0c0'
  }, {
    level: 3,
    name: t('bluePoints.vip.levels.gold'),
    points: 600000,
    benefits: [t('bluePoints.vip.benefits.signInBonus30'), t('bluePoints.vip.benefits.spinCount3')],
    color: '#ffd700'
  }, {
    level: 4,
    name: t('bluePoints.vip.levels.platinum'),
    points: 3000000,
    benefits: [t('bluePoints.vip.benefits.signInBonus50'), t('bluePoints.vip.benefits.spinCount5')],
    color: '#e5e4e2'
  }, {
    level: 5,
    name: t('bluePoints.vip.levels.diamond'),
    points: 10000000,
    benefits: [t('bluePoints.vip.benefits.signInBonus100'), t('bluePoints.vip.benefits.spinCount10')],
    color: '#b9f2ff'
  }];

  // 每日任务配置
  const dailyTasksConfig = [{
    id: 'trade',
    name: t('bluePoints.dailyTasks.completeInvestment'),
    points: 1000,
    icon: TrendingUp,
    description: t('bluePoints.dailyTasks.completeInvestmentDesc'),
    color: '#06b6d4'
  }];

  // 计算投资USDV：每1U本金 = 10USDV
  const investmentPoints = stakingData?.activePositions?.reduce((total, position) => {
    const principalInUsdt = Number(formatUnits(position.principal, 18)); // USDT有18位小数
    return total + Math.floor(principalInUsdt * 10);
  }, 0) || 0;

  // 计算邀请USDV：已邀请奖励乘以100
  const referralPoints = stakingData?.rewardsVaultClaimed ? Math.floor(Number(formatUnits(stakingData.rewardsVaultClaimed, 18)) * 100) : 0;

  // 检查VIP等级
  useEffect(() => {
    const totalPoints = points + investmentPoints + referralPoints;
    const currentLevel = vipLevels.reduce((level, vip) => {
      return totalPoints >= vip.points ? vip.level : level;
    }, 0);
    setVipLevel(currentLevel);
  }, [points, investmentPoints, referralPoints]);

  // 清空所有USDV数据 (开发测试用)
  const clearAllPoints = () => {
    // 清空所有localStorage中的USDV相关数据
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('bluePoints_') || key.includes('lastSignInTime_') || key.includes('lastSpinTime_') || key.includes('signInStreak_') || key.includes('dailyTasks_') || key.includes('investmentRewardsClaimed_')) {
        localStorage.removeItem(key);
      }
    });

    // 重置当前状态
    setPoints(0);
    setDailySignedIn(false);
    setSpinUsed(false);
    setSignInStreak(0);
    setInvestmentRewardsClaimed([]);
    setDailyTasks({
      signIn: false,
      spin: false,
      trade: false
    });
    toast.success('所有USDV数据已清空！');
  };

  // 检查24小时冷却状态
  const checkCooldownStatus = () => {
    if (!account) return;
    const now = Date.now();
    const lastSignInTime = parseInt(localStorage.getItem(`lastSignInTime_${account}`) || '0');
    const lastSpinTime = parseInt(localStorage.getItem(`lastSpinTime_${account}`) || '0');

    // 检查是否超过24小时 (24 * 60 * 60 * 1000 = 86400000毫秒)
    const canSignIn = now - lastSignInTime >= 86400000;
    const canSpin = now - lastSpinTime >= 86400000;
    setDailySignedIn(!canSignIn);
    setSpinUsed(!canSpin);
    setDailyTasks(prev => ({
      ...prev,
      signIn: !canSignIn,
      spin: !canSpin
    }));
  };

  // 加载数据
  useEffect(() => {
    if (!account) return;

    // 加载USDV
    const savedPoints = localStorage.getItem(`bluePoints_${account}`) || '0';
    setPoints(parseInt(savedPoints));

    // 加载其他数据
    const streak = parseInt(localStorage.getItem(`signInStreak_${account}`) || '0');
    const investmentClaimed = JSON.parse(localStorage.getItem(`investmentRewardsClaimed_${account}`) || '[]');
    setSignInStreak(streak);
    setInvestmentRewardsClaimed(investmentClaimed);

    // 初始检查冷却状态
    checkCooldownStatus();
  }, [account]);

  // 定期检查冷却状态 - 每分钟检查一次
  useEffect(() => {
    if (!account) return;
    const interval = setInterval(checkCooldownStatus, 60000); // 每60秒检查一次
    return () => clearInterval(interval);
  }, [account]);

  // 每日签到
  const handleDailySignIn = () => {
    if (!account || dailySignedIn) return;
    const baseReward = 20;
    const streakBonus = Math.min(signInStreak * 5, 100);
    const vipBonus = Math.floor(baseReward * (vipLevel * 0.1));

    // 连续签到奖励：3天、7天、15天、30天
    let consecutiveBonus = 0;
    const newStreak = signInStreak + 1;
    if (newStreak % 30 === 0) {
      consecutiveBonus = 200; // 连续30天额外200USDV
    } else if (newStreak % 15 === 0) {
      consecutiveBonus = 100; // 连续15天额外100USDV
    } else if (newStreak % 7 === 0) {
      consecutiveBonus = 50; // 连续7天额外50USDV
    } else if (newStreak % 3 === 0) {
      consecutiveBonus = 20; // 连续3天额外20USDV
    }
    const totalReward = baseReward + streakBonus + vipBonus + consecutiveBonus;
    const newPoints = points + totalReward;
    setPoints(newPoints);
    setDailySignedIn(true);
    setSignInStreak(newStreak);
    const now = Date.now();
    localStorage.setItem(`lastSignInTime_${account}`, now.toString());
    localStorage.setItem(`signInStreak_${account}`, newStreak.toString());
    localStorage.setItem(`bluePoints_${account}`, newPoints.toString());
    setDailyTasks(prev => ({
      ...prev,
      signIn: true
    }));
    let description = `连续签到 ${newStreak} 天，24小时后可再次签到`;
    if (consecutiveBonus > 0) {
      description += ` 🎉连续签到奖励 +${consecutiveBonus}`;
    }
    if (vipBonus > 0) {
      description += ` VIP奖励 +${vipBonus}`;
    }
    toast.success(`签到成功！获得 ${totalReward} USDV！`, {
      description
    });
  };

  // 转盘抽奖
  const handleSpin = async () => {
    if (!account || spinUsed || isSpinning) return;
    setIsSpinning(true);

    // 模拟转盘动画
    await new Promise(resolve => setTimeout(resolve, 3000));

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
    const vipBonus = Math.floor(rewardPoints * (vipLevel * 0.1));
    const totalReward = rewardPoints + vipBonus;
    const newPoints = points + totalReward;
    setPoints(newPoints);
    setSpinUsed(true);
    setSpinResult(totalReward);
    setIsSpinning(false);
    const now = Date.now();
    localStorage.setItem(`lastSpinTime_${account}`, now.toString());
    localStorage.setItem(`bluePoints_${account}`, newPoints.toString());
    setDailyTasks(prev => ({
      ...prev,
      spin: true
    }));
    toast.success(`恭喜！抽中 ${totalReward} USDV！`, {
      description: `基础奖励 ${rewardPoints} ${vipBonus > 0 ? `+ VIP奖励 ${vipBonus}` : ''} (24小时后可再次抽奖)`
    });
  };

  // 完成任务
  const completeTask = (taskId: string) => {
    if (!account) return;
    const task = dailyTasksConfig.find(t => t.id === taskId);
    if (!task) return;
    if (taskId === 'trade') {
      // 投资任务特殊处理
      if (!stakingData?.activePositions || stakingData.activePositions.length === 0) {
        toast.error('没有投资仓位，无法领取投资奖励');
        return;
      }

      // 检查可领取的投资奖励
      const availablePositions = stakingData.activePositions.filter(position => !investmentRewardsClaimed.includes(position.posId.toString()));
      if (availablePositions.length === 0) {
        toast.error('所有投资奖励已领取完毕');
        return;
      }

      // 领取一个投资奖励
      const positionToReward = availablePositions[0];
      const vipBonus = Math.floor(task.points * (vipLevel * 0.1));
      const totalReward = task.points + vipBonus;
      const newPoints = points + totalReward;
      setPoints(newPoints);
      localStorage.setItem(`bluePoints_${account}`, newPoints.toString());

      // 更新已领取的投资奖励
      const newClaimedList = [...investmentRewardsClaimed, positionToReward.posId.toString()];
      setInvestmentRewardsClaimed(newClaimedList);
      localStorage.setItem(`investmentRewardsClaimed_${account}`, JSON.stringify(newClaimedList));
      toast.success(`投资奖励领取成功！获得 ${totalReward} USDV！`, {
        description: `仓位 #${positionToReward.posId.toString()}`
      });
      return;
    }

    // 其他任务的处理（签到等）
    if (dailyTasks[taskId as keyof typeof dailyTasks]) return;
    const vipBonus = Math.floor(task.points * (vipLevel * 0.1));
    const totalReward = task.points + vipBonus;
    const newPoints = points + totalReward;
    setPoints(newPoints);
    localStorage.setItem(`bluePoints_${account}`, newPoints.toString());
    const today = new Date().toDateString();
    const newTasks = {
      ...dailyTasks,
      [taskId]: true
    };
    setDailyTasks(newTasks);
    localStorage.setItem(`dailyTasks_${account}`, JSON.stringify({
      ...JSON.parse(localStorage.getItem(`dailyTasks_${account}`) || '{}'),
      [taskId]: today
    }));
    toast.success(`任务完成！获得 ${totalReward} USDV！`, {
      description: task.name
    });
  };

  // 格式化USDV显示
  const formatPoints = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // 计算完成的任务数量
  const completedTasks = Object.values(dailyTasks).filter(Boolean).length;
  const totalTasks = dailyTasksConfig.length;

  // 计算可领取的投资奖励数量
  const availableInvestmentRewards = stakingData?.activePositions?.filter(position => !investmentRewardsClaimed.includes(position.posId.toString())).length || 0;

  // 获取当前VIP信息
  const currentVip = vipLevels[vipLevel];
  const nextVip = vipLevels[vipLevel + 1];
  return <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t("bluePoints.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("bluePoints.subtitle")}</p>
        </div>

        {/* USDV币简介 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <CardContent className="py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* 定位宣言 */}
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-blue-400 mb-4">{t("bluePoints.positioning")}</h2>
                <p className="text-foreground text-lg leading-relaxed">
                  {t("bluePoints.positioningDesc")}
                </p>
                <div className="space-y-3 text-foreground/90">
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span>{t("bluePoints.donation")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span>{t("bluePoints.holding")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span>{t("bluePoints.light")}</span>
                  </div>
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* 特征 */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-purple-400">{t("bluePoints.features")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Coins className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">{t("bluePoints.wealthCertificate")}</h3>
                    </div>
                    <p className="text-foreground/80">{t("bluePoints.wealthDesc")}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-400">{t("bluePoints.charitySymbol")}</h3>
                    </div>
                    <p className="text-foreground/80">{t("bluePoints.charityDesc")}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-yellow-400">{t("bluePoints.honorSymbol")}</h3>
                    </div>
                    <p className="text-foreground/80">{t("bluePoints.honorDesc")}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-400">{t("bluePoints.globalResonance")}</h3>
                    </div>
                    <p className="text-foreground/80">{t("bluePoints.globalDesc")}</p>
                  </div>
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* 愿景 */}
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold text-cyan-400">{t("bluePoints.vision")}</h2>
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-6 border border-cyan-500/20">
                  <p className="text-foreground text-lg mb-4">
                    {t("bluePoints.visionDesc")}：
                  </p>
                  <div className="space-y-3 text-foreground/90">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span>{t("bluePoints.capitalFlowKindness", "它让资本流动转化为爱心流动")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      <span>{t("bluePoints.blockchainWitness", "它让区块链透明见证善意")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span>{t("bluePoints.humanCommunity", "它让捐助不仅止于利润，更升华为 人类命运共同体的价值共鸣")}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-600/30">
                  <h3 className="text-xl font-bold text-blue-400 mb-2">{t("bluePoints.oneLineVision")}</h3>
                  <p className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {t("bluePoints.oneLineVisionText")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!account ? <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <Coins className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t("bluePoints.connectWalletStart", "连接钱包开始")}</h3>
              <p className="text-muted-foreground">{t("bluePoints.connectWalletDesc", "请连接钱包以开始使用蓝光极慈币系统")}</p>
            </CardContent>
          </Card> : <div className="space-y-8">
            {/* USDV说明 */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardContent className="text-center py-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Coins className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">{t("bluePoints.pointsRules", "USDV获取规则")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-blue-400 font-medium">{t('bluePoints.overview.investmentPoints')}</p>
                    <p className="text-muted-foreground">{t('bluePoints.overview.investmentPointsDesc')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('bluePoints.overview.currentInvestmentPoints', { points: investmentPoints.toLocaleString() })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-green-400 font-medium">{t('bluePoints.overview.investmentRewards')}</p>
                    <p className="text-muted-foreground">{t('bluePoints.overview.investmentRewardsDesc')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('bluePoints.overview.availableRewards', { count: availableInvestmentRewards })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-purple-400 font-medium">{t('bluePoints.overview.referralPoints')}</p>
                    <p className="text-muted-foreground">{t('bluePoints.overview.referralPointsDesc')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('bluePoints.overview.currentReferralPoints', { points: referralPoints.toLocaleString() })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* USDV总览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* USDV余额 */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
                <CardContent className="text-center py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-8 h-8 text-blue-400" />
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {(points + investmentPoints + referralPoints).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('bluePoints.overview.totalPoints')}</p>
                </CardContent>
              </Card>

              {/* VIP等级 */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="text-center py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-xl font-bold text-yellow-400">{currentVip.name}</p>
                  <p className="text-sm text-muted-foreground">VIP {vipLevel}</p>
                {nextVip && <div className="mt-2">
                      <Progress value={(points + investmentPoints + referralPoints - currentVip.points) / (nextVip.points - currentVip.points) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('bluePoints.overview.distanceToNext', { level: nextVip.name, points: formatPoints(nextVip.points - (points + investmentPoints + referralPoints)) })}
                      </p>
                    </div>}
                </CardContent>
              </Card>

              {/* 今日完成度 */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="text-center py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-xl font-bold text-green-400">{completedTasks}/{totalTasks}</p>
                      <p className="text-sm text-muted-foreground">{t('bluePoints.overview.todayCompletion')}</p>
                      <Progress value={completedTasks / totalTasks * 100} className="h-2 mt-2" />
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="tasks" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tasks">{t('bluePoints.tabs.dailyTasks')}</TabsTrigger>
                <TabsTrigger value="spin">{t('bluePoints.tabs.spin')}</TabsTrigger>
                <TabsTrigger value="vip">{t('bluePoints.tabs.vip')}</TabsTrigger>
                <TabsTrigger value="ranking">{t('bluePoints.tabs.ranking')}</TabsTrigger>
              </TabsList>

              {/* 每日任务 */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyTasksConfig.map(task => {
                const Icon = task.icon;
                let isCompleted = dailyTasks[task.id as keyof typeof dailyTasks];

                // 投资任务的完成状态特殊处理
                if (task.id === 'trade') {
                  isCompleted = availableInvestmentRewards === 0;
                }
                return <Card key={task.id} className={`border-2 transition-all ${isCompleted ? 'bg-green-500/5 border-green-500/20' : 'hover:border-primary/40'}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg`} style={{
                          backgroundColor: `${task.color}20`
                        }}>
                                <Icon className="w-5 h-5" style={{
                            color: task.color
                          }} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{task.name}</h3>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('bluePoints.overview.availableRewards', { count: availableInvestmentRewards })}
                                  </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    +{task.points} {t('bluePoints.spin.pointsLabel')}
                                  </Badge>
                                  {vipLevel > 0 && <Badge variant="secondary" className="text-xs">
                                      VIP +{Math.floor(task.points * vipLevel * 0.1)}
                                    </Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {isCompleted ? <CheckCircle className="w-6 h-6 text-green-400" /> : <Button size="sm" onClick={() => completeTask(task.id)} disabled={task.id === 'trade' && (!stakingData?.activePositions || availableInvestmentRewards === 0)}>
                                  {task.id === 'trade' ? `${t('bluePoints.dailyTasks.claimReward')} (${availableInvestmentRewards})` : t('bluePoints.dailyTasks.complete')}
                                </Button>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>;
              })}
                </div>
              </TabsContent>

              {/* 转盘抽奖 */}
              <TabsContent value="spin" className="space-y-6">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-center">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      {t('bluePoints.spin.luckyWheel')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    {/* 转盘 */}
                    <div className="relative mx-auto w-64 h-64">
                      <div className={`w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 p-2 ${isSpinning ? 'animate-spin' : ''}`} style={{
                    animationDuration: '3s'
                  }}>
                        <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                          {isSpinning ? <RotateCcw className="w-16 h-16 text-yellow-400" /> : <Gift className="w-16 h-16 text-yellow-400" />}
                        </div>
                      </div>
                      {spinResult && !isSpinning && <div className="absolute inset-0 flex items-center justify-center">
                          <Badge className="bg-yellow-500 text-black text-lg px-4 py-2 animate-bounce">
                            +{spinResult}
                          </Badge>
                        </div>}
                    </div>

                    {/* 奖品列表 */}
                    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                      {spinPrizes.map((prize, index) => <div key={index} className="text-center p-2 rounded-lg border" style={{
                    borderColor: `${prize.color}40`
                  }}>
                          <Gem className="w-4 h-4 mx-auto mb-1" style={{
                      color: prize.color
                    }} />
                          <p className="text-xs font-medium">{prize.label}</p>
                        </div>)}
                    </div>

                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3" disabled={spinUsed || isSpinning} onClick={handleSpin} size="lg">
                      {isSpinning ? <>
                          <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                          {t('bluePoints.spin.spinning')}
                        </> : spinUsed ? <>
                          <Clock className="w-5 h-5 mr-2" />
                          {t('bluePoints.spin.tomorrowCome')}
                        </> : <>
                          <Trophy className="w-5 h-5 mr-2" />
                          {t('bluePoints.spin.freeDrawing')}
                        </>}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* VIP特权 */}
              <TabsContent value="vip" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vipLevels.map(vip => <Card key={vip.level} className={`border-2 transition-all ${vipLevel >= vip.level ? 'bg-yellow-500/5 border-yellow-500/30' : 'opacity-60'}`}>
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Crown className="w-6 h-6" style={{
                      color: vip.color
                    }} />
                          <span className="font-bold text-lg" style={{
                      color: vip.color
                    }}>
                            {vip.name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('bluePoints.vip.needPoints', { points: formatPoints(vip.points) })}
                        </p>
                        <div className="space-y-1">
                          {vip.benefits.map((benefit, index) => <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>)}
                        </div>
                        {vipLevel >= vip.level && <Badge className="mt-3 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {t('bluePoints.vip.unlocked')}
                          </Badge>}
                      </CardContent>
                    </Card>)}
                </div>
              </TabsContent>

              {/* USDV排行 */}
              <TabsContent value="ranking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      {t('bluePoints.ranking.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{t('bluePoints.ranking.comingSoon')}</p>
                      <p className="text-sm">{t('bluePoints.ranking.stayTuned')}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>}
      </main>
    </div>;
}