import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useWeb3 } from "@/hooks/useWeb3";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpDown, ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { USDV_ADDRESS, USDT_ADDRESS, USDV_DECIMALS, USDT_DECIMALS } from "@/config/contracts";

const PANCAKE_ROUTER_V2 = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  icon: string;
  color: string;
}

const TOKENS: Record<string, TokenInfo> = {
  USDV: { symbol: "USDV", address: USDV_ADDRESS, decimals: USDV_DECIMALS, icon: "V", color: "from-blue-500 to-blue-600" },
  USDT: { symbol: "USDT", address: USDT_ADDRESS, decimals: USDT_DECIMALS, icon: "₮", color: "from-green-500 to-green-600" },
  BNB: { symbol: "BNB", address: WBNB_ADDRESS, decimals: 18, icon: "B", color: "from-yellow-500 to-yellow-600" },
};

const TOKEN_LIST = ["USDV", "USDT", "BNB"];

export function SwapInterface() {
  const { t } = useI18n();
  const { provider, account } = useWeb3();
  
  const [fromToken, setFromToken] = useState("USDV");
  const [toToken, setToToken] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromBalance, setFromBalance] = useState("0");
  const [toBalance, setToBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [priceImpact, setPriceImpact] = useState("< 0.01%");
  const [slippage, setSlippage] = useState(0.5);
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<"1H" | "1D" | "1W">("1H");

  // Mock chart data
  const chartData = [
    { h: 40, color: "bg-accent" }, { h: 55, color: "bg-accent" }, { h: 35, color: "bg-muted-foreground/40" },
    { h: 60, color: "bg-accent" }, { h: 45, color: "bg-muted-foreground/40" }, { h: 50, color: "bg-accent" },
    { h: 30, color: "bg-muted-foreground/40" }, { h: 70, color: "bg-accent" }, { h: 65, color: "bg-accent" },
    { h: 80, color: "bg-accent" }, { h: 55, color: "bg-accent" }, { h: 45, color: "bg-muted-foreground/40" },
  ];

  const fetchBalances = useCallback(async () => {
    if (!provider || !account) return;
    try {
      const signer = await provider.getSigner();
      for (const key of [fromToken, toToken]) {
        const token = TOKENS[key];
        if (key === "BNB") {
          const bal = await provider.getBalance(account);
          if (key === fromToken) setFromBalance(ethers.formatEther(bal));
          else setToBalance(ethers.formatEther(bal));
        } else {
          const contract = new ethers.Contract(token.address, ERC20_ABI, signer);
          const bal = await contract.balanceOf(account);
          const formatted = ethers.formatUnits(bal, token.decimals);
          if (key === fromToken) setFromBalance(formatted);
          else setToBalance(formatted);
        }
      }
    } catch {
      // silent
    }
  }, [provider, account, fromToken, toToken]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const getQuote = useCallback(async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0 || !provider) {
      setToAmount("");
      return;
    }
    setQuoting(true);
    try {
      const from = TOKENS[fromToken];
      const to = TOKENS[toToken];
      const router = new ethers.Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, provider);
      const amountIn = ethers.parseUnits(amount, from.decimals);
      
      let path: string[];
      if (fromToken === "BNB") {
        path = [WBNB_ADDRESS, to.address];
      } else if (toToken === "BNB") {
        path = [from.address, WBNB_ADDRESS];
      } else {
        // Try direct pair first, fallback to WBNB route
        path = [from.address, to.address];
      }
      
      const amounts = await router.getAmountsOut(amountIn, path);
      const outAmount = ethers.formatUnits(amounts[amounts.length - 1], to.decimals);
      setToAmount(parseFloat(outAmount).toFixed(6));
      setPriceImpact("< 0.01%");
    } catch {
      // Try via WBNB
      try {
        const from = TOKENS[fromToken];
        const to = TOKENS[toToken];
        const router = new ethers.Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, provider);
        const amountIn = ethers.parseUnits(amount, from.decimals);
        const path = [from.address, WBNB_ADDRESS, to.address];
        const amounts = await router.getAmountsOut(amountIn, path);
        const outAmount = ethers.formatUnits(amounts[amounts.length - 1], to.decimals);
        setToAmount(parseFloat(outAmount).toFixed(6));
        setPriceImpact("< 0.05%");
      } catch {
        setToAmount("--");
      }
    }
    setQuoting(false);
  }, [provider, fromToken, toToken]);

  useEffect(() => {
    const timer = setTimeout(() => { getQuote(fromAmount); }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, getQuote]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromBalance(toBalance);
    setToBalance(fromBalance);
  };

  const handleSwap = async () => {
    if (!provider || !account || !fromAmount || parseFloat(fromAmount) <= 0) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const from = TOKENS[fromToken];
      const to = TOKENS[toToken];
      const amountIn = ethers.parseUnits(fromAmount, from.decimals);
      
      // Approve if ERC20
      if (fromToken !== "BNB") {
        const tokenContract = new ethers.Contract(from.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(account, PANCAKE_ROUTER_V2);
        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(PANCAKE_ROUTER_V2, ethers.MaxUint256);
          toast.info(t("swap.approving") || "Approving...");
          await approveTx.wait();
        }
      }

      const router = new ethers.Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);
      let path: string[];
      if (fromToken === "BNB") path = [WBNB_ADDRESS, to.address];
      else if (toToken === "BNB") path = [from.address, WBNB_ADDRESS];
      else path = [from.address, to.address];

      const minOut = ethers.parseUnits(
        (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(to.decimals > 6 ? 6 : to.decimals),
        to.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      const tx = await router.swapExactTokensForTokens(amountIn, minOut, path, account, deadline);
      toast.info(t("swap.swapping") || "Swapping...");
      await tx.wait();
      toast.success(t("swap.success") || "Swap successful!");
      setFromAmount("");
      setToAmount("");
      fetchBalances();
    } catch (err: any) {
      const msg = err?.reason || err?.message || "Swap failed";
      toast.error(msg.slice(0, 100));
    }
    setLoading(false);
  };

  const selectToken = (key: string, isFrom: boolean) => {
    if (isFrom) {
      if (key === toToken) handleSwapTokens();
      else setFromToken(key);
      setShowFromSelect(false);
    } else {
      if (key === fromToken) handleSwapTokens();
      else setToToken(key);
      setShowToSelect(false);
    }
  };

  const formatBal = (b: string) => {
    const n = parseFloat(b);
    if (isNaN(n)) return "0.00";
    return n > 1000 ? n.toLocaleString("en", { maximumFractionDigits: 2 }) : n.toFixed(n < 1 ? 4 : 2);
  };

  const minReceived = toAmount && toAmount !== "--"
    ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(4)
    : "--";

  const usdValue = fromAmount ? `~$${parseFloat(fromAmount || "0").toLocaleString("en", { maximumFractionDigits: 2 })}` : "";

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Price Chart Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{TOKENS[fromToken].symbol} / {TOKENS[toToken].symbol}</span>
                <span className="text-accent">+2.45%</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {toAmount && toAmount !== "--" && fromAmount
                  ? (parseFloat(toAmount) / parseFloat(fromAmount || "1")).toFixed(4)
                  : "1.0000"}
              </div>
            </div>
            <div className="flex gap-1">
              {(["1H", "1D", "1W"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    chartPeriod === p
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {/* Mini Bar Chart */}
          <div className="flex items-end gap-1.5 h-20">
            {chartData.map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${bar.color} transition-all`}
                style={{ height: `${bar.h}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* You Pay */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("swap.youPay") || "YOU PAY"}</span>
            <span>Balance: {formatBal(fromBalance)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="bg-transparent text-3xl font-bold text-foreground outline-none w-full min-w-0"
            />
            <div className="relative">
              <button
                onClick={() => setShowFromSelect(!showFromSelect)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${TOKENS[fromToken].color} flex items-center justify-center text-xs font-bold text-white`}>
                  {TOKENS[fromToken].icon}
                </div>
                <span className="font-semibold text-foreground">{fromToken}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {showFromSelect && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
                  {TOKEN_LIST.map(tk => (
                    <button key={tk} onClick={() => selectToken(tk, true)}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-secondary/50 transition-colors text-sm">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${TOKENS[tk].color} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {TOKENS[tk].icon}
                      </div>
                      <span className="text-foreground">{tk}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {usdValue && <div className="text-sm text-muted-foreground">{usdValue}</div>}
        </CardContent>
      </Card>

      {/* Swap Direction Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwapTokens}
          className="p-2.5 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* You Receive */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("swap.youReceive") || "YOU RECEIVE"}</span>
            <span>Balance: {formatBal(toBalance)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-bold text-foreground min-w-0">
              {quoting ? <Loader2 className="h-6 w-6 animate-spin" /> : (toAmount || "0")}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowToSelect(!showToSelect)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${TOKENS[toToken].color} flex items-center justify-center text-xs font-bold text-white`}>
                  {TOKENS[toToken].icon}
                </div>
                <span className="font-semibold text-foreground">{toToken}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {showToSelect && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
                  {TOKEN_LIST.map(tk => (
                    <button key={tk} onClick={() => selectToken(tk, false)}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-secondary/50 transition-colors text-sm">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${TOKENS[tk].color} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {TOKENS[tk].icon}
                      </div>
                      <span className="text-foreground">{tk}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {toAmount && toAmount !== "--" && (
            <div className="text-sm text-muted-foreground">
              ~${parseFloat(toAmount || "0").toLocaleString("en", { maximumFractionDigits: 2 })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Swap Details */}
      {fromAmount && parseFloat(fromAmount) > 0 && (
        <div className="space-y-2 px-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Price Impact</span>
            <span className="text-foreground">{priceImpact}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Slippage Tolerance</span>
            <span className="text-foreground">{slippage}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Minimum Received</span>
            <span className="text-foreground">{minReceived} {toToken}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Network Fee</span>
            <span className="text-foreground">~$0.10</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={loading || !account || !fromAmount || parseFloat(fromAmount) <= 0 || toAmount === "--"}
        className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
        {!account
          ? (t("swap.connectWallet") || "Connect Wallet")
          : loading
            ? (t("swap.swapping") || "Swapping...")
            : (t("swap.swap") || "🔄 Swap")}
      </Button>
    </div>
  );
}
