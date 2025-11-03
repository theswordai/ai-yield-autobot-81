import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Calculator, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";

interface ClaimYieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yieldAmount: string;
  onReinvest: () => void;
  onClaim: () => void;
  loading?: boolean;
  lockChoice?: 0 | 1 | 2; // 默认锁定期选择
}

export function ClaimYieldDialog({
  open,
  onOpenChange,
  yieldAmount,
  onReinvest,
  onClaim,
  loading = false,
  lockChoice = 2, // 默认使用最高收益的 12 个月
}: ClaimYieldDialogProps) {
  console.log('🔔 ClaimYieldDialog render:', { open, yieldAmount, loading, lockChoice });
  
  const [showCalculator, setShowCalculator] = useState(true);
  
  // APR 基于 lockChoice
  const aprMap = {
    0: 5000,  // 3个月 50%
    1: 12000, // 6个月 120%
    2: 28000, // 12个月 280%
  };
  const aprBps = aprMap[lockChoice];
  const apr = aprBps / 100; // 转换为百分比
  
  // 计算复投收益
  const calculatorData = useMemo(() => {
    const principal = parseFloat(yieldAmount) || 0;
    if (principal <= 0) {
      return null;
    }
    
    // 定义3个锁仓期配置（APR → APY）
    const lockOptions = [
      { 
        lockChoice: 0,
        months: 3,
        days: 90,
        apr: 50,
        aprBps: 5000,
        apy: 64.82,
        label: "3个月锁仓",
        color: "blue"
      },
      { 
        lockChoice: 1,
        months: 6,
        days: 180,
        apr: 120,
        aprBps: 12000,
        apy: 231.36,
        label: "6个月锁仓",
        color: "purple"
      },
      { 
        lockChoice: 2,
        months: 12,
        days: 365,
        apr: 280,
        aprBps: 28000,
        apy: 1526.99,
        label: "12个月锁仓",
        color: "gold",
        recommended: true
      },
    ];
    
    // 计算每个锁仓期的收益
    const comparisons = lockOptions.map(option => {
      // 日复利公式：FV = P × (1 + r/365)^days
      const dailyRate = option.apr / 100 / 365;
      const finalAmount = principal * Math.pow(1 + dailyRate, option.days);
      const profit = finalAmount - principal;
      const percentageGain = ((finalAmount / principal - 1) * 100).toFixed(2);
      
      // 单利对比（作为baseline）
      const simpleInterest = principal * (option.apr / 100) * (option.days / 365);
      const withSimpleInterest = principal + simpleInterest;
      const compoundAdvantage = finalAmount - withSimpleInterest;
      
      // 每日被动收入
      const dailyIncome = (profit / option.days).toFixed(3);
      
      // 如果连续复投1年的收益（365天）
      const yearProfit = principal * Math.pow(1 + dailyRate, 365) - principal;
      
      return {
        ...option,
        finalAmount: finalAmount.toFixed(2),
        profit: profit.toFixed(2),
        percentageGain,
        simpleInterest: simpleInterest.toFixed(2),
        withSimpleInterest: withSimpleInterest.toFixed(2),
        compoundAdvantage: compoundAdvantage.toFixed(2),
        dailyIncome,
        yearProfit: yearProfit.toFixed(2),
      };
    });
    
    const belowMinimum = principal < 200;
    
    return {
      principal: principal.toFixed(2),
      comparisons,
      belowMinimum,
    };
  }, [yieldAmount]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">选择操作</DialogTitle>
          <DialogDescription className="text-center">
            您的待领收益: <span className="font-bold text-accent">{yieldAmount} USDT</span>
          </DialogDescription>
        </DialogHeader>
        
        {/* 智能复投计算器 */}
        {calculatorData && (
          <div className="mt-4 mb-2">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-all border-2 border-amber-500"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-bold text-amber-900">
                  智能复投计算器 💰 最高APY达 1526.99%
                </span>
              </div>
              <Sparkles className={`w-4 h-4 text-amber-700 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
            </button>
            
            {showCalculator && (
              <div className="mt-3 space-y-3 p-4 rounded-lg border-2 border-amber-300 bg-white">
                {/* 本金显示 */}
                <div className="text-center bg-gray-50 p-2 rounded-lg">
                  <p className="text-sm text-gray-700">
                    复投本金：<span className="font-bold text-gray-900 text-base">{calculatorData.principal} USDT</span>
                  </p>
                </div>
                
                {/* 3个锁仓期对比卡片 */}
                <div className="space-y-3">
                  {calculatorData.comparisons.map((option) => (
                    <div
                      key={option.lockChoice}
                      className={`p-4 rounded-lg border-2 relative overflow-hidden ${
                        option.recommended
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500'
                          : option.color === 'purple'
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400'
                          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400'
                      }`}
                    >
                      {/* 推荐标签 */}
                      {option.recommended && (
                        <div className="absolute top-2 right-2">
                          <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-1 rounded-full border border-amber-400">
                            ⭐ 推荐
                          </span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {/* 标题 */}
                        <div className="flex items-center justify-between">
                          <span className={`text-base font-bold ${
                            option.recommended ? 'text-amber-900' : 'text-gray-900'
                          }`}>
                            {option.label}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            APR {option.apr}%
                          </span>
                        </div>
                        
                        {/* APY 高亮 */}
                        <div className={`p-3 rounded-md border-2 ${
                          option.recommended 
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400' 
                            : option.color === 'purple'
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400'
                            : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-400'
                        }`}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold text-gray-700">APY:</span>
                            <span className={`text-xl font-bold ${
                              option.recommended ? 'text-amber-900' : option.color === 'purple' ? 'text-purple-900' : 'text-blue-900'
                            }`}>
                              {option.apy}%
                            </span>
                            {option.recommended && <span className="text-xl">🚀</span>}
                          </div>
                        </div>
                        
                        {/* 到期金额 */}
                        <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-700 font-medium">到期金额</span>
                          <span className="font-bold text-gray-900">{option.finalAmount} USDT</span>
                        </div>
                        
                        {/* 收益 */}
                        <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded border border-green-200">
                          <span className="text-gray-700 font-medium">收益</span>
                          <span className={`font-bold ${
                            option.recommended ? 'text-amber-700' : option.color === 'purple' ? 'text-purple-700' : 'text-blue-700'
                          }`}>
                            +{option.profit} USDT (+{option.percentageGain}%)
                          </span>
                        </div>
                        
                        {/* 复利优势 */}
                        <div className="flex items-center justify-between text-sm bg-emerald-50 p-2 rounded border border-emerald-200">
                          <span className="text-gray-700 font-medium">💎 比单利多赚</span>
                          <span className="font-bold text-emerald-700">
                            +{option.compoundAdvantage} USDT
                          </span>
                        </div>
                        
                        {/* 每日被动收入 */}
                        <div className="flex items-center justify-between text-sm bg-sky-50 p-2 rounded border border-sky-200">
                          <span className="text-gray-700 font-medium">📅 每日被动收入</span>
                          <span className="font-bold text-sky-700">
                            +{option.dailyIncome} USDT/天
                          </span>
                        </div>
                        
                        {/* 12个月额外显示1年收益 */}
                        {option.recommended && (
                          <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-900 font-bold">🎯 连续复投1年可赚</span>
                              <span className="font-bold text-purple-700 text-base">
                                +{option.yearProfit} USDT
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 说明文案 */}
                <div className="space-y-2 pt-2 border-t-2 border-gray-200">
                  <p className="text-xs text-gray-600 text-center">
                    * 基于日复利计算（365天），APY = 实际年化收益率
                  </p>
                  <p className="text-xs text-amber-800 text-center font-bold bg-amber-50 p-2 rounded border border-amber-200">
                    💡 提示：复利是世界第八大奇迹！越早复投，收益越高！
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-3 mt-2">
          <Button
            onClick={onReinvest}
            disabled={loading}
            className="w-full h-auto py-4 flex flex-col items-center gap-2 relative overflow-hidden group"
            variant="default"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg font-semibold">复投</span>
            </div>
            <span className="relative text-sm opacity-90">APY 最高可达 1526.99% 🚀</span>
          </Button>
          
          <Button
            onClick={onClaim}
            disabled={loading}
            className="w-full h-auto py-4"
            variant="outline"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            <span className="text-lg font-semibold">领取收益</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
