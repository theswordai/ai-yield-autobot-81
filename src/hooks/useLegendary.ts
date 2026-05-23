import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { useWeb3 } from "./useWeb3";
import { LegendaryStaking_ABI } from "@/abis/LegendaryStaking";
import { LegendaryReferral_ABI } from "@/abis/LegendaryReferral";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import {
  LEGENDARY_STAKING_ADDRESS,
  LEGENDARY_REFERRAL_ADDRESS,
} from "@/config/legendary";
import { USDT_ADDRESS } from "@/config/contracts";

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
  positions: LegendaryPosition[];
};

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
  positions: [],
};

export function useLegendaryContracts() {
  const { provider, signer } = useWeb3();
  return useMemo(() => {
    if (!provider) return { read: null, write: null };
    const read = {
      staking: new Contract(LEGENDARY_STAKING_ADDRESS, LegendaryStaking_ABI, provider),
      referral: new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, provider),
      usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, provider),
    };
    const write = signer
      ? {
          staking: new Contract(LEGENDARY_STAKING_ADDRESS, LegendaryStaking_ABI, signer),
          referral: new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, signer),
          usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, signer),
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

export function useLegendaryDashboard() {
  const { account } = useWeb3();
  const { read } = useLegendaryContracts();
  const [data, setData] = useState<LegendaryDashboard>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!read) return;
    setLoading(true);
    try {
      const [totalPool1, totalPool2, currentDayInflow, paused] = await Promise.all([
        safe(read.staking.totalPool1Principal() as Promise<bigint>, 0n),
        safe(read.staking.totalPool2Principal() as Promise<bigint>, 0n),
        safe(read.staking.currentDayInflow() as Promise<bigint>, 0n),
        safe(read.staking.paused() as Promise<boolean>, false),
      ]);

      if (!account) {
        setData({
          ...EMPTY_DASHBOARD,
          totalPool1,
          totalPool2,
          currentDayInflow,
          paused,
        });
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
        posIds,
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
        safe(read.staking.getUserPositions(account) as Promise<bigint[]>, []),
      ]);

      const positions: LegendaryPosition[] = await Promise.all(
        posIds.map(async (id) => {
          const pos = await safe(
            read.staking.positions(id) as Promise<any>,
            null as any
          );
          const pending = await safe(
            read.staking.pendingInterest(id) as Promise<bigint>,
            0n
          );
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
          return {
            id,
            user: pos.user ?? pos[0],
            poolType: Number(pos.poolType ?? pos[1]),
            principal: pos.principal ?? pos[2],
            aprBps: pos.aprBps ?? pos[3],
            startTime: pos.startTime ?? pos[4],
            lastInterestClaimAt: pos.lastInterestClaimAt ?? pos[5],
            withdrawn: pos.withdrawn ?? pos[6],
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

      setData({
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
        positions,
      });
    } finally {
      setLoading(false);
    }
  }, [read, account]);

  useEffect(() => {
    refetch();
    const t = setInterval(refetch, 30_000);
    return () => clearInterval(t);
  }, [refetch]);

  return { data, loading, refetch };
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
