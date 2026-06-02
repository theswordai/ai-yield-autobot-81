import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits, MaxUint256 } from "ethers";
import { useWeb3 } from "./useWeb3";
import { LegendaryStaking_ABI } from "@/abis/LegendaryStaking";
import { LegendaryReferral_ABI } from "@/abis/LegendaryReferral";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import { USDV_ABI } from "@/abis/USDV";
import { FutureDao_ABI } from "@/abis/FutureDao";
import {
  LEGENDARY_STAKING_ADDRESS,
  LEGENDARY_REFERRAL_ADDRESS,
} from "@/config/legendary";
import { USDT_ADDRESS, USDV_ADDRESS, FDAO_ADDRESS, TARGET_CHAIN } from "@/config/contracts";
import { getReadProvider } from "@/lib/rpcClient";

export type LegendaryPosition = {
  id: bigint;
  user: string;
  poolType: number;
  principal: bigint;
  aprBps: bigint;
  startTime: bigint;
  lastInterestClaimAt: bigint;
  withdrawn: boolean;
  pending: bigint;
};

export type LegendaryDashboard = {
  pool1Principal: bigint;
  pool2Principal: bigint;
  totalPending: bigint;
  referralClaimable: bigint;
  lastClaimAt: bigint;
  level: number;
  selfStake: bigint;
  teamPerf: bigint;
  inviter: string;
  totalPool1: bigint;
  totalPool2: bigint;
  currentDayInflow: bigint;
  usdtBalance: bigint;
  allowance: bigint;
  paused: boolean;
  frozen: boolean;
  earlyPenaltyBps: number;
  positions: LegendaryPosition[];
  pendingUsdv: bigint;
  pendingFdao: bigint;
  previewUsdvInterest: bigint;
  previewUsdvLevel: bigint;
  previewFdaoInterest: bigint;
  previewFdaoLevel: bigint;
  usdvBalance: bigint;
  fdaoBalance: bigint;
};

type ProviderLike = { getBlockNumber: () => Promise<number> };
type ContractWithProvider = Contract & { provider?: ProviderLike };
type DepositedLog = { args?: { posId?: bigint } };
type LegendaryPositionTuple = {
  user?: string;
  principal?: bigint;
  startTime?: bigint;
  lastAccrueTime?: bigint;
  aprBps?: bigint;
  poolType?: bigint | number;
  withdrawn?: boolean;
  0?: string;
  1?: bigint;
  2?: bigint;
  3?: bigint;
  4?: bigint;
  6?: bigint | number;
  7?: boolean;
};

// placeholder to keep diff context

const EMPTY_DASHBOARD: LegendaryDashboard = {
  pool1Principal: 0n,
  pool2Principal: 0n,
  totalPending: 0n,
  referralClaimable: 0n,
  lastClaimAt: 0n,
  level: 0,
  selfStake: 0n,
  teamPerf: 0n,
  inviter: "0x0000000000000000000000000000000000000000",
  totalPool1: 0n,
  totalPool2: 0n,
  currentDayInflow: 0n,
  usdtBalance: 0n,
  allowance: 0n,
  paused: false,
  frozen: false,
  earlyPenaltyBps: 5000,
  positions: [],
  pendingUsdv: 0n,
  pendingFdao: 0n,
  previewUsdvInterest: 0n,
  previewUsdvLevel: 0n,
  previewFdaoInterest: 0n,
  previewFdaoLevel: 0n,
  usdvBalance: 0n,
  fdaoBalance: 0n,
};

export function useLegendaryContracts() {
  const { signer } = useWeb3();
  return useMemo(() => {
    // Reads always go through the BSC public-RPC fallback provider so wallet
    // RPC instability never silently zeroes the UI.
    const readProvider = getReadProvider();
    const read = {
      staking: new Contract(LEGENDARY_STAKING_ADDRESS, LegendaryStaking_ABI, readProvider),
      referral: new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, readProvider),
      usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, readProvider),
      usdv: new Contract(USDV_ADDRESS, USDV_ABI, readProvider),
      fdao: new Contract(FDAO_ADDRESS, FutureDao_ABI, readProvider),
    };
    const write = signer
      ? {
          staking: new Contract(LEGENDARY_STAKING_ADDRESS, LegendaryStaking_ABI, signer),
          referral: new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, signer),
          usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, signer),
          usdv: new Contract(USDV_ADDRESS, USDV_ABI, signer),
          fdao: new Contract(FDAO_ADDRESS, FutureDao_ABI, signer),
        }
      : null;
    return { read, write };
  }, [signer]);
}

