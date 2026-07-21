import { useEffect, useMemo, useState, useCallback } from "react";
import { Contract, formatUnits } from "ethers";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Wallet, Lock, TrendingUp, Gift, ShieldCheck, Copy } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useI18n } from "@/hooks/useI18n";
import { WalletConnector } from "@/components/WalletConnector";
import { PageWrapper } from "@/components/PageWrapper";
import { getReadProvider } from "@/lib/rpcClient";
import {
  BULL_ADDRESS,
  BULL_VESTING_ADDRESS,
  BULL_MIGRATION_ADDRESS,
  BULL_USDT_ADDRESS,
  PANCAKE_FACTORY_ADDRESS,
  BULL_VESTING_DURATION_SECONDS,
  BULL_INSTANT_PCT,
} from "@/config/bull";
import {
  BULL_ERC20_ABI,
  BULL_MIGRATION_ABI,
  BULL_VESTING_ABI,
  PANCAKE_FACTORY_ABI,
  PANCAKE_PAIR_ABI,
} from "@/abis/Bull";

type MerkleEntry = { address: string; entitlement: string; proof: string[] };
type MerkleFile = { root: string; count: number; proofs: MerkleEntry[] };

const fmt = (v: bigint | number, decimals = 18, digits = 4) => {
  try {
    const s = formatUnits(typeof v === "bigint" ? v : BigInt(v), decimals);
    const n = Number(s);
    if (!isFinite(n)) return "0";
    if (n === 0) return "0";
    if (n < 0.0001) return n.toExponential(2);
    return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  } catch {
    return "0";
  }
};

const shortHash = (h?: string) => (h ? `${h.slice(0, 6)}...${h.slice(-4)}` : "");

