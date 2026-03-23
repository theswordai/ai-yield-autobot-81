import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Lock, Clock, TrendingUp, Calculator } from "lucide-react";
import { useStakingData } from "@/hooks/useStakingData";
import { useStakingActions } from "@/hooks/useStakingActions";
import { parseUnits } from "ethers";
import { USDT_DECIMALS } from "@/config/contracts";
import { InviterBindingDialog } from "./InviterBindingDialog";
import { useI18n } from "@/hooks/useI18n";

interface StakingInterfaceProps {
  onSuccess?: () => void;
  initialAmount?: string;
}

export function StakingInterface({ onSuccess, initialAmount }: StakingInterfaceProps) {
  const { data, formatAmount, refreshData } = useStakingData();
  const { loading, approveUSDT, deposit } = useStakingActions();
  const { t } = useI18n();
  
  const [amount, setAmount] = useState(initialAmount || "200");
  const [lockChoice, setLockChoice] = useState<"0" | "1" | "2">("0");
  const [showInviterDialog, setShowInviterDialog] = useState(false);

  // 计算收益预期 - 使用复利算法
  const stakingCalc = useMemo(() => {
    const amountNum = Number(amount) || 0;
    const aprBps = lockChoice === "0" ? 5000 : lockChoice === "1" ? 12000 : 28000;
    const lockDays = lockChoice === "0" ? 90 : lockChoice === "1" ? 180 : 365;
    const aprPercent = aprBps / 100;
    
    // 复利公式: FV = P × (1 + APR/365)^days
    const dailyRate = (aprBps / 10000) / 365;
    const finalAmount = amountNum * Math.pow(1 + dailyRate, lockDays);
    const expectedEarnings = finalAmount - amountNum;
    
    return {
      principal: amountNum,
      aprPercent,
      lockDays,
      expectedEarnings,
      totalReturn: finalAmount,
    };
  }, [amount, lockChoice]);

  // 检查是否需要授权
  const needApprove = useMemo(() => {
    if (!data || !amount) return false;
    try {
      const amountBn = parseUnits(amount, USDT_DECIMALS);
      return data.usdtAllowance < amountBn;
    } catch {
      return true;
    }
  }, [data, amount]);

  // 检查余额是否充足
  const insufficientBalance = useMemo(() => {
    if (!data || !amount) return false;
    try {
      const amountBn = parseUnits(amount, USDT_DECIMALS);
      return data.usdtBalance < amountBn;
    } catch {
      return true;
    }
  }, [data, amount]);

  // 检查是否已绑定邀请人
  const isReferrerBound = data?.referralStats.inviterAddress !== "0x0000000000000000000000000000000000000000";

  // 当initialAmount改变时，更新投资金额
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  const handleApprove = async () => {
    // 如果未绑定邀请人，先显示绑定dialog
    if (!isReferrerBound) {
      setShowInviterDialog(true);
      return;
    }
    
    // 已绑定或用户选择跳过，直接执行授权
    await executeApprove();
  };

  const executeApprove = async () => {
    const success = await approveUSDT(amount);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleInviterDialogConfirm = async () => {
    setShowInviterDialog(false);
    // 刷新数据以获取最新的绑定状态
    await refreshData();
    // 执行授权
    await executeApprove();
  };

  const handleInviterDialogSkip = async () => {
    setShowInviterDialog(false);
    // 执行授权
    await executeApprove();
  };

  const handleDeposit = async () => {
    const success = await deposit(amount, parseInt(lockChoice) as 0 | 1 | 2);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const lockOptions = [
    { value: "0", label: t("staking.lockPeriodOptions.3months"), days: 90, apr: "50%" },
    { value: "1", label: t("staking.lockPeriodOptions.6months"), days: 180, apr: "120%" },
    { value: "2", label: t("staking.lockPeriodOptions.1year"), days: 365, apr: "280%" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("staking.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* 钱包状态 */}
        {data && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("staking.balance")}</p>
              <p className="text-sm sm:text-lg font-semibold">{formatAmount(data.usdtBalance)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("staking.allowance")}</p>
              <p className="text-sm sm:text-lg font-semibold">{formatAmount(data.usdtAllowance)}</p>
            </div>
          </div>
        )}

        {/* 投资金额 */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-sm sm:text-base font-medium">{t("staking.amount")}</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder={t("staking.amountPlaceholder")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 sm:pl-10 text-base sm:text-lg h-10 sm:h-11"
              min="200"
              step="1"
            />
          </div>
          {insufficientBalance && (
            <p className="text-xs sm:text-sm text-destructive">{t("staking.insufficientBalance")}</p>
          )}
        </div>

        {/* 锁仓期选择 */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-sm sm:text-base font-medium">{t("staking.lockPeriod")}</Label>
          <RadioGroup value={lockChoice} onValueChange={(v) => setLockChoice(v as "0" | "1" | "2")}>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {lockOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 sm:space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 flex items-center justify-between p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <div>
                        <div className="text-sm sm:text-base font-medium">{option.label}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{option.days} {t("dashboard.days")}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {t("staking.annualRate")} {option.apr}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* 收益预期 */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
            <Label className="text-sm sm:text-base font-medium">{t("staking.expectedReturns")}</Label>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">{t("staking.expectedTotalReturns")}</p>
              <p className="text-base sm:text-xl font-bold text-accent">
                +{stakingCalc.expectedEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">{t("staking.maturityAmount")}</p>
              <p className="text-base sm:text-xl font-bold text-primary">
                {stakingCalc.totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center text-xs text-muted-foreground">
            <div>{t("staking.annualRate")}: {stakingCalc.aprPercent}%</div>
            <div>{t("staking.lockDays")}: {stakingCalc.lockDays} {t("dashboard.days")}</div>
            <div>{t("staking.principal")}: {stakingCalc.principal.toLocaleString()} USDT</div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2 sm:space-y-3">
          {needApprove ? (
            <Button 
              onClick={handleApprove}
              disabled={loading.approve || insufficientBalance || !amount || Number(amount) < 200}
              className={`w-full h-10 sm:h-12 text-sm sm:text-lg bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow ${!isReferrerBound ? 'btn-shimmer btn-pulse animate-pulse' : 'btn-shimmer'}`}
            >
              {loading.approve ? t("staking.approving") : `${t("staking.approve")} ${amount} USDT`}
              {!isReferrerBound && (
                <span className="ml-1 sm:ml-2 text-xs opacity-80 hidden sm:inline">{t("staking.bindInviterReward")}</span>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleDeposit}
              disabled={loading.deposit || insufficientBalance || !amount || Number(amount) < 200}
              className="w-full h-10 sm:h-12 text-sm sm:text-lg bg-gradient-primary hover:bg-gradient-primary/90 btn-shimmer transition-all duration-300 hover:scale-[1.02] hover:shadow-glow"
            >
              {loading.deposit ? t("staking.staking") : `${t("staking.stake")} ${amount} USDT`}
            </Button>
          )}
          
          <div className="text-xs text-center text-muted-foreground space-y-0.5 sm:space-y-1">
            <p>{t("staking.minInvestment")}</p>
            <p>{t("staking.realtimeRewards")}</p>
            <p className="hidden sm:block">{t("staking.earlyWithdrawFee")}</p>
            <p className="hidden sm:block">{t("staking.auditedContract")}</p>
          </div>
        </div>

        {/* 邀请人绑定对话框 */}
        <InviterBindingDialog
          open={showInviterDialog}
          onOpenChange={setShowInviterDialog}
          onConfirm={handleInviterDialogConfirm}
          onSkip={handleInviterDialogSkip}
        />
      </CardContent>
    </Card>
  );
}