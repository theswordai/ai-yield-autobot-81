import { useState, useEffect, useCallback } from "react";
import { Contract, formatUnits } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import { USDT_ADDRESS, USDV_ADDRESS, USDV_DECIMALS, USDT_DECIMALS } from "@/config/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SELL_ROUND_ADDRESS = "0x4b44b7c48b61cee977fec245bb79b5c4779a284c";

const SELL_ROUND_ABI = [
  "function sell()",
  "function sellUsdvAmount() view returns (uint256)",
  "function sellPriceUsdtE18() view returns (uint256)",
  "function quoteUsdt() view returns (uint256)",
  "function currentRound() view returns (uint256)",
  "function usdtReserve() view returns (uint256)",
  "function canSell(address user) view returns (bool eligible, uint8 reason)",
  "function isWhitelisted(address user) view returns (bool)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

const REASON_TEXT: Record<number, string> = {
  1: "活动已暂停",
  2: "你本轮已经兑换过了",
  3: "你不在白名单内",
  4: "你的 USDV 余额不足",
  5: "兑换池 USDT 储备不足，请稍后再试",
};

const fmt = (wei: bigint, decimals = 18, digits = 4) => {
  const s = formatUnits(wei, decimals);
  const n = parseFloat(s);
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
};

export function DexSwap() {
  const { provider, signer, account, chainId } = useWeb3();

  const [sellUsdvAmount, setSellUsdvAmount] = useState<bigint>(0n);
  const [priceE18, setPriceE18] = useState<bigint>(0n);
  const [quote, setQuote] = useState<bigint>(0n);
  const [round, setRound] = useState<bigint>(0n);
  const [reserve, setReserve] = useState<bigint>(0n);
  const [usdvBalance, setUsdvBalance] = useState<bigint>(0n);
  const [usdtBalance, setUsdtBalance] = useState<bigint>(0n);
  const [eligible, setEligible] = useState<boolean>(false);
  const [reason, setReason] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const sellRound = new Contract(SELL_ROUND_ADDRESS, SELL_ROUND_ABI, provider);
      const usdv = new Contract(USDV_ADDRESS, ERC20_ABI, provider);
      const usdt = new Contract(USDT_ADDRESS, ERC20_ABI, provider);

      const [amt, price, q, r, res] = await Promise.all([
        sellRound.sellUsdvAmount(),
        sellRound.sellPriceUsdtE18(),
        sellRound.quoteUsdt(),
        sellRound.currentRound(),
        sellRound.usdtReserve(),
      ]);
      setSellUsdvAmount(amt);
      setPriceE18(price);
      setQuote(q);
      setRound(r);
      setReserve(res);

      if (account) {
        const [vBal, tBal, cs] = await Promise.all([
          usdv.balanceOf(account),
          usdt.balanceOf(account),
          sellRound.canSell(account),
        ]);
        setUsdvBalance(vBal);
        setUsdtBalance(tBal);
        setEligible(cs[0]);
        setReason(Number(cs[1]));
      } else {
        setEligible(false);
        setReason(0);
      }
    } catch (err) {
      console.error("Failed to load sell round data:", err);
    } finally {
      setLoading(false);
    }
  }, [provider, account]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 20000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const handleSell = async () => {
    if (!signer || !account) {
      toast.error("请先连接钱包");
      return;
    }
    if (chainId !== 56) {
      toast.error("请切换到 BSC 主网");
      return;
    }
    if (!eligible) {
      toast.error(REASON_TEXT[reason] || "暂时无法兑换");
      return;
    }

    try {
      // Step 1: approve if needed
      const usdv = new Contract(USDV_ADDRESS, ERC20_ABI, signer);
      const allowance: bigint = await usdv.allowance(account, SELL_ROUND_ADDRESS);
      if (allowance < sellUsdvAmount) {
        setApproveLoading(true);
        toast.info("正在授权 USDV...");
        const txA = await usdv.approve(SELL_ROUND_ADDRESS, sellUsdvAmount);
        await txA.wait();
        toast.success("授权成功");
        setApproveLoading(false);
      }

      // Step 2: sell
      setSellLoading(true);
      const sellRound = new Contract(SELL_ROUND_ADDRESS, SELL_ROUND_ABI, signer);
      const tx = await sellRound.sell();
      toast.info("兑换交易已提交...");
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success(`兑换成功！已获得 ${fmt(quote, USDT_DECIMALS, 4)} USDT`);
        fetchAll();
      } else {
        toast.error("交易失败");
      }
    } catch (err: any) {
      console.error("Sell failed:", err);
      if (err.message?.includes("user rejected")) {
        toast.error("用户取消交易");
      } else if (err.reason) {
        toast.error(`兑换失败: ${err.reason}`);
      } else {
        toast.error("兑换失败，请稍后重试");
      }
    } finally {
      setApproveLoading(false);
      setSellLoading(false);
    }
  };

  const priceDisplay = priceE18 > 0n
    ? parseFloat(formatUnits(priceE18, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "—";

  const busy = approveLoading || sellLoading;

  return (
    <div className="space-y-6">
      <Card className="hologram max-w-lg mx-auto border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        <CardContent className="space-y-4 pt-6">
          {/* From */}
          <div className="p-4 bg-secondary/40 backdrop-blur-sm rounded-xl space-y-2 border border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">支付</span>
              <span className="text-xs text-muted-foreground">
                余额: {fmt(usdvBalance, USDV_DECIMALS, 4)} USDV
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {fmt(sellUsdvAmount, USDV_DECIMALS, 4)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 border border-border/40">
                <img src="/usdv-logo.png" alt="USDV" className="h-5 w-5 rounded-full" />
                <span className="font-semibold">USDV</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
          </div>

          {/* To */}
          <div className="p-4 bg-secondary/40 backdrop-blur-sm rounded-xl space-y-2 border border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">获得</span>
              <span className="text-xs text-muted-foreground">
                余额: {fmt(usdtBalance, USDT_DECIMALS, 4)} USDT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {fmt(quote, USDT_DECIMALS, 4)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 border border-border/40">
                <img src={`https://tokens.pancakeswap.finance/images/${USDT_ADDRESS}.png`} alt="USDT" className="h-5 w-5 rounded-full" />
                <span className="font-semibold">USDT</span>
              </div>
            </div>
          </div>

          {/* Status / action */}
          {!account ? (
            <Button disabled className="w-full h-12 text-base font-semibold">请先连接钱包</Button>
          ) : !eligible ? (
            <Button disabled className="w-full h-12 text-base font-semibold">
              {REASON_TEXT[reason] || "暂时无法兑换"}
            </Button>
          ) : (
            <Button
              onClick={handleSell}
              disabled={busy}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {approveLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />正在授权...</>
              ) : sellLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />兑换中...</>
              ) : (
                `用 ${fmt(sellUsdvAmount, USDV_DECIMALS, 2)} USDV 兑换 ${fmt(quote, USDT_DECIMALS, 2)} USDT`
              )}
            </Button>
          )}

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            固定价格兑换，无滑点 · 每地址每轮限兑换 1 次 · 需在白名单内
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
