import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, parseUnits, formatUnits } from "ethers";
import { toast } from "sonner";
import { useWeb3 } from "./useWeb3";
import { FlexiblePool_ABI } from "@/abis/FlexiblePool";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import {
  FLEXIBLE_ADDRESS,
  USDT_BSC_ADDRESS,
  USDT_DECIMALS,
  BSC_CHAIN_ID,
} from "@/config/flexible";

export interface FlexiblePosition {
  id: bigint;
  principal: bigint;
  startTime: number;
  closed: boolean;
  pendingYield: bigint;
}

export interface FlexibleData {
  // wallet
  usdtBalance: bigint;
  usdtAllowance: bigint;
  // global
  aprBps: bigint;
  minDeposit: bigint;
  paused: boolean;
  frozen: boolean;
  commissionFeeBps: bigint;
  principalFeeBps: bigint;
  yieldFeeBps: bigint;
  // user
  myPrincipal: bigint;
  directPrincipal: bigint;
  levelPrincipal: bigint;
  level: number;
  maxGeneration: number;
  claimableCommission: bigint;
  inviter: string;
  // positions
  positions: FlexiblePosition[];
}

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const DEFAULT_DATA: FlexibleData = {
  usdtBalance: 0n,
  usdtAllowance: 0n,
  aprBps: 0n,
  minDeposit: parseUnits("200", USDT_DECIMALS),
  paused: false,
  frozen: false,
  commissionFeeBps: 0n,
  principalFeeBps: 0n,
  yieldFeeBps: 0n,
  myPrincipal: 0n,
  directPrincipal: 0n,
  levelPrincipal: 0n,
  level: 0,
  maxGeneration: 0,
  claimableCommission: 0n,
  inviter: ZERO_ADDR,
  positions: [],
};

