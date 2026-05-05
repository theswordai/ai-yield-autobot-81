import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import {
  queryEventsChunked,
  getBlockTimestamp,
  getLatestBlock,
} from "@/lib/eventQuery";

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

interface ContractSpec {
  contract: Contract | null;
  events: HistoryEventConfig[];
  /** Earliest block to scan for this contract. */
  fromBlock?: number;
}

interface Props {
  title: string;
  contracts: ContractSpec[];
  account: string | null;
  decimals?: number;
  explorerBase?: string;
  isZh?: boolean;
  /** Default fromBlock when a ContractSpec doesn't provide one. */
  fromBlock?: number;
  /** Optional mock rows by lowercase address (for demo accounts w/ no chain events). */
  mockRowsByAccount?: Record<string, HistoryRow[]>;
  /** Max rows to display (default 5). */
  maxRows?: number;
  /** Only scan this many recent blocks (default 30000 ≈ ~1 day on BSC). */
  recentBlocks?: number;
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
  mockRowsByAccount,
  maxRows = 5,
  recentBlocks = 30000,
}: Props) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hadFailures, setHadFailures] = useState(false);
  const [didLoad, setDidLoad] = useState(false);

  const accountKey = account?.toLowerCase() ?? "";

  const fetchHistory = useCallback(async () => {
    if (!account) {
      setRows([]);
      setDidLoad(false);
      return;
    }

    // Mock account fast path
    const mock = mockRowsByAccount?.[account.toLowerCase()];
    if (mock && mock.length) {
      setRows([...mock].sort((a, b) => b.timestamp - a.timestamp));
      setHadFailures(false);
      setDidLoad(true);
      return;
    }

    setLoading(true);
    setHadFailures(false);
    try {
      const latest = await getLatestBlock();
      if (!latest) {
        setHadFailures(true);
        setRows([]);
        return;
      }

      const all: HistoryRow[] = [];
      let anyFailed = false;

      await Promise.all(
        contracts.map(async (spec) => {
          if (!spec.contract) return;
          const addr = await spec.contract.getAddress().catch(() => null);
          if (!addr) return;
          const abi = (spec.contract.interface as any).fragments;
          const start = Math.max(spec.fromBlock ?? fromBlock ?? 0, latest - recentBlocks);

          await Promise.all(
            spec.events.map(async (ev) => {
              try {
                // Build filter against any provider via spec.contract (only uses interface)
                const filter = (spec.contract!.filters as any)[ev.name](account);
                const { logs, failedRanges } = await queryEventsChunked(
                  addr,
                  abi,
                  filter,
                  start,
                  latest
                );
                if (failedRanges.length > 0) anyFailed = true;
                for (const log of logs as any[]) {
                  const args = log.args ?? {};
                  const parsed = ev.parse(args);
                  all.push({
                    key: `${log.transactionHash}-${log.logIndex ?? log.index ?? 0}`,
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
                anyFailed = true;
              }
            })
          );
        })
      );

      // Resolve timestamps
      const uniq = Array.from(new Set(all.map((r) => r.blockNumber)));
      await Promise.all(
        uniq.map(async (bn) => {
          const ts = await getBlockTimestamp(bn);
          for (const r of all) if (r.blockNumber === bn) r.timestamp = ts;
        })
      );

      all.sort((a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber);
      setRows(all);
      setHadFailures(anyFailed);
    } catch {
      setHadFailures(true);
      setRows([]);
    } finally {
      setLoading(false);
      setDidLoad(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, contracts, fromBlock]);

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
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              {hadFailures
                ? isZh
                  ? "节点繁忙，记录暂未加载完成"
                  : "Network busy, history not fully loaded"
                : isZh
                ? "暂无历史记录"
                : "No history yet"}
            </p>
            {hadFailures && (
              <Button size="sm" variant="outline" onClick={fetchHistory}>
                {isZh ? "重试" : "Retry"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {hadFailures && (
              <div className="flex items-center gap-2 text-[11px] text-amber-500/90 bg-amber-500/10 border border-amber-500/30 rounded-md px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isZh
                    ? "部分历史区块未加载成功，点刷新可重试"
                    : "Some history segments failed to load. Click refresh to retry."}
                </span>
              </div>
            )}
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
