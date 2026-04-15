import { useState, useEffect, useCallback } from "react";
import { Contract, parseUnits, formatUnits, MaxUint256 } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { useI18n } from "@/hooks/useI18n";
import { PANCAKE_ROUTER_ABI, ERC20_APPROVE_ABI, PANCAKE_ROUTER_ADDRESS, WBNB_ADDRESS } from "@/abis/PancakeRouter";
import { USDT_ADDRESS, USDV_ADDRESS, USDT_DECIMALS, USDV_DECIMALS } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowDownUp, AlertTriangle, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

const TOKENS: Record<string, TokenInfo> = {
  USDT: { address: USDT_ADDRESS, symbol: "USDT", decimals: USDT_DECIMALS },
  USDV: { address: USDV_ADDRESS, symbol: "USDV", decimals: USDV_DECIMALS },
  BNB: { address: WBNB_ADDRESS, symbol: "BNB", decimals: 18 },
};

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0];

export function DexSwap() {
  const { t } = useI18n();
  const { provider, signer, account, chainId } = useWeb3();

  const [fromToken, setFromToken] = useState<string>("USDT");
  const [toToken, setToToken] = useState<string>("USDV");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");

  const [fromBalance, setFromBalance] = useState("0");
  const [toBalance, setToBalance] = useState("0");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string | null>(null);
  const [rate, setRate] = useState<string | null>(null);

  const fromTokenInfo = TOKENS[fromToken];
  const toTokenInfo = TOKENS[toToken];

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!provider || !account) return;

    try {
      const fetchTokenBalance = async (token: TokenInfo) => {
        if (token.symbol === "BNB") {
          const bal = await provider.getBalance(account);
          return formatUnits(bal, 18);
        }
        const contract = new Contract(token.address, ERC20_APPROVE_ABI, provider);
        const bal = await contract.balanceOf(account);
        return formatUnits(bal, token.decimals);
      };

      const [fromBal, toBal] = await Promise.all([
        fetchTokenBalance(fromTokenInfo),
        fetchTokenBalance(toTokenInfo),
      ]);

      setFromBalance(fromBal);
      setToBalance(toBal);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  }, [provider, account, fromTokenInfo, toTokenInfo]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  // Check allowance
  const checkAllowance = useCallback(async () => {
    if (!provider || !account || !fromAmount || fromToken === "BNB") {
      setNeedsApproval(false);
      return;
    }

    try {
      const contract = new Contract(fromTokenInfo.address, ERC20_APPROVE_ABI, provider);
      const allowance = await contract.allowance(account, PANCAKE_ROUTER_ADDRESS);
      const amountWei = parseUnits(fromAmount || "0", fromTokenInfo.decimals);
      setNeedsApproval(allowance < amountWei);
    } catch {
      setNeedsApproval(true);
    }
  }, [provider, account, fromAmount, fromToken, fromTokenInfo]);

  useEffect(() => {
    checkAllowance();
  }, [checkAllowance]);

  // Get quote
  const getQuote = useCallback(async (inputAmount: string) => {
    if (!provider || !inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount("");
      setRate(null);
      setPriceImpact(null);
      return;
    }

    try {
      setQuoteLoading(true);
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, provider);
      const amountIn = parseUnits(inputAmount, fromTokenInfo.decimals);

      // Helper to get quote and compute impact for a given path
      const getQuoteForPath = async (path: string[]) => {
        // Get actual quote
        const amounts = await router.getAmountsOut(amountIn, path);
        const outAmount = formatUnits(amounts[amounts.length - 1], toTokenInfo.decimals);
        const actualRate = parseFloat(outAmount) / parseFloat(inputAmount);

        // Get base rate with 1 unit for price impact calculation
        const baseAmountIn = parseUnits("1", fromTokenInfo.decimals);
        let baseRate = actualRate;
        try {
          const baseAmounts = await router.getAmountsOut(baseAmountIn, path);
          const baseOut = formatUnits(baseAmounts[baseAmounts.length - 1], toTokenInfo.decimals);
          baseRate = parseFloat(baseOut);
        } catch {
          // If base query fails, assume no impact
        }

        const impact = baseRate > 0 ? ((baseRate - actualRate) / baseRate) * 100 : 0;
        return { outAmount, actualRate, impact: Math.max(0, impact) };
      };

      // Build path
      let path: string[];
      if (fromToken === "BNB") {
        path = [WBNB_ADDRESS, toTokenInfo.address];
      } else if (toToken === "BNB") {
        path = [fromTokenInfo.address, WBNB_ADDRESS];
      } else {
        // Try direct path first, fallback to WBNB-routed
        try {
          const result = await getQuoteForPath([fromTokenInfo.address, toTokenInfo.address]);
          setToAmount(result.outAmount);
          setRate(result.actualRate.toFixed(6));
          setPriceImpact(result.impact < 0.01 ? "<0.01" : result.impact.toFixed(2));
          setQuoteLoading(false);
          return;
        } catch {
          path = [fromTokenInfo.address, WBNB_ADDRESS, toTokenInfo.address];
        }
      }

      const result = await getQuoteForPath(path);
      setToAmount(result.outAmount);
      setRate(result.actualRate.toFixed(6));
      setPriceImpact(result.impact < 0.01 ? "<0.01" : result.impact.toFixed(2));
    } catch (err) {
      console.error("Quote error:", err);
      setToAmount("");
      setRate(null);
      setPriceImpact(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [provider, fromToken, toToken, fromTokenInfo, toTokenInfo]);

  // Debounce quote
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount) getQuote(fromAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, getQuote]);

  // Swap tokens direction
  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Approve
  const handleApprove = async () => {
    if (!signer || !account) {
      toast.error("请先连接钱包");
      return;
    }

    try {
      setApproveLoading(true);
      const tokenContract = new Contract(fromTokenInfo.address, ERC20_APPROVE_ABI, signer);
      const tx = await tokenContract.approve(PANCAKE_ROUTER_ADDRESS, MaxUint256);
      toast.info("授权交易已提交...");
      await tx.wait();
      toast.success("授权成功！");
      setNeedsApproval(false);
    } catch (err: any) {
      console.error("Approve failed:", err);
      if (err.message?.includes("user rejected")) {
        toast.error("用户取消授权");
      } else {
        toast.error("授权失败");
      }
    } finally {
      setApproveLoading(false);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!signer || !account || !fromAmount || !toAmount) {
      toast.error("请先连接钱包并输入金额");
      return;
    }

    if (chainId !== 56) {
      toast.error("请切换到 BSC 主网");
      return;
    }

    try {
      setSwapLoading(true);
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer);
      const amountIn = parseUnits(fromAmount, fromTokenInfo.decimals);
      const minOut = parseUnits(toAmount, toTokenInfo.decimals) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      let tx;

      if (fromToken === "BNB") {
        // BNB -> Token
        const path = [WBNB_ADDRESS, toTokenInfo.address];
        tx = await router.swapExactETHForTokens(minOut, path, account, deadline, { value: amountIn });
      } else if (toToken === "BNB") {
        // Token -> BNB
        const path = [fromTokenInfo.address, WBNB_ADDRESS];
        tx = await router.swapExactTokensForETH(amountIn, minOut, path, account, deadline);
      } else {
        // Token -> Token: try direct, fallback via WBNB
        let path: string[];
        try {
          const testRouter = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, provider!);
          await testRouter.getAmountsOut(amountIn, [fromTokenInfo.address, toTokenInfo.address]);
          path = [fromTokenInfo.address, toTokenInfo.address];
        } catch {
          path = [fromTokenInfo.address, WBNB_ADDRESS, toTokenInfo.address];
        }
        tx = await router.swapExactTokensForTokens(amountIn, minOut, path, account, deadline);
      }

      toast.info("兑换交易已提交...");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`成功将 ${fromAmount} ${fromToken} 兑换为 ${toToken}！`);
        setFromAmount("");
        setToAmount("");
        fetchBalances();
      } else {
        toast.error("交易失败");
      }
    } catch (err: any) {
      console.error("Swap failed:", err);
      if (err.message?.includes("user rejected")) {
        toast.error("用户取消交易");
      } else if (err.reason) {
        toast.error(`兑换失败: ${err.reason}`);
      } else {
        toast.error("兑换失败，请检查流动性或滑点设置");
      }
    } finally {
      setSwapLoading(false);
    }
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    if (num < 1) return num.toFixed(4);
    if (num < 10000) return num.toFixed(2);
    return Math.floor(num).toLocaleString();
  };

  const tokenOptions = Object.keys(TOKENS);

  return (
    <div className="space-y-6">
      <Card className="cyberpunk-card data-stream max-w-lg mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ArrowDownUp className="h-5 w-5 text-cyan-400" />
              DEX 兑换
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Slippage settings */}
          {showSettings && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">滑点容差</div>
              <div className="flex gap-2 flex-wrap">
                {SLIPPAGE_OPTIONS.map((s) => (
                  <Button
                    key={s}
                    variant={slippage === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSlippage(s); setCustomSlippage(""); }}
                    className="h-7 text-xs"
                  >
                    {s}%
                  </Button>
                ))}
                <Input
                  type="number"
                  placeholder="自定义"
                  value={customSlippage}
                  onChange={(e) => {
                    setCustomSlippage(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (val > 0 && val <= 50) setSlippage(val);
                  }}
                  className="h-7 w-20 text-xs"
                />
              </div>
              {slippage > 5 && (
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  高滑点可能导致不利成交价
                </div>
              )}
            </div>
          )}

          {/* From token */}
          <div className="p-4 bg-muted/30 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">支付</span>
              <span className="text-xs text-muted-foreground">
                余额: {formatBalance(fromBalance)}
                <button
                  className="ml-1 text-primary hover:underline"
                  onClick={() => setFromAmount(fromBalance)}
                >
                  MAX
                </button>
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-2xl font-semibold focus-visible:ring-0 p-0 h-auto"
              />
              <select
                value={fromToken}
                onChange={(e) => {
                  const newFrom = e.target.value;
                  if (newFrom === toToken) setToToken(fromToken);
                  setFromToken(newFrom);
                  setFromAmount("");
                  setToAmount("");
                }}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm font-semibold min-w-[90px]"
              >
                {tokenOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFlip}
              className="rounded-full h-10 w-10 border-2 bg-background hover:rotate-180 transition-transform duration-300"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To token */}
          <div className="p-4 bg-muted/30 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">获得</span>
              <span className="text-xs text-muted-foreground">
                余额: {formatBalance(toBalance)}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 text-2xl font-semibold min-h-[36px] flex items-center">
                {quoteLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  toAmount ? formatBalance(toAmount) : <span className="text-muted-foreground">0.0</span>
                )}
              </div>
              <select
                value={toToken}
                onChange={(e) => {
                  const newTo = e.target.value;
                  if (newTo === fromToken) setFromToken(toToken);
                  setToToken(newTo);
                  setFromAmount("");
                  setToAmount("");
                }}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm font-semibold min-w-[90px]"
              >
                {tokenOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate info */}
          {rate && (
            <div className="space-y-1 text-xs text-muted-foreground px-1">
              <div className="flex justify-between">
                <span>汇率</span>
                <span>1 {fromToken} ≈ {rate} {toToken}</span>
              </div>
              {priceImpact && (
                <div className="flex justify-between">
                  <span>价格影响</span>
                  <span className={parseFloat(priceImpact) > 5 ? "text-red-500" : parseFloat(priceImpact) > 1 ? "text-yellow-500" : "text-green-500"}>
                    {priceImpact}%
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>滑点容差</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span>最少获得</span>
                <span>
                  {toAmount ? formatBalance((parseFloat(toAmount) * (1 - slippage / 100)).toString()) : "0"} {toToken}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Action buttons */}
          {!account ? (
            <Button className="w-full" disabled>
              请先连接钱包
            </Button>
          ) : needsApproval ? (
            <Button
              className="w-full"
              onClick={handleApprove}
              disabled={approveLoading || !fromAmount}
            >
              {approveLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              授权 {fromToken}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleSwap}
              disabled={swapLoading || !fromAmount || !toAmount || parseFloat(fromAmount) <= 0}
            >
              {swapLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              兑换
            </Button>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { fetchBalances(); if (fromAmount) getQuote(fromAmount); }}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              刷新报价
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DEX Info */}
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">PancakeSwap V2</Badge>
            <span>BSC 主网 DEX 聚合</span>
          </div>
          <p>• 支持 USDV ⇄ USDT ⇄ BNB 多路径兑换</p>
          <p>• 智能路由自动选择最优交易路径</p>
          <p>• 交易手续费 0.25%（PancakeSwap 标准费率）</p>
        </CardContent>
      </Card>
    </div>
  );
}
