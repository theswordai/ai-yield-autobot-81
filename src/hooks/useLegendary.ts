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
import { USDT_ADDRESS, USDV_ADDRESS, FDAO_ADDRESS } from "@/config/contracts";

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
  const { provider, signer } = useWeb3();
  return useMemo(() => {
    if (!provider) return { read: null, write: null };
    const read = {
      staking: new Contract(LEGENDARY_STAKING_ADDRESS, LegendaryStaking_ABI, provider),
      referral: new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, provider),
      usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, provider),
      usdv: new Contract(USDV_ADDRESS, USDV_ABI, provider),
      fdao: new Contract(FDAO_ADDRESS, FutureDao_ABI, provider),
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
  }, [provider, signer]);
}

const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await p;
  } catch {
    return fallback;
  }
};

// ---------- Shared singleton state ----------
let sharedData: LegendaryDashboard = EMPTY_DASHBOARD;
let sharedLoading = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

async function doRefetch(
  read: ReturnType<typeof useLegendaryContracts>["read"],
  account: string | null
) {
  if (!read) return;
  if (inflight) return inflight;
  sharedLoading = true;
  notify();
  inflight = (async () => {
    try {
      const [totalPool1, totalPool2, currentDayInflow, paused, earlyPenaltyBpsRaw] = await Promise.all([
        safe(read.staking.totalPool1Principal() as Promise<bigint>, 0n),
        safe(read.staking.totalPool2Principal() as Promise<bigint>, 0n),
        safe(read.staking.currentDayInflow() as Promise<bigint>, 0n),
        safe(read.staking.paused() as Promise<boolean>, false),
        safe(read.staking.earlyPenaltyBps() as Promise<bigint>, 5000n),
      ]);
      const earlyPenaltyBps = Number(earlyPenaltyBpsRaw) || 5000;

      if (!account) {
        sharedData = { ...EMPTY_DASHBOARD, totalPool1, totalPool2, currentDayInflow, paused, earlyPenaltyBps };
        return;
      }

      const [
        referralClaimable,
        lastClaimAt,
        levelRaw,
        selfStake,
        teamPerf,
        inviter,
        usdtBalance,
        allowance,
        frozen,
        posIdsFromCall,
        pendingUsdv,
        pendingFdao,
        previewTok,
        usdvBalance,
        fdaoBalance,
      ] = await Promise.all([
        safe(read.staking.referralClaimable(account) as Promise<bigint>, 0n),
        safe(read.staking.lastClaimAt(account) as Promise<bigint>, 0n),
        safe(read.referral.getLevel(account) as Promise<bigint>, 0n),
        safe(read.referral.selfStake(account) as Promise<bigint>, 0n),
        safe(read.referral.teamPerf(account) as Promise<bigint>, 0n),
        safe(
          read.referral.inviterOf(account) as Promise<string>,
          "0x0000000000000000000000000000000000000000"
        ),
        safe(read.usdt.balanceOf(account) as Promise<bigint>, 0n),
        safe(
          read.usdt.allowance(account, LEGENDARY_STAKING_ADDRESS) as Promise<bigint>,
          0n
        ),
        safe(read.staking.frozen(account) as Promise<boolean>, false),
        (async (): Promise<bigint[]> => {
          try {
            const r = (await read.staking.getUserPositions(account)) as bigint[];
            return r ?? [];
          } catch (e) {
            console.warn("[legendary] getUserPositions failed, fallback to events", e);
            return [];
          }
        })(),
        safe(read.staking.pendingUsdv(account) as Promise<bigint>, 0n),
        safe(read.staking.pendingFdao(account) as Promise<bigint>, 0n),
        safe(
          read.staking.previewTokenRewards(account) as Promise<[bigint, bigint, bigint, bigint]>,
          [0n, 0n, 0n, 0n] as [bigint, bigint, bigint, bigint]
        ),
        safe(read.usdv.balanceOf(account) as Promise<bigint>, 0n),
        safe(read.fdao.balanceOf(account) as Promise<bigint>, 0n),
      ]);

      const previewUsdvInterest = (previewTok as any)?.[0] ?? 0n;
      const previewUsdvLevel = (previewTok as any)?.[1] ?? 0n;
      const previewFdaoInterest = (previewTok as any)?.[2] ?? 0n;
      const previewFdaoLevel = (previewTok as any)?.[3] ?? 0n;

      // Fallback: scan Deposited events to recover posIds the call may have missed
      const posIds: bigint[] = [...posIdsFromCall];
      try {
        const provider =
          (read.staking as any).runner?.provider ?? (read.staking as any).provider;
        const latest: number = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latest - 50_000);
        const filter = read.staking.filters.Deposited(account);
        const logs = await read.staking.queryFilter(filter, fromBlock, latest);
        const seen = new Set(posIds.map((x) => x.toString()));
        for (const lg of logs) {
          const id = (lg as any).args?.posId as bigint | undefined;
          if (id !== undefined && !seen.has(id.toString())) {
            seen.add(id.toString());
            posIds.push(id);
          }
        }
      } catch (e) {
        console.warn("[legendary] Deposited event scan failed", e);
      }

      console.log("[legendary] posIds", posIds.map((x) => x.toString()));
      const positions: LegendaryPosition[] = await Promise.all(
        posIds.map(async (id) => {
          const pos = await safe(read.staking.positions(id) as Promise<any>, null as any);
          const pending = await safe(
            read.staking.pendingInterest(id) as Promise<bigint>,
            0n
          );
          console.log("[legendary] position", id.toString(), pos, "pending=", pending?.toString());
          if (!pos) {
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
        usdtBalance,
        allowance,
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
    } finally {
      sharedLoading = false;
      inflight = null;
      notify();
    }
  })();
  return inflight;
}

export function useLegendaryDashboard() {
  const { account } = useWeb3();
  const { read } = useLegendaryContracts();
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const refetch = useCallback(async () => {
    await doRefetch(read, account);
  }, [read, account]);

  useEffect(() => {
    refetch();
    const t = setInterval(refetch, 30_000);
    return () => clearInterval(t);
  }, [refetch]);

  return { data: sharedData, loading: sharedLoading, refetch };
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