const safe = async <T,>(
  p: Promise<T>,
  fallback: T,
  onErr?: () => void
): Promise<T> => {
  try {
    return await p;
  } catch {
    onErr?.();
    return fallback;
  }
};

// ---------- Shared singleton state ----------
let sharedData: LegendaryDashboard = EMPTY_DASHBOARD;
let sharedAccount: string | null = null;
let sharedLoading = false;
let sharedRpcDegraded = false;
let inflight: Promise<void> | null = null;
let inflightAccount: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

// Module-level handles set by LegendaryDashboardProvider so the shared refetch()
// returned by useLegendaryDashboard() always has the latest read client + account.
let currentRead: ReturnType<typeof useLegendaryContracts>["read"] | null = null;
let currentAccount: string | null = null;
export function _setLegendaryContext(
  read: ReturnType<typeof useLegendaryContracts>["read"] | null,
  account: string | null
) {
  const accountChanged =
    (currentAccount || "").toLowerCase() !== (account || "").toLowerCase();
  currentRead = read;
  currentAccount = account;
  // When the account becomes available (or changes) after a refetch already
  // started with a stale account, immediately kick off a fresh refetch so the
  // user doesn't have to wait for the 30s interval.
  if (accountChanged && read) {
    _refetchLegendary();
  }
}
export function _resetLegendaryShared() {
  sharedData = { ...EMPTY_DASHBOARD };
  sharedAccount = null;
  sharedRpcDegraded = false;
  notify();
}
export function _refetchLegendary() {
  if (!currentRead) return Promise.resolve();
  return doRefetch(currentRead, currentAccount);
}

