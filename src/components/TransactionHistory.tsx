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
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [startBlock, setStartBlock] = useState<number | null>(null);

  const blockTimeCache = useMemo(() => new Map<number, number>(), []);

  // Capture the current block as the starting point — only show events from now on.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const provider = (contracts.find((c) => c.contract)?.contract?.runner as any);
      const p = provider?.provider ?? provider;
      try {
        const bn = await p?.getBlockNumber?.();
        if (!cancelled && typeof bn === "number") setStartBlock(bn);
      } catch {
        if (!cancelled) setStartBlock(0);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const fetchHistory = useCallback(async () => {
    if (!account || startBlock === null) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const all: HistoryRow[] = [];

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
                  all.push({
                    key: `${log.transactionHash}-${log.logIndex}`,
                    timestamp: 0, // filled in below
                    blockNumber: log.blockNumber,
                    txHash: log.transactionHash,
                    label: ev.label,
                    badgeClass: ev.badgeClass,
                    amount: parsed.amount,
                    sub: parsed.sub,
                  });
                }
              } catch {
                // silent fallback per project policy
              }
            })
          );
        })
      );

      // Resolve block timestamps with caching
      const provider = contracts.find((c) => c.contract)?.contract?.runner as any;
      const uniqueBlocks = Array.from(new Set(all.map((r) => r.blockNumber)));
      await Promise.all(
        uniqueBlocks.map(async (bn) => {
          if (blockTimeCache.has(bn)) return;
          try {
            const blk = await provider?.provider?.getBlock?.(bn) ?? await provider?.getBlock?.(bn);
            if (blk?.timestamp) blockTimeCache.set(bn, Number(blk.timestamp));
          } catch {
            // ignore
          }
        })
      );

      for (const r of all) {
        r.timestamp = blockTimeCache.get(r.blockNumber) ?? 0;
      }

      all.sort((a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber);
      setRows(all);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contracts, startBlock]);

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
