import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ExternalLink, RefreshCw } from "lucide-react";
import { onHistoryRefresh } from "@/lib/historyRefresh";

export interface HistoryEventConfig {
  name: string;
  label: string;
  badgeClass?: string;
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
  explorerBase?: string;
  isZh?: boolean;
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

// BSC public RPCs cap eth_getLogs at ~5000 blocks per call.
const CHUNK = 4500;

export function TransactionHistory({
  title,
  contracts,
  account,
  decimals = 18,
  explorerBase = "https://bscscan.com/tx/",
  isZh = true,
}: Props) {
  // Keep latest contracts in a ref so callbacks can use them without changing identity.
  const contractsRef = useRef(contracts);
  contractsRef.current = contracts;

  // Stable string key derived only from primitive values (addresses + account + title).
  const addrsKey = useMemo(
    () =>
      contracts
        .map((c) => ((c.contract as any)?.target ?? "").toString().toLowerCase())
        .filter(Boolean)
        .join("|"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contracts.length, contracts.map((c) => (c.contract as any)?.target ?? "").join("|")]
  );

  const storageKey = account ? `txhist:${title}:${account.toLowerCase()}:${addrsKey}` : null;
  const startBlockKey = storageKey ? `${storageKey}:startBlock` : null;
  const rowsKey = storageKey ? `${storageKey}:rows` : null;

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const blockTimeCache = useMemo(() => new Map<number, number>(), []);

  // Hydrate rows from localStorage when the storage key changes.
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

  const fetchHistory = useCallback(async () => {
    if (!account || !startBlockKey || !rowsKey) return;
    const list = contractsRef.current;
    const provider = (list.find((c) => c.contract)?.contract?.runner as any)?.provider
      ?? (list.find((c) => c.contract)?.contract?.runner as any);
    if (!provider?.getBlockNumber) return;

    setLoading(true);
    try {
      const latest = Number(await provider.getBlockNumber());

      // Resolve startBlock from cache, or initialize to current block on first run.
      let startBlock: number;
      const cached = localStorage.getItem(startBlockKey);
      if (cached && Number.isFinite(Number(cached))) {
        startBlock = Number(cached);
      } else {
        startBlock = latest;
        localStorage.setItem(startBlockKey, String(latest));
      }
      if (startBlock > latest) startBlock = latest;

      const fetched: HistoryRow[] = [];
      let highestScanned = startBlock;

      for (const { contract, events } of list) {
        if (!contract) continue;
        for (const ev of events) {
          let filter: any;
          try {
            filter = (contract.filters as any)[ev.name](account);
          } catch (e) {
            console.warn(`[txhist] filter build failed for ${ev.name}`, e);
            continue;
          }
          // Chunked scan to bypass RPC range limits.
          for (let from = startBlock; from <= latest; from += CHUNK + 1) {
            const to = Math.min(from + CHUNK, latest);
            try {
              const logs = await contract.queryFilter(filter, from, to);
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
              if (to > highestScanned) highestScanned = to;
            } catch (e) {
              console.warn(`[txhist] queryFilter ${ev.name} ${from}-${to} failed`, e);
              // skip this chunk; keep scanning others
            }
          }
        }
      }

      // Resolve block timestamps.
      const uniqueBlocks = Array.from(new Set(fetched.map((r) => r.blockNumber)));
      await Promise.all(
        uniqueBlocks.map(async (bn) => {
          if (blockTimeCache.has(bn)) return;
          try {
            const blk = await provider.getBlock?.(bn);
            if (blk?.timestamp) blockTimeCache.set(bn, Number(blk.timestamp));
          } catch {
            // ignore
          }
        })
      );
      for (const r of fetched) r.timestamp = blockTimeCache.get(r.blockNumber) ?? 0;

      // Merge with cached rows.
      setRows((prev) => {
        const map = new Map<string, HistoryRow>();
        for (const r of prev) map.set(r.key, r);
        for (const r of fetched) map.set(r.key, r);
        const merged = Array.from(map.values()).sort(
          (a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber
        );
        try {
          localStorage.setItem(
            rowsKey,
            JSON.stringify(merged.map((r) => ({ ...r, amount: r.amount.toString() })))
          );
        } catch {
          // ignore quota errors
        }
        return merged;
      });

      // Advance the cached startBlock so next scan is short.
      try {
        localStorage.setItem(startBlockKey, String(highestScanned));
      } catch {
        // ignore
      }
    } catch (e) {
      console.warn("[txhist] fetchHistory failed", e);
    } finally {
      setLoading(false);
    }
  }, [account, startBlockKey, rowsKey, addrsKey, blockTimeCache]);

  // Initial + key-change fetch.
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Cross-component refresh trigger (fired after deposit/claim/withdraw txs).
  useEffect(() => {
    return onHistoryRefresh(() => {
      // small delay to let the node index the new block
      setTimeout(() => fetchHistory(), 1500);
    });
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