export async function doRefetch(
  read: ReturnType<typeof useLegendaryContracts>["read"],
  account: string | null
) {
  if (!read) return;
  if (inflight) {
    // Dedupe only when the in-flight fetch is for the same account. If the
    // account just became available, queue a follow-up immediately after the
    // current request completes — don't wait for the 30s interval.
    const sameAcc =
      (inflightAccount || "").toLowerCase() === (account || "").toLowerCase();
    if (sameAcc) return inflight;
    return inflight.then(() => doRefetch(read, account));
  }
  inflightAccount = account;
  sharedLoading = true;
  notify();
  inflight = (async () => {
    let phase1Failures = 0;
    let phase2KeyFailures = 0;
    try {
      // Use previous values as fallbacks when the same account is connected,
      // so transient RPC failures don't flash UI back to 0.
      const sameAcc =
        !!account && sharedAccount && sharedAccount.toLowerCase() === account.toLowerCase();
      const prev = sameAcc ? sharedData : sharedData; // keep prev even on first load to avoid 0-flash

      // ---------- Phase 1: account-specific balances (fast path) ----------
      if (account) {
        const [fastUsdtBalance, fastAllowance, fastFrozen] = await Promise.all([
          safe(read.usdt.balanceOf(account) as Promise<bigint>, prev.usdtBalance, () => phase1Failures++),
          safe(
            read.usdt.allowance(account, LEGENDARY_STAKING_ADDRESS) as Promise<bigint>,
            prev.allowance,
            () => phase1Failures++
          ),
          safe(read.staking.frozen(account) as Promise<boolean>, prev.frozen, () => phase1Failures++),
        ]);
        sharedData = {
          ...prev,
          usdtBalance: fastUsdtBalance,
          allowance: fastAllowance,
          frozen: fastFrozen,
        };
        sharedAccount = account;
        notify();
      }

      // ---------- Phase 2: global pool state ----------
      const [totalPool1, totalPool2, currentDayInflow, paused, earlyPenaltyBpsRaw] = await Promise.all([
        safe(read.staking.totalPool1Principal() as Promise<bigint>, sharedData.totalPool1),
        safe(read.staking.totalPool2Principal() as Promise<bigint>, sharedData.totalPool2),
        safe(read.staking.currentDayInflow() as Promise<bigint>, sharedData.currentDayInflow),
        safe(read.staking.paused() as Promise<boolean>, sharedData.paused),
        safe(read.staking.earlyPenaltyBps() as Promise<bigint>, BigInt(sharedData.earlyPenaltyBps)),
      ]);
      const earlyPenaltyBps = Number(earlyPenaltyBpsRaw) || 5000;

      if (!account) {
        // No account connected — only refresh global pool stats; do NOT clear
        // per-account fields here (Provider handles disconnect resets).
        sharedData = { ...sharedData, totalPool1, totalPool2, currentDayInflow, paused, earlyPenaltyBps };
        notify();
        return;
      }

      // Reuse fast-path values already in sharedData
      const fastUsdtBalance = sharedData.usdtBalance;
      const fastAllowance = sharedData.allowance;

      sharedData = {
        ...sharedData,
        totalPool1,
        totalPool2,
        currentDayInflow,
        paused,
        earlyPenaltyBps,
        usdtBalance: fastUsdtBalance,
        allowance: fastAllowance,
      };
      sharedAccount = account;
      notify();

      const [
        referralClaimable,
        lastClaimAt,
        levelRaw,
        selfStake,
        teamPerf,
        inviter,
        frozen,
        posIdsResult,
        pendingUsdv,
        pendingFdao,
        previewTok,
        usdvBalance,
        fdaoBalance,
      ] = await Promise.all([
        safe(read.staking.referralClaimable(account) as Promise<bigint>, prev.referralClaimable),
        safe(read.staking.lastClaimAt(account) as Promise<bigint>, prev.lastClaimAt),
        safe(read.referral.getLevel(account) as Promise<bigint>, BigInt(prev.level)),
        safe(read.referral.selfStake(account) as Promise<bigint>, prev.selfStake, () => phase2KeyFailures++),
        safe(read.referral.teamPerf(account) as Promise<bigint>, prev.teamPerf),
        safe(read.referral.inviterOf(account) as Promise<string>, prev.inviter, () => phase2KeyFailures++),
        safe(read.staking.frozen(account) as Promise<boolean>, prev.frozen),
        (async (): Promise<{ ids: bigint[]; ok: boolean }> => {
          try {
            const r = (await read.staking.getUserPositions(account)) as bigint[];
            return { ids: r ?? [], ok: true };
          } catch (e) {
            console.warn("[legendary] getUserPositions failed, fallback to events", e);
            return { ids: [], ok: false };
          }
        })(),
        safe(read.staking.pendingUsdv(account) as Promise<bigint>, prev.pendingUsdv),
        safe(read.staking.pendingFdao(account) as Promise<bigint>, prev.pendingFdao),
        safe(
          read.staking.previewTokenRewards(account) as Promise<[bigint, bigint, bigint, bigint]>,
          [
            prev.previewUsdvInterest,
            prev.previewUsdvLevel,
            prev.previewFdaoInterest,
            prev.previewFdaoLevel,
          ] as [bigint, bigint, bigint, bigint]
        ),
        safe(read.usdv.balanceOf(account) as Promise<bigint>, prev.usdvBalance, () => phase2KeyFailures++),
        safe(read.fdao.balanceOf(account) as Promise<bigint>, prev.fdaoBalance),
      ]);

      const [
        previewUsdvInterest,
        previewUsdvLevel,
        previewFdaoInterest,
        previewFdaoLevel,
      ] = previewTok;

      const posIdsFromCall = posIdsResult.ids;
      const posIdsCallOk = posIdsResult.ok;

      // Fallback: only scan Deposited events when the primary call failed.
      // Normal path skips this entirely to keep refresh fast on public RPCs.
      const posIds: bigint[] = [...posIdsFromCall];
      let eventScanOk = posIdsCallOk;
      if (!posIdsCallOk) {
        try {
          const provider = (read.staking as ContractWithProvider).provider;
          const latest: number = await provider.getBlockNumber();
          const fromBlock = Math.max(0, latest - 50_000);
          const filter = read.staking.filters.Deposited(account);
          const logs = await read.staking.queryFilter(filter, fromBlock, latest);
          const seen = new Set(posIds.map((x) => x.toString()));
          for (const lg of logs as DepositedLog[]) {
            const id = lg.args?.posId;
            if (id !== undefined && !seen.has(id.toString())) {
              seen.add(id.toString());
              posIds.push(id);
            }
          }
          eventScanOk = true;
        } catch (e) {
          console.warn("[legendary] Deposited event scan failed", e);
        }
      }

      // If both sources came back empty due to RPC errors, merge in previous posIds
      // so we don't briefly flash to zero positions.
      if (posIds.length === 0 && (!posIdsCallOk || !eventScanOk) && prev.positions.length > 0) {
        for (const p of prev.positions) posIds.push(p.id);
      }

      console.log("[legendary] posIds", posIds.map((x) => x.toString()));
      const prevPosById = new Map(prev.positions.map((p) => [p.id.toString(), p]));
      const positions: LegendaryPosition[] = await Promise.all(
        posIds.map(async (id) => {
          const prevPos = prevPosById.get(id.toString());
          const pos = await safe(
            read.staking.positions(id) as Promise<LegendaryPositionTuple>,
            null as unknown as LegendaryPositionTuple
          );
          const pending = await safe(
            read.staking.pendingInterest(id) as Promise<bigint>,
            prevPos?.pending ?? 0n
          );
          if (!pos) {
            // Reading this position failed — keep previous snapshot if we had it,
            // rather than flashing the row to zero / withdrawn.
            if (prevPos) return { ...prevPos, pending };
            return {
              id,
              user: account,
              poolType: 0,
              principal: 0n,
              aprBps: 0n,
              startTime: 0n,
              lastInterestClaimAt: 0n,
              withdrawn: true,
              pending: 0n,
            };
          }
          // tuple: (user, principal, startTime, lastAccrueTime, aprBps, accruedClaimable, poolType, withdrawn)
          return {
            id,
            user: pos.user ?? pos[0],
            principal: pos.principal ?? pos[1],
            startTime: pos.startTime ?? pos[2],
            lastInterestClaimAt: pos.lastAccrueTime ?? pos[3],
            aprBps: pos.aprBps ?? pos[4],
            poolType: Number(pos.poolType ?? pos[6]),
            withdrawn: pos.withdrawn ?? pos[7],
            pending,
          };
        })
      );

      const active = positions.filter((p) => !p.withdrawn);
      const pool1Principal = active
        .filter((p) => p.poolType === 1)
        .reduce((s, p) => s + p.principal, 0n);
      const pool2Principal = active
        .filter((p) => p.poolType === 2)
        .reduce((s, p) => s + p.principal, 0n);
      const totalPending = active.reduce((s, p) => s + p.pending, 0n);

      sharedData = {
        pool1Principal,
        pool2Principal,
        totalPending,
        referralClaimable,
        lastClaimAt,
        level: Number(levelRaw),
        selfStake,
        teamPerf,
        inviter,
        totalPool1,
        totalPool2,
        currentDayInflow,
        usdtBalance: fastUsdtBalance,
        allowance: fastAllowance,
        paused,
        frozen,
        earlyPenaltyBps,
        positions,
        pendingUsdv,
        pendingFdao,
        previewUsdvInterest,
        previewUsdvLevel,
        previewFdaoInterest,
        previewFdaoLevel,
        usdvBalance,
        fdaoBalance,
      };
      sharedAccount = account;
      // Mark degraded if Phase-1 had ≥2 failures OR ≥2 of the key Phase-2 reads failed.
      const degraded = phase1Failures >= 2 || phase2KeyFailures >= 2;
      sharedRpcDegraded = degraded;
    } finally {
      sharedLoading = false;
      inflight = null;
      inflightAccount = null;
      notify();
    }
  })();
  return inflight;
}

// Subscribe-only hook. Does NOT trigger refetches or intervals — the
// LegendaryDashboardProvider mounted once on the Legendary page handles all
// automatic refetching. Child tabs simply read from the shared singleton.
export function useLegendaryDashboard() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const refetch = useCallback(async () => {
    await _refetchLegendary();
  }, []);

  return { data: sharedData, loading: sharedLoading, rpcDegraded: sharedRpcDegraded, refetch };
}


export function fmt(value: bigint, digits = 2): string {
  const s = formatUnits(value, 18);
  const n = Number(s);
  if (!isFinite(n)) return "0.0000";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtAllowance(value: bigint): string {
  if (value > MaxUint256 / 2n) return "无限";
  return fmt(value);
}