export default function Bull() {
  const { language } = useI18n();
  const zh = language === "zh";
  const { account, signer, chainId } = useWeb3();

  const [merkle, setMerkle] = useState<MerkleFile | null>(null);
  const [merkleErr, setMerkleErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<"migrate" | "claim" | null>(null);

  // On-chain state
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const [migrationPaused, setMigrationPaused] = useState<boolean>(false);
  const [vestingPaused, setVestingPaused] = useState<boolean>(false);
  const [vestTotal, setVestTotal] = useState<bigint>(0n);
  const [vestClaimed, setVestClaimed] = useState<bigint>(0n);
  const [vestStart, setVestStart] = useState<bigint>(0n);
  const [vestedAmount, setVestedAmount] = useState<bigint>(0n);
  const [claimable, setClaimable] = useState<bigint>(0n);
  const [bullBalance, setBullBalance] = useState<bigint>(0n);
  const [priceUsdt, setPriceUsdt] = useState<number | null>(null);
  const [pairAddress, setPairAddress] = useState<string | null>(null);

  // Load merkle file once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/bull-merkle.json", { cache: "force-cache" });
        if (!res.ok) throw new Error("failed to fetch merkle");
        const j: MerkleFile = await res.json();
        setMerkle(j);
      } catch (e: any) {
        setMerkleErr(e?.message || "merkle load failed");
      }
    })();
  }, []);

  // Look up entry for connected wallet
  const entry: MerkleEntry | null = useMemo(() => {
    if (!merkle || !account) return null;
    const lc = account.toLowerCase();
    return (
      merkle.proofs.find((p) => p.address.toLowerCase() === lc) || null
    );
  }, [merkle, account]);

  const entitlementWei: bigint = useMemo(() => {
    if (!entry) return 0n;
    try {
      return BigInt(entry.entitlement);
    } catch {
      return 0n;
    }
  }, [entry]);

  // Read chain state
  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const provider = getReadProvider();
      const migration = new Contract(BULL_MIGRATION_ADDRESS, BULL_MIGRATION_ABI, provider);
      const vesting = new Contract(BULL_VESTING_ADDRESS, BULL_VESTING_ABI, provider);
      const bull = new Contract(BULL_ADDRESS, BULL_ERC20_ABI, provider);
      const factory = new Contract(PANCAKE_FACTORY_ADDRESS, PANCAKE_FACTORY_ABI, provider);

      const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
        try { return await p; } catch { return fallback; }
      };

      const [migrated, mPaused, vPaused, vestsRes, vested, claim, bal, pair] = await Promise.all([
        safe<boolean>(migration.hasMigrated(account), false),
        safe<boolean>(migration.paused(), false),
        safe<boolean>(vesting.paused(), false),
        safe<any>(vesting.vests(account), [0n, 0n, 0n]),
        safe<bigint>(vesting.vestedAmount(account), 0n),
        safe<bigint>(vesting.claimable(account), 0n),
        safe<bigint>(bull.balanceOf(account), 0n),
        safe<string>(factory.getPair(BULL_ADDRESS, BULL_USDT_ADDRESS), ""),
      ]);

      setHasMigrated(!!migrated);
      setMigrationPaused(!!mPaused);
      setVestingPaused(!!vPaused);
      setVestTotal(BigInt(vestsRes[0] ?? 0n));
      setVestClaimed(BigInt(vestsRes[1] ?? 0n));
      setVestStart(BigInt(vestsRes[2] ?? 0n));
      setVestedAmount(BigInt(vested ?? 0n));
      setClaimable(BigInt(claim ?? 0n));
      setBullBalance(BigInt(bal ?? 0n));

      if (pair && pair !== "0x0000000000000000000000000000000000000000") {
        setPairAddress(pair);
        try {
          const pairC = new Contract(pair, PANCAKE_PAIR_ABI, provider);
          const [t0, reserves] = await Promise.all([
            pairC.token0() as Promise<string>,
            pairC.getReserves() as Promise<any>,
          ]);
          const r0 = BigInt(reserves[0]);
          const r1 = BigInt(reserves[1]);
          const bullIsToken0 = t0.toLowerCase() === BULL_ADDRESS.toLowerCase();
          const rBull = bullIsToken0 ? r0 : r1;
          const rUsdt = bullIsToken0 ? r1 : r0;
          if (rBull > 0n) {
            const price = Number(formatUnits(rUsdt, 18)) / Number(formatUnits(rBull, 18));
            setPriceUsdt(price);
          } else {
            setPriceUsdt(null);
          }
        } catch {
          setPriceUsdt(null);
        }
      } else {
        setPairAddress(null);
        setPriceUsdt(null);
      }
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // Derived values
  const remainingLocked = useMemo(() => {
    // total - vestedAmount = still locked; claimable is vested - claimed; remaining unlocked over time = total - vested
    if (vestTotal === 0n) return 0n;
    if (vestedAmount >= vestTotal) return 0n;
    return vestTotal - vestedAmount;
  }, [vestTotal, vestedAmount]);

  const unlockedPct = useMemo(() => {
    if (vestTotal === 0n) return 0;
    const pct = Number((vestedAmount * 10000n) / vestTotal) / 100;
    return Math.min(100, Math.max(0, pct));
  }, [vestTotal, vestedAmount]);

  const fullyUnlockedAt = useMemo(() => {
    if (vestStart === 0n) return null;
    const ts = Number(vestStart) + BULL_VESTING_DURATION_SECONDS;
    return new Date(ts * 1000);
  }, [vestStart]);

  const daily = useMemo(() => {
    if (vestTotal === 0n) return 0n;
    // linear rate per day
    return (vestTotal * BigInt(86400)) / BigInt(BULL_VESTING_DURATION_SECONDS);
  }, [vestTotal]);

  const priceValue = (amt: bigint) => {
    if (!priceUsdt) return null;
    return Number(formatUnits(amt, 18)) * priceUsdt;
  };

  const usd = (v: number | null) =>
    v == null ? "—" : `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // Actions
  const requireBSC = useCallback(async () => {
    if (chainId !== 56) {
      toast.error(zh ? "请切换到 BNB Smart Chain (BSC)" : "Please switch to BNB Smart Chain (BSC)");
      return false;
    }
    return true;
  }, [chainId, zh]);

  const handleMigrate = async () => {
    if (!signer || !account) {
      toast.error(zh ? "请先连接钱包" : "Please connect wallet");
      return;
    }
    if (!(await requireBSC())) return;
    if (!entry) {
      toast.error(zh ? "当前地址不在白名单" : "Address not whitelisted");
      return;
    }
    if (migrationPaused) {
      toast.error(zh ? "兑换合约已暂停" : "Migration is paused");
      return;
    }
    setPending("migrate");
    try {
      const c = new Contract(BULL_MIGRATION_ADDRESS, BULL_MIGRATION_ABI, signer);
      const tx = await c.migrate(entitlementWei, entry.proof);
      toast.info(zh ? "兑换交易已发送，等待确认..." : "Migrate tx submitted, waiting...");
      await tx.wait();
      toast.success(zh ? "兑换成功！已收到 3% BULL，其余进入线性解锁" : "Migrated! 3% BULL received, rest vesting linearly");
      await refresh();
    } catch (e: any) {
      const msg = e?.shortMessage || e?.reason || e?.message || "Migrate failed";
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  const handleClaim = async () => {
    if (!signer || !account) {
      toast.error(zh ? "请先连接钱包" : "Please connect wallet");
      return;
    }
    if (!(await requireBSC())) return;
    if (claimable === 0n) {
      toast.error(zh ? "当前暂无可领取额度" : "Nothing to claim right now");
      return;
    }
    setPending("claim");
    try {
      const c = new Contract(BULL_VESTING_ADDRESS, BULL_VESTING_ABI, signer);
      const tx = await c.claim();
      toast.info(zh ? "领取交易已发送..." : "Claim tx submitted...");
      await tx.wait();
      toast.success(zh ? "领取成功！" : "Claimed!");
      await refresh();
    } catch (e: any) {
      const msg = e?.shortMessage || e?.reason || e?.message || "Claim failed";
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  const copyAddr = (a: string) => {
    navigator.clipboard.writeText(a);
    toast.success(zh ? "已复制" : "Copied");
  };

  const bscLink = (a: string) => `https://bscscan.com/address/${a}`;

  const isWhitelisted = !!entry;
  const canMigrate = isWhitelisted && !hasMigrated && !migrationPaused;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-orange-500/30">
                B
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {zh ? "BULL 领取中心" : "BULL Claim Center"}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {zh
                    ? "白名单地址可兑换 BULL，即时到账 3%，其余 97% 线性解锁 36 个月"
                    : "Whitelisted wallets can migrate to BULL — 3% instant, 97% vests linearly over 36 months"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WalletConnector />
          </div>
        </div>

        {/* Status banners */}
        {!account && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-5 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary" />
              <p className="text-sm">
                {zh ? "请连接钱包以查看您的领取资格与锁仓情况。" : "Connect your wallet to check eligibility and vesting."}
              </p>
            </CardContent>
          </Card>
        )}

        {account && merkleErr && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-4 text-sm text-destructive">
              {zh ? "白名单数据加载失败：" : "Whitelist load failed: "}
              {merkleErr}
            </CardContent>
          </Card>
        )}

        {account && !merkleErr && merkle && !isWhitelisted && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="py-4 text-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-amber-500" />
              <div>
                <div className="font-semibold text-amber-600 dark:text-amber-400">
                  {zh ? "当前地址不符合领取条件" : "Address not eligible"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {shortHash(account)} {zh ? "不在 BULL 兑换白名单中。" : "is not in the BULL migration whitelist."}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {account && chainId != null && chainId !== 56 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="py-4 text-sm text-amber-600 dark:text-amber-400">
              {zh ? "当前网络不是 BSC 主网，操作前请切换到 BNB Smart Chain。" : "Wrong network — please switch to BNB Smart Chain to interact."}
            </CardContent>
          </Card>
        )}

        {/* Eligibility & entitlement */}
        {account && isWhitelisted && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                {zh ? "我的额度" : "My Entitlement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat
                label={zh ? "总额度 (BULL)" : "Total (BULL)"}
                value={fmt(entitlementWei)}
                sub={usd(priceValue(entitlementWei))}
              />
              <Stat
                label={zh ? "钱包余额" : "Wallet Balance"}
                value={fmt(bullBalance)}
                sub={usd(priceValue(bullBalance))}
              />
              <Stat
                label={zh ? "已领取 (Vesting)" : "Claimed (Vesting)"}
                value={fmt(vestClaimed)}
                sub={usd(priceValue(vestClaimed))}
              />
              <Stat
                label={zh ? "当前可领" : "Claimable Now"}
                value={fmt(claimable)}
                sub={usd(priceValue(claimable))}
                highlight
              />
            </CardContent>
          </Card>
        )}

        {/* Vesting details */}
        {account && isWhitelisted && hasMigrated && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                {zh ? "锁仓解锁进度" : "Vesting Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{zh ? "已解锁" : "Unlocked"} {unlockedPct.toFixed(2)}%</span>
                  <span>
                    {fmt(vestedAmount)} / {fmt(vestTotal)} BULL
                  </span>
                </div>
                <Progress value={unlockedPct} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Stat
                  label={zh ? "锁仓总量" : "Vesting Total"}
                  value={fmt(vestTotal)}
                  sub={usd(priceValue(vestTotal))}
                />
                <Stat
                  label={zh ? "剩余未解锁" : "Still Locked"}
                  value={fmt(remainingLocked)}
                  sub={usd(priceValue(remainingLocked))}
                />
                <Stat
                  label={zh ? "预计 24h 新增可领" : "Est. 24h Unlock"}
                  value={fmt(daily)}
                  sub={usd(priceValue(daily))}
                />
              </div>

              <div className="text-xs text-muted-foreground border-t border-border pt-3 space-y-1">
                <div>
                  {zh ? "开始时间：" : "Start: "}
                  {vestStart > 0n
                    ? new Date(Number(vestStart) * 1000).toLocaleString()
                    : "—"}
                </div>
                <div>
                  {zh ? "完全解锁：" : "Fully unlocked: "}
                  {fullyUnlockedAt ? fullyUnlockedAt.toLocaleString() : "—"}
                </div>
                <div>
                  {zh ? "当前 BULL 价格：" : "BULL price: "}
                  {priceUsdt != null
                    ? `${priceUsdt.toLocaleString(undefined, { maximumFractionDigits: 8 })} USDT`
                    : "—"}
                  {pairAddress && (
                    <a
                      href={bscLink(pairAddress)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
                    >
                      {zh ? "查看 Pair" : "View Pair"} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {account && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {zh ? "操作" : "Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-3">
              {!hasMigrated ? (
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!canMigrate || pending !== null || loading}
                  onClick={handleMigrate}
                >
                  {pending === "migrate" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{zh ? "兑换中..." : "Migrating..."}</>
                  ) : (
                    <>{zh ? `兑换 BULL（立即 ${BULL_INSTANT_PCT}%）` : `Migrate BULL (${BULL_INSTANT_PCT}% instant)`}</>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={claimable === 0n || pending !== null || vestingPaused || loading}
                  onClick={handleClaim}
                >
                  {pending === "claim" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{zh ? "领取中..." : "Claiming..."}</>
                  ) : claimable > 0n ? (
                    <>{zh ? `领取解锁 ${fmt(claimable)} BULL` : `Claim ${fmt(claimable)} BULL`}</>
                  ) : (
                    <>{zh ? `暂无可领（已解锁 ${unlockedPct.toFixed(2)}%）` : `Nothing to claim (${unlockedPct.toFixed(2)}% unlocked)`}</>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={refresh}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (zh ? "刷新" : "Refresh")}
              </Button>
              {hasMigrated && (
                <Badge variant="secondary" className="self-center px-3 py-1.5">
                  {zh ? "已兑换" : "Migrated"}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contracts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{zh ? "合约地址" : "Contracts"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <ContractRow label="BULL" addr={BULL_ADDRESS} onCopy={copyAddr} />
            <ContractRow label="Vesting" addr={BULL_VESTING_ADDRESS} onCopy={copyAddr} />
            <ContractRow label="Migration" addr={BULL_MIGRATION_ADDRESS} onCopy={copyAddr} />
            <ContractRow label="USDT" addr={BULL_USDT_ADDRESS} onCopy={copyAddr} />
            {pairAddress && <ContractRow label="Pair (BULL/USDT)" addr={pairAddress} onCopy={copyAddr} />}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          {zh
            ? "免责声明：锁仓 BULL 估值仅按 PancakeSwap 现价换算，不构成任何保证兑付；卖出可能有 10% 卖税；请自行核验合约与交易细节。"
            : "Disclaimer: Vesting BULL valuation is a live PancakeSwap price estimate only, not a guarantee. Sells may incur a 10% tax. Verify contracts independently."}
        </p>
      </div>
    </PageWrapper>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"
      }`}
    >
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold mt-1 ${highlight ? "text-primary" : ""}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function ContractRow({
  label,
  addr,
  onCopy,
}: {
  label: string;
  addr: string;
  onCopy: (a: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 last:border-b-0 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span>{addr.slice(0, 8)}...{addr.slice(-6)}</span>
        <button onClick={() => onCopy(addr)} className="text-muted-foreground hover:text-primary">
          <Copy className="w-3 h-3" />
        </button>
        <a
          href={`https://bscscan.com/address/${addr}`}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
