// Robust eth_getLogs querying for BSC public RPCs.
// Public BSC nodes generally cap getLogs at ~5000 blocks per call and rate-limit.
// Strategy:
//   1. Maintain a pool of read-only JsonRpcProviders (BSC mainnet).
//   2. Query in chunks (default 4500 blocks) walking from `toBlock` back to `fromBlock`.
//   3. On per-chunk failure: halve the chunk and retry; rotate to next provider.
//   4. Surface partial-failure so the UI can show "网络繁忙" rather than blank.

import { Contract, JsonRpcProvider, Log, EventLog } from "ethers";

const BSC_RPCS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
  "https://bsc-dataseed2.binance.org/",
  "https://bsc-dataseed3.binance.org/",
];

let _providers: JsonRpcProvider[] | null = null;
export function getReadProviders(): JsonRpcProvider[] {
  if (!_providers) {
    _providers = BSC_RPCS.map((u) => new JsonRpcProvider(u, 56, { staticNetwork: true }));
  }
  return _providers;
}

// Block timestamp cache shared across the session.
const blockTimeCache = new Map<number, number>();

export async function getBlockTimestamp(blockNumber: number): Promise<number> {
  if (blockTimeCache.has(blockNumber)) return blockTimeCache.get(blockNumber)!;
  const providers = getReadProviders();
  for (const p of providers) {
    try {
      const blk = await p.getBlock(blockNumber);
      if (blk?.timestamp) {
        const ts = Number(blk.timestamp);
        blockTimeCache.set(blockNumber, ts);
        return ts;
      }
    } catch {
      // try next
    }
  }
  return 0;
}

let _latestBlockCache: { value: number; at: number } | null = null;
export async function getLatestBlock(): Promise<number> {
  if (_latestBlockCache && Date.now() - _latestBlockCache.at < 15_000) {
    return _latestBlockCache.value;
  }
  for (const p of getReadProviders()) {
    try {
      const n = await p.getBlockNumber();
      _latestBlockCache = { value: n, at: Date.now() };
      return n;
    } catch {
      // try next
    }
  }
  return 0;
}

export interface ChunkedQueryResult {
  logs: (Log | EventLog)[];
  failedRanges: Array<{ from: number; to: number }>;
}

const DEFAULT_CHUNK = 4500;
const MIN_CHUNK = 500;

/**
 * Query a contract event filter across a wide block range using chunked
 * requests with per-chunk retry + RPC rotation. Walks newest -> oldest so
 * the most relevant (recent) data shows up first even if older chunks fail.
 */
export async function queryEventsChunked(
  contractAddress: string,
  abi: any,
  filter: any,
  fromBlock: number,
  toBlock: number,
  opts?: { chunkSize?: number }
): Promise<ChunkedQueryResult> {
  const providers = getReadProviders();
  const chunkSize = opts?.chunkSize ?? DEFAULT_CHUNK;
  const out: (Log | EventLog)[] = [];
  const failed: Array<{ from: number; to: number }> = [];

  let providerIdx = 0;
  let cursor = toBlock;

  while (cursor >= fromBlock) {
    let size = chunkSize;
    let segOk = false;

    while (size >= MIN_CHUNK && !segOk) {
      const segTo = cursor;
      const segFrom = Math.max(fromBlock, cursor - size + 1);
      let attemptsThisSize = 0;

      while (attemptsThisSize < providers.length && !segOk) {
        const provider = providers[providerIdx % providers.length];
        try {
          const c = new Contract(contractAddress, abi, provider);
          const logs = await c.queryFilter(filter, segFrom, segTo);
          out.push(...(logs as any[]));
          segOk = true;
          cursor = segFrom - 1;
        } catch (err: any) {
          providerIdx++;
          attemptsThisSize++;
        }
      }

      if (!segOk) {
        // All providers failed at this size — shrink and retry.
        size = Math.floor(size / 2);
      }
    }

    if (!segOk) {
      // Even smallest chunk failed across all providers; record + skip.
      const segTo = cursor;
      const segFrom = Math.max(fromBlock, cursor - MIN_CHUNK + 1);
      failed.push({ from: segFrom, to: segTo });
      cursor = segFrom - 1;
    }
  }

  return { logs: out, failedRanges: failed };
}