export function useFlexiblePool() {
  const { provider, signer, account, chainId } = useWeb3();
  const [data, setData] = useState<FlexibleData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const setKey = (k: string, v: boolean) =>
    setActionLoading((p) => ({ ...p, [k]: v }));

  const readContracts = useMemo(() => {
    if (!provider) return null;
    return {
      pool: new Contract(FLEXIBLE_ADDRESS, FlexiblePool_ABI, provider),
      usdt: new Contract(USDT_BSC_ADDRESS, MockUSDT_ABI, provider),
    };
  }, [provider]);

  const writeContracts = useMemo(() => {
    if (!signer) return null;
    return {
      pool: new Contract(FLEXIBLE_ADDRESS, FlexiblePool_ABI, signer),
      usdt: new Contract(USDT_BSC_ADDRESS, MockUSDT_ABI, signer),
    };
  }, [signer]);

  // ---------- Read ----------
  const refresh = useCallback(async () => {
    if (!readContracts) return;
    setLoading(true);
    const next: FlexibleData = { ...DEFAULT_DATA };
    const { pool, usdt } = readContracts;
    const safe = async <T,>(p: Promise<T>, fb: T): Promise<T> => {
      try { return await p; } catch { return fb; }
    };
    try {
      const [
        aprBps, minDeposit, paused, frozen,
        commissionFeeBps, principalFeeBps, yieldFeeBps,
      ] = await Promise.all([
        safe(pool.apr(), 0n),
        safe(pool.minDeposit(), parseUnits("200", USDT_DECIMALS)),
        safe(pool.paused(), false),
        safe(pool.frozen(), false),
        safe(pool.COMMISSION_FEE_BPS(), 0n),
        safe(pool.PRINCIPAL_FEE_BPS(), 0n),
        safe(pool.YIELD_FEE_BPS(), 0n),
      ]);
      next.aprBps = aprBps as bigint;
      next.minDeposit = minDeposit as bigint;
      next.paused = paused as boolean;
      next.frozen = frozen as boolean;
      next.commissionFeeBps = commissionFeeBps as bigint;
      next.principalFeeBps = principalFeeBps as bigint;
      next.yieldFeeBps = yieldFeeBps as bigint;

      if (account) {
        const [
          balance, allowance,
          myPrincipal, directPrincipal, levelPrincipal,
          level, maxGen, claimable, inviter, posIds,
        ] = await Promise.all([
          safe(usdt.balanceOf(account), 0n),
          safe(usdt.allowance(account, FLEXIBLE_ADDRESS), 0n),
          safe(pool.principalOf(account), 0n),
          safe(pool.directPrincipalOf(account), 0n),
          safe(pool.getLevelPrincipal(account), 0n),
          safe(pool.getLevel(account), 0n),
          safe(pool.getMaxGeneration(account), 0n),
          safe(pool.claimableCommission(account), 0n),
          safe(pool.inviterOf(account), ZERO_ADDR),
          safe(pool.getUserPositions(account), [] as bigint[]),
        ]);
        next.usdtBalance = balance as bigint;
        next.usdtAllowance = allowance as bigint;
        next.myPrincipal = myPrincipal as bigint;
        next.directPrincipal = directPrincipal as bigint;
        next.levelPrincipal = levelPrincipal as bigint;
        next.level = Number(level);
        next.maxGeneration = Number(maxGen);
        next.claimableCommission = claimable as bigint;
        next.inviter = (inviter as string) || ZERO_ADDR;

        const ids = posIds as bigint[];
        const positions: FlexiblePosition[] = await Promise.all(
          ids.map(async (id) => {
            const [info, py] = await Promise.all([
              safe(pool.positions(id), null as any),
              safe(pool.pendingYield(id), 0n),
            ]);
            if (!info) {
              return { id, principal: 0n, startTime: 0, closed: true, pendingYield: 0n };
            }
            return {
              id,
              principal: info[1] as bigint,
              startTime: Number(info[2] as bigint),
              closed: info[4] as boolean,
              pendingYield: py as bigint,
            };
          })
        );
        // newest first
        positions.sort((a, b) => Number(b.id - a.id));
        next.positions = positions;
      }
      setData(next);
    } finally {
      setLoading(false);
    }
  }, [readContracts, account]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  // ---------- Write ----------
  const checkReady = useCallback(() => {
    if (!account || !writeContracts) {
      toast.error("请先连接钱包 / Please connect wallet");
      return false;
    }
    if (chainId !== BSC_CHAIN_ID) {
      toast.error("请切换到 BSC 主网 / Switch to BSC Mainnet");
      return false;
    }
    return true;
  }, [account, writeContracts, chainId]);

  const bind = useCallback(async (inviter: string) => {
    if (!checkReady()) return false;
    if (!/^0x[a-fA-F0-9]{40}$/.test(inviter)) {
      toast.error("无效地址 / Invalid address");
      return false;
    }
    if (inviter.toLowerCase() === account!.toLowerCase()) {
      toast.error("不能绑定自己 / Cannot bind yourself");
      return false;
    }
    setKey("bind", true);
    try {
      const tx = await writeContracts!.pool.bind(inviter);
      toast.info(`交易已提交: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      toast.success("绑定成功 / Bound");
      await refresh();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(e?.shortMessage || e?.message || "绑定失败");
      return false;
    } finally { setKey("bind", false); }
  }, [checkReady, writeContracts, account, refresh]);

  const approve = useCallback(async (amount: string) => {
    if (!checkReady()) return false;
    setKey("approve", true);
    try {
      const amt = parseUnits(amount || "0", USDT_DECIMALS);
      const tx = await writeContracts!.usdt.approve(FLEXIBLE_ADDRESS, amt);
      toast.info(`授权已提交: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      toast.success("授权成功 / Approved");
      await refresh();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(e?.shortMessage || e?.message || "授权失败");
      return false;
    } finally { setKey("approve", false); }
  }, [checkReady, writeContracts, refresh]);

  const deposit = useCallback(async (amount: string) => {
    if (!checkReady()) return false;
    setKey("deposit", true);
    try {
      const amt = parseUnits(amount || "0", USDT_DECIMALS);
      const tx = await writeContracts!.pool.deposit(amt);
      toast.info(`存款已提交: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      toast.success("存款成功 / Deposited");
      await refresh();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(e?.shortMessage || e?.message || "存款失败");
      return false;
    } finally { setKey("deposit", false); }
  }, [checkReady, writeContracts, refresh]);

  const previewClose = useCallback(async (id: bigint) => {
    if (!readContracts) return null;
    try {
      const r = await readContracts.pool.previewClose(id);
      return {
        principal: r[0] as bigint,
        yieldAmt: r[1] as bigint,
        principalFee: r[2] as bigint,
        yieldFee: r[3] as bigint,
        netPaid: r[4] as bigint,
      };
    } catch { return null; }
  }, [readContracts]);

  const closePosition = useCallback(async (id: bigint) => {
    if (!checkReady()) return false;
    setKey(`close-${id}`, true);
    try {
      const tx = await writeContracts!.pool.closePosition(id);
      toast.info(`平仓已提交: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      toast.success("平仓成功 / Closed");
      await refresh();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(e?.shortMessage || e?.message || "平仓失败");
      return false;
    } finally { setKey(`close-${id}`, false); }
  }, [checkReady, writeContracts, refresh]);

  const claimCommission = useCallback(async () => {
    if (!checkReady()) return false;
    setKey("claim", true);
    try {
      const tx = await writeContracts!.pool.claimCommission();
      toast.info(`领取已提交: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      toast.success("佣金领取成功 / Claimed");
      await refresh();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(e?.shortMessage || e?.message || "领取失败");
      return false;
    } finally { setKey("claim", false); }
  }, [checkReady, writeContracts, refresh]);

  // ---------- Downline by generation ----------
  const loadDownlineByGen = useCallback(
    async (maxGen: number, addressLimit = 800): Promise<Array<{ gen: number; count: number; principal: bigint }>> => {
      if (!readContracts || !account) return [];
      const { pool } = readContracts;
      const safe = async <T,>(p: Promise<T>, fb: T): Promise<T> => {
        try { return await p; } catch { return fb; }
      };
      const result: Array<{ gen: number; count: number; principal: bigint }> = [];
      const seen = new Set<string>([account.toLowerCase()]);
      let frontier: string[] = [account];
      let total = 0;
      const cap = Math.max(1, maxGen);
      for (let g = 1; g <= cap; g++) {
        if (frontier.length === 0) {
          result.push({ gen: g, count: 0, principal: 0n });
          continue;
        }
        const directsArrays = await Promise.all(
          frontier.map((addr) => safe(pool.getDirects(addr) as Promise<string[]>, [] as string[]))
        );
        const next: string[] = [];
        for (const arr of directsArrays) {
          for (const a of arr) {
            const key = a.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            next.push(a);
            total++;
            if (total >= addressLimit) break;
          }
          if (total >= addressLimit) break;
        }
        const principals = await Promise.all(
          next.map((a) => safe(pool.principalOf(a) as Promise<bigint>, 0n))
        );
        const sum = principals.reduce((s, v) => s + v, 0n);
        result.push({ gen: g, count: next.length, principal: sum });
        frontier = next;
        if (total >= addressLimit) break;
      }
      return result;
    },
    [readContracts, account]
  );

  return {
    data,
    loading,
    actionLoading,
    refresh,
    bind,
    approve,
    deposit,
    closePosition,
    previewClose,
    claimCommission,
    loadDownlineByGen,
    isBSC: chainId === BSC_CHAIN_ID,
    account,
  };
}

export const formatUSDT = (v: bigint, digits = 2) => {
  try {
    return Number(formatUnits(v, USDT_DECIMALS)).toLocaleString(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 2,
    });
  } catch { return "0.00"; }
};
