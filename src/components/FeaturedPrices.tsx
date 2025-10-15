import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MiniKChart } from "@/components/MiniKChart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUSDVContracts } from "@/hooks/useUSDVContracts";
import { formatUnits } from "ethers";

type PriceData = {
  price: string;
  change24h: string;
  isPositive: boolean;
};

export function FeaturedPrices() {
  const [usdvData, setUsdvData] = useState<PriceData | null>(null);
  const [btcData, setBtcData] = useState<PriceData | null>(null);
  const [usdvBalance, setUsdvBalance] = useState<bigint>(BigInt(0));
  
  const { account } = useWeb3();
  const { contracts } = useUSDVContracts();

  const fetchPrices = async () => {
    try {
      // Fetch USDV from GeckoTerminal
      const usdvRes = await fetch(
        "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x9a88bdcf549c0ae0ddb675abb22680673010bdb0"
      );
      if (usdvRes.ok) {
        const usdvJson = await usdvRes.json();
        const attributes = usdvJson.data?.attributes;
        if (attributes) {
          const price = parseFloat(attributes.base_token_price_usd);
          const change = parseFloat(attributes.price_change_percentage?.h24 || "0");
          setUsdvData({
            price: price.toFixed(4),
            change24h: change.toFixed(2),
            isPositive: change >= 0,
          });
        }
      }

      // Fetch BTC from CoinGecko
      const btcRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
      );
      if (btcRes.ok) {
        const btcJson = await btcRes.json();
        const btcInfo = btcJson.bitcoin;
        if (btcInfo) {
          setBtcData({
            price: new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(btcInfo.usd),
            change24h: btcInfo.usd_24h_change.toFixed(2),
            isPositive: btcInfo.usd_24h_change >= 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  };

  // Fetch USDV balance when account or contracts change
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && contracts) {
        try {
          const balance = await contracts.usdv.balanceOf(account);
          setUsdvBalance(balance);
        } catch (error) {
          console.error("Failed to fetch USDV balance:", error);
        }
      } else {
        setUsdvBalance(BigInt(0));
      }
    };
    
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [account, contracts]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBalance = (balance: bigint) => {
    const formatted = formatUnits(balance, 18);
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateUsdValue = () => {
    if (!usdvData) return "0.00";
    const balance = parseFloat(formatUnits(usdvBalance, 18));
    const value = balance * parseFloat(usdvData.price);
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* USDV Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm text-muted-foreground font-medium mb-1">USDV Token</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${usdvData?.price || "0.0100"}
              </span>
              {usdvData && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  usdvData.isPositive ? "text-accent" : "text-primary"
                }`}>
                  {usdvData.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{usdvData.isPositive ? "+" : ""}{usdvData.change24h}%</span>
                </div>
              )}
            </div>
            
            {account && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Your Balance</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatBalance(usdvBalance)} USDV
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ ${calculateUsdValue()}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-24">
          <MiniKChart color="hsl(var(--primary))" />
        </div>
      </Card>

      {/* BTC Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Bitcoin</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${btcData?.price || "--"}
              </span>
              {btcData && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  btcData.isPositive ? "text-accent" : "text-primary"
                }`}>
                  {btcData.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{btcData.isPositive ? "+" : ""}{btcData.change24h}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-24">
          <MiniKChart color="hsl(var(--accent))" />
        </div>
      </Card>
    </div>
  );
}
