import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ExternalLink, RefreshCw } from "lucide-react";

export interface HistoryEventConfig {
  /** Event name as defined in the ABI */
  name: string;
  /** Display label */
  label: string;
  /** Tailwind classes for the type badge */
  badgeClass?: string;
  /**
   * Given the event args, return the display amount in wei (bigint)
   * and an optional sub-info string.
   */
  parse: (args: any) => { amount: bigint; sub?: string };
}

export interface HistoryRow {
  key: string;
  timestamp: number;
  blockNumber: number;
  txHash: string;
  label: string;
  badgeClass?: string;
  amount: bigint;
  sub?: string;
}

interface Props {
  title: string;
  contracts: Array<{
    contract: Contract | null;
    events: HistoryEventConfig[];
  }>;
  account: string | null;
  decimals?: number;
  explorerBase?: string; // e.g. https://bscscan.com/tx/
  isZh?: boolean;
  fromBlock?: number | "earliest";
}

const fmt = (v: bigint, decimals: number) => {
  try {
    return Number(formatUnits(v, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2,
    });
  } catch {
    return "0.00";
  }
};

export function TransactionHistory({
  title,
  contracts,
  account,
  decimals = 18,
  explorerBase = "https://bscscan.com/tx/",
  isZh = true,
  fromBlock = 0,
}: Props) {
  // Stable per-account, per-contract-set storage key so history persists across reloads.
  const storageKey = useMemo(() => {
    const addrs = contracts
      .map((c) => (c.contract as any)?.target ?? "")
      .filter(Boolean)
      .join("|");
    return account ? `txhist:${title}:${account.toLowerCase()}:${addrs}` : null;
  }, [title, account, contracts]);

  const startBlockKey = storageKey ? `${storageKey}:startBlock` : null;
  const rowsKey = storageKey ? `${storageKey}:rows` : null;

  const [rows, setRows] = useState<HistoryRow[]>(() => {
    if (typeof window === "undefined" || !rowsKey) return [];
    try {
      const raw = localStorage.getItem(rowsKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Array<Omit<HistoryRow, "amount"> & { amount: string }>;
      return parsed.map((r) => ({ ...r, amount: BigInt(r.amount) }));
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [startBlock, setStartBlock] = useState<number | null>(null);

  const blockTimeCache = useMemo(() => new Map<number, number>(), []);

  // Re-hydrate rows when account/key changes (e.g. wallet switch).
  useEffect(() => {
    if (!rowsKey) {
      setRows([]);
      return;
    }
    try {
      const raw = localStorage.getItem(rowsKey);
      if (!raw) {
        setRows([]);
        return;
      }
      const parsed = JSON.parse(raw) as Array<Omit<HistoryRow, "amount"> & { amount: string }>;
      setRows(parsed.map((r) => ({ ...r, amount: BigInt(r.amount) })));
    } catch {
      setRows([]);
    }
  }, [rowsKey]);

  // Capture the start block once per account; persist so it survives reloads.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!startBlockKey) {
        setStartBlock(null);
        return;
      }
      const cached = localStorage.getItem(startBlockKey);
      if (cached) {
        const n = Number(cached);
        if (Number.isFinite(n)) {
          if (!cancelled) setStartBlock(n);
          return;
        }
      }
      const provider = (contracts.find((c) => c.contract)?.contract?.runner as any);
      const p = provider?.provider ?? provider;
      try {
        const bn = await p?.getBlockNumber?.();
        if (!cancelled && typeof bn === "number") {
          localStorage.setItem(startBlockKey, String(bn));
          setStartBlock(bn);
        }
      } catch {
        if (!cancelled) setStartBlock(0);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBlockKey]);

  const fetchHistory = useCallback(async () => {
    if (!account || startBlock === null) return;
    setLoading(true);
    try {
      const fetched: HistoryRow[] = [];

      await Promise.all(
        contracts.map(async ({ contract, events }) => {
          if (!contract) return;
          await Promise.all(
            events.map(async (ev) => {
              try {
                const filter = (contract.filters as any)[ev.name](account);
                const logs = await contract.queryFilter(filter, startBlock, "latest");
                for (const log of logs as any[]) {
                  const args = log.args ?? {};
                  const parsed = ev.parse(args);
                  fetched.push({
                    key: `${log.transactionHash}-${log.logIndex}`,
                    timestamp: 0,
                    blockNumber: log.blockNumber,
                    txHash: log.transactionHash,
                    label: ev.label,
                    badgeClass: ev.badgeClass,
                    amount: parsed.amount,
                    sub: parsed.sub,
                  });
                }
              } catch {
                // silent fallback
              }
            })
          );
        })
      );

      const provider = contracts.find((c) => c.contract)?.contract?.runner as any;
      const uniqueBlocks = Array.from(new Set(fetched.map((r) => r.blockNumber)));
      await Promise.all(
        uniqueBlocks.map(async (bn) => {
          if (blockTimeCache.has(bn)) return;
          try {
            const blk = (await provider?.provider?.getBlock?.(bn)) ?? (await provider?.getBlock?.(bn));
            if (blk?.timestamp) blockTimeCache.set(bn, Number(blk.timestamp));
          } catch {
            // ignore
          }
        })
      );

      for (const r of fetched) {
        r.timestamp = blockTimeCache.get(r.blockNumber) ?? 0;
      }

      // Merge with cached rows, dedupe by key, sort desc.
      setRows((prev) => {
        const map = new Map<string, HistoryRow>();
        for (const r of prev) map.set(r.key, r);
        for (const r of fetched) map.set(r.key, r);
        const merged = Array.from(map.values()).sort(
          (a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber
        );
        if (rowsKey) {
          try {
            localStorage.setItem(
              rowsKey,
              JSON.stringify(merged.map((r) => ({ ...r, amount: r.amount.toString() })))
            );
          } catch {
            // ignore quota errors
          }
        }
        return merged;
      });
    } catch {
      // keep existing rows on error
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contracts, startBlock, rowsKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Card className="backdrop-blur-md bg-card/40 border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          {title}
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          {isZh ? "刷新" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {!account ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isZh ? "请先连接钱包" : "Please connect wallet"}
          </p>
        ) : loading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isZh ? "加载链上记录中…" : "Loading on-chain history…"}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isZh ? "暂无历史记录" : "No history yet"}
          </p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {rows.map((r) => (
              <div
                key={r.key}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    className={
                      r.badgeClass ??
                      "bg-primary/15 text-primary border-primary/30 text-[11px]"
                    }
                  >
                    {r.label}
                  </Badge>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.timestamp
                      ? new Date(r.timestamp * 1000).toLocaleString(
                          isZh ? "zh-CN" : "en-US",
                          { hour12: false }
                        )
                      : `#${r.blockNumber}`}
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-sm">
                      {fmt(r.amount, decimals)}{" "}
                      <span className="text-xs text-muted-foreground">USDT</span>
                    </div>
                    {r.sub && (
                      <div className="text-[11px] text-muted-foreground">{r.sub}</div>
                    )}
                  </div>
                  <a
                    href={`${explorerBase}${r.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    aria-label="View on BscScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
