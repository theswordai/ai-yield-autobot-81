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
    0: 388,  // 1个月 3.88%
    1: 888,  // 6个月 8.88%
    2: 1544, // 12个月 15.44%
  };
  const aprBps = aprMap[lockChoice];
  const apr = aprBps / 100; // 转换为百分比
  
  // 计算复投收益
  const calculatorData = useMemo(() => {
    const principal = parseFloat(yieldAmount) || 0;
    if (principal <= 0) {
      return null;
    }
    
    // 计算 12 个月后的收益对比
    const months = 12;
    const monthlyRate = apr / 100 / 12;
    
    // 不复投：只拿当前收益
    const withoutCompound = principal;
    
    // 复投：按月复利
    const withCompound = principal * Math.pow(1 + monthlyRate, months);
    const compoundProfit = withCompound - principal;
    
    const difference = compoundProfit - 0; // 与不复投的差距
    const percentageGain = ((withCompound / principal - 1) * 100).toFixed(2);
    
    const belowMinimum = principal < 200;
    
    return {
      principal,
      withCompound: withCompound.toFixed(2),
      compoundProfit: compoundProfit.toFixed(2),
      difference: difference.toFixed(2),
      percentageGain,
      apr,
      belowMinimum,
    };
  }, [yieldAmount, apr]);
  
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
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">智能复投计算器</span>
              </div>
              <Sparkles className={`w-4 h-4 text-accent transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
            </button>
            
            {showCalculator && (
              <div className="mt-3 space-y-3 p-4 rounded-lg border border-border/50 bg-card/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">12个月后收益对比</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 不复投 */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">不复投</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{calculatorData.principal.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">收益: 0 USDT</p>
                    </div>
                    
                    {/* 复投 */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
                      <div className="relative">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold text-primary">复投</span>
                        </div>
                        <p className="text-lg font-bold text-primary">{calculatorData.withCompound}</p>
                        <p className="text-xs text-primary/80 mt-1">收益: +{calculatorData.compoundProfit} USDT</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 收益差距高亮 */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">复投额外收益</span>
                    <span className="text-sm font-bold text-accent">+{calculatorData.difference} USDT</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">收益率提升</span>
                    <span className="text-sm font-bold text-primary">+{calculatorData.percentageGain}%</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground text-center">
                  * 基于 {apr}% 年化收益率，按月复利计算
                </p>
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
            <span className="relative text-sm opacity-90">年化收益率最高 1544%</span>
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
