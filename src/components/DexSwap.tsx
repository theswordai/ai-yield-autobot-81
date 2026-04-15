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
  logo: string;
}

// BSC mainnet token addresses
const BTCB_ADDRESS = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const ETH_ADDRESS = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USD1_ADDRESS = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

const pancakeLogo = (addr: string) => `https://tokens.pancakeswap.finance/images/${addr}.png`;

const TOKENS: Record<string, TokenInfo> = {
  USDT: { address: USDT_ADDRESS, symbol: "USDT", decimals: USDT_DECIMALS, logo: pancakeLogo(USDT_ADDRESS) },
  USDV: { address: USDV_ADDRESS, symbol: "USDV", decimals: USDV_DECIMALS, logo: "/usdv-logo.png" },
  BNB:  { address: WBNB_ADDRESS, symbol: "BNB", decimals: 18, logo: pancakeLogo(WBNB_ADDRESS) },
  BTCB: { address: BTCB_ADDRESS, symbol: "BTCB", decimals: 18, logo: pancakeLogo(BTCB_ADDRESS) },
  ETH:  { address: ETH_ADDRESS, symbol: "ETH", decimals: 18, logo: pancakeLogo(ETH_ADDRESS) },
  USDC: { address: USDC_ADDRESS, symbol: "USDC", decimals: 18, logo: pancakeLogo(USDC_ADDRESS) },
  USD1: { address: USD1_ADDRESS, symbol: "USD1", decimals: 18, logo: pancakeLogo(USD1_ADDRESS) },
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
  const [rawToAmountWei, setRawToAmountWei] = useState<bigint>(BigInt(0));

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
        const rawOut = amounts[amounts.length - 1];
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
        return { outAmount, rawOut, actualRate, impact: Math.max(0, impact) };
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
          setRawToAmountWei(result.rawOut);
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
      setRawToAmountWei(result.rawOut);
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
      let amountIn = parseUnits(fromAmount, fromTokenInfo.decimals);

      if (fromToken !== "BNB") {
        try {
          const tokenContract = new Contract(fromTokenInfo.address, ERC20_APPROVE_ABI, signer);
          const balanceWei = await tokenContract.balanceOf(account);
          if (amountIn >= balanceWei && balanceWei > BigInt(1)) {
            amountIn = balanceWei - BigInt(1);
          }
        } catch {
          // Ignore balance refresh failure and use entered amount
        }
      }

      const minOut = rawToAmountWei * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000);
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
      
      // Add timeout to prevent infinite spinning
      const waitWithTimeout = (txPromise: Promise<any>, timeoutMs: number) => {
        return Promise.race([
          txPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs))
        ]);
      };

      try {
        const receipt = await waitWithTimeout(tx.wait(), 120000) as any;
        if (receipt.status === 1) {
          toast.success(`成功将 ${fromAmount} ${fromToken} 兑换为 ${toToken}！`);
          setFromAmount("");
          setToAmount("");
          fetchBalances();
        } else {
          toast.error("交易失败");
        }
      } catch (waitErr: any) {
        if (waitErr.message === "TIMEOUT") {
          toast.warning("交易已提交但确认超时，请在钱包或区块链浏览器中查看状态", { duration: 8000 });
          setFromAmount("");
          setToAmount("");
          fetchBalances();
        } else {
          throw waitErr;
        }
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
      {/* Main Swap Card */}
      <Card className="hologram max-w-lg mx-auto border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                <ArrowDownUp className="h-4 w-4 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
                DEX 兑换
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 hover:bg-primary/10"
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Slippage settings */}
          {showSettings && (
            <div className="p-3 bg-secondary/50 backdrop-blur-sm rounded-lg space-y-2 border border-border/50">
              <div className="text-sm font-medium text-foreground">滑点容差</div>
              <div className="flex gap-2 flex-wrap">
                {SLIPPAGE_OPTIONS.map((s) => (
                  <Button
                    key={s}
                    variant={slippage === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSlippage(s); setCustomSlippage(""); }}
                    className={`h-7 text-xs ${slippage === s ? "bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/50"}`}
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
                  className="h-7 w-20 text-xs bg-secondary/50"
                />
              </div>
              {slippage > 5 && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  高滑点可能导致不利成交价
                </div>
              )}
            </div>
          )}

          {/* From token */}
          <div className="p-4 bg-secondary/40 backdrop-blur-sm rounded-xl space-y-2 border border-border/30 hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">支付</span>
              <span className="text-xs text-muted-foreground">
                余额: {formatBalance(fromBalance)}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-2xl font-bold focus-visible:ring-0 p-0 h-auto text-foreground"
              />
              <button
                onClick={() => {
                  const options = tokenOptions.filter(t => t !== toToken);
                  const idx = options.indexOf(fromToken);
                  const next = options[(idx + 1) % options.length];
                  setFromToken(next);
                  setFromAmount("");
                  setToAmount("");
                }}
                className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary border border-border/50 hover:border-primary/30 rounded-full pl-2 pr-3 py-1.5 transition-all min-w-[120px]"
              >
                <img
                  src={fromTokenInfo.logo}
                  alt={fromToken}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <span className="text-sm font-bold text-foreground">{fromToken}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            </div>
            {/* Token quick select */}
            <div className="flex gap-1.5 flex-wrap pt-1">
              {tokenOptions.filter(t => t !== toToken).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFromToken(t);
                    setFromAmount("");
                    setToAmount("");
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    fromToken === t
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 border border-transparent"
                  }`}
                >
                  <img
                    src={TOKENS[t].logo}
                    alt={t}
                    className="w-3.5 h-3.5 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFlip}
              className="rounded-full h-10 w-10 border-2 border-primary/30 bg-background hover:bg-primary/10 hover:rotate-180 transition-all duration-300 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* To token */}
          <div className="p-4 bg-secondary/40 backdrop-blur-sm rounded-xl space-y-2 border border-border/30 hover:border-accent/20 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">获得</span>
              <span className="text-xs text-muted-foreground">
                余额: {formatBalance(toBalance)}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex-1 text-2xl font-bold min-h-[36px] flex items-center text-foreground">
                {quoteLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  toAmount ? formatBalance(toAmount) : <span className="text-muted-foreground/50">0.0</span>
                )}
              </div>
              <button
                onClick={() => {
                  const options = tokenOptions.filter(t => t !== fromToken);
                  const idx = options.indexOf(toToken);
                  const next = options[(idx + 1) % options.length];
                  setToToken(next);
                  setFromAmount("");
                  setToAmount("");
                }}
                className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary border border-border/50 hover:border-accent/30 rounded-full pl-2 pr-3 py-1.5 transition-all min-w-[120px]"
              >
                <img
                  src={toTokenInfo.logo}
                  alt={toToken}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <span className="text-sm font-bold text-foreground">{toToken}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            </div>
            {/* Token quick select */}
            <div className="flex gap-1.5 flex-wrap pt-1">
              {tokenOptions.filter(t => t !== fromToken).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setToToken(t);
                    setFromAmount("");
                    setToAmount("");
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    toToken === t
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 border border-transparent"
                  }`}
                >
                  <img
                    src={TOKENS[t].logo}
                    alt={t}
                    className="w-3.5 h-3.5 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Rate info */}
          {rate && (
            <div className="space-y-1.5 text-xs px-1 py-2 bg-secondary/20 rounded-lg border border-border/20">
              <div className="flex justify-between px-2">
                <span className="text-muted-foreground">汇率</span>
                <span className="text-foreground font-medium">1 {fromToken} ≈ {rate} {toToken}</span>
              </div>
              {priceImpact && (
                <div className="flex justify-between px-2">
                  <span className="text-muted-foreground">价格影响</span>
                  <span className={parseFloat(priceImpact) > 5 ? "text-destructive font-medium" : parseFloat(priceImpact) > 1 ? "text-primary font-medium" : "text-accent font-medium"}>
                    {priceImpact}%
                  </span>
                </div>
              )}
              <div className="flex justify-between px-2">
                <span className="text-muted-foreground">滑点容差</span>
                <span className="text-foreground">{slippage}%</span>
              </div>
              <div className="flex justify-between px-2">
                <span className="text-muted-foreground">最少获得</span>
                <span className="text-foreground">
                  {toAmount ? formatBalance((parseFloat(toAmount) * (1 - slippage / 100)).toString()) : "0"} {toToken}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!account ? (
            <Button className="w-full h-12 text-base font-bold btn-shimmer" disabled>
              请先连接钱包
            </Button>
          ) : needsApproval ? (
            <Button
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground btn-shimmer"
              onClick={handleApprove}
              disabled={approveLoading || !fromAmount}
            >
              {approveLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              授权 {fromToken}
            </Button>
          ) : (
            <Button
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] btn-shimmer"
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
              className="text-xs text-muted-foreground hover:text-primary"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              刷新报价
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DEX Info */}
      <Card className="max-w-lg mx-auto electric-border">
        <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">PancakeSwap V2</Badge>
            <span>BSC 主网 DEX 聚合</span>
          </div>
          <p>• 支持 USDT / USDV / BNB / BTCB / ETH / USDC / USD1 多路径兑换</p>
          <p>• 智能路由自动选择最优交易路径</p>
          <p>• 交易手续费 0.25%（PancakeSwap 标准费率）</p>
        </CardContent>
      </Card>
    </div>
  );
}
