import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Trade({ embedded = false }: { embedded?: boolean }) {
  const [amount, setAmount] = useState([200]);
  const [selectedLock, setSelectedLock] = useState("3m");

  const lockOptions = [
    { value: "3m", label: "3个月", dailyApy: "0.20% – 0.35%" },
    { value: "6m", label: "6个月", dailyApy: "0.35% – 0.55%" },
    { value: "12m", label: "1年", dailyApy: "1%" },
  ];

  const calculateFees = (amount: number) => {
    return (amount * 0.01).toFixed(2);
  };

  const currentLock = lockOptions.find(opt => opt.value === selectedLock);

  const Title = (embedded ? 'h2' : 'h1') as any;
  const topPad = embedded ? "pt-6" : "pt-20";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      {!embedded && <Navbar />}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className={`${topPad} pb-10 relative z-10`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <Title className="text-3xl font-bold mb-2">AI资产管理策略</Title>
          <p className="text-muted-foreground">选择投资策略，享受AI驱动的收益</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Options */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  选择锁仓期限
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Lock Period Options */}
                  <RadioGroup value={selectedLock} onValueChange={setSelectedLock} className="grid grid-cols-3 gap-3">
                    {lockOptions.map((opt) => (
                      <label key={opt.value} htmlFor={opt.value} className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent/20">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">日APY {opt.dailyApy}</span>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {/* Amount Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">投资金额 (USDT)</label>
                      <span className="text-lg font-semibold">${amount[0].toLocaleString()}</span>
                    </div>
                    <Slider
                      value={amount}
                      onValueChange={setAmount}
                      max={50000}
                      min={200}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$200</span>
                      <span>$50,000</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[200, 1000, 5000, 10000].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount([quickAmount])}
                        className={amount[0] === quickAmount ? 'border-primary bg-primary/10' : ''}
                      >
                        ${quickAmount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Action */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  收益预览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">投资金额</span>
                  <span className="font-semibold">${amount[0].toLocaleString()}</span>
                </div>
                
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">锁仓期限</span>
                    <span className="font-semibold">{currentLock?.label}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">日APY</span>
                    <span className="font-semibold text-primary">{currentLock?.dailyApy}</span>
                  </div>

                  <hr className="border-border" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">管理费</span>
                    <span className="text-lg font-bold text-accent">
                      ${calculateFees(amount[0])}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">净投资额</span>
                    <span className="text-lg font-bold">
                      ${(amount[0] - parseFloat(calculateFees(amount[0]))).toLocaleString()}
                    </span>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Button className="w-full bg-gradient-primary mb-4" size="lg">
                  <DollarSign className="w-5 h-5 mr-2" />
                  开始投资
                </Button>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    资金由智能合约托管
                  </div>
                  <div>• 链上透明，收益来源可查</div>
                  <div>• 支持链上保险保障</div>
                  <div>• 无后门权限，资金安全</div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">平台优势</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <span>多链MEV套利，Base/Arbitrum/Solana</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>GPT-4驱动主流币轮动策略</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <span>DeFi结构化产品，stETH+USDe</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>链上保险保障，Nexus Mutual</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}