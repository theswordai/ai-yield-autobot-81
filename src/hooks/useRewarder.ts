import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { toast } from "sonner";
import { useWeb3 } from "./useWeb3";
import { Rewarder_ABI } from "@/abis/Rewarder";
import { USDV_ABI } from "@/abis/USDV";
import { REWARDER_ADDRESS, USDV_TOKEN_ADDRESS, USDV_DECIMALS } from "@/config/rewarder";
import { BSC_CHAIN_ID } from "@/config/flexible";

export interface UsdvPositionStatus {
  registered: boolean;
  claimed: boolean;
  preview: bigint; // previewLive while open, previewClaim when closed
}

export interface UsdvGlobalInfo {
  multiplier: bigint;
  totalMinted: bigint;
  usdvBalance: bigint;
}

const safe = async <T,>(p: Promise<T>, fb: T): Promise<T> => {
  try { return await p; } catch { return fb; }
};

const mapErr = (msg: string, isZh: boolean): string => {
  const m = msg.toLowerCase();
  if (m.includes("already registered")) return isZh ? "该仓位已激活" : "Already registered";
  if (m.includes("already closed")) return isZh ? "仓位已平仓，无法激活" : "Position already closed — cannot activate";
  if (m.includes("not registered")) return isZh ? "该仓位未激活 USDV 奖励" : "Position not registered";
  if (m.includes("not closed") || m.includes("position not closed")) return isZh ? "请先平仓后再领取 USDV" : "Close position first";
  if (m.includes("already claimed")) return isZh ? "USDV 奖励已领取" : "Already claimed";
  if (m.includes("daily mint cap") || m.includes("daily cap")) return isZh ? "今日 USDV 铸造上限已达，请明天再试" : "Daily USDV mint cap reached, try tomorrow";
  return msg;
};

export function useRewarder(isZh: boolean) {
  const { provider, signer, account, chainId } = useWeb3();

  const reader = useMemo(() => {
    if (!provider) return null;
    return {
      rewarder: new Contract(REWARDER_ADDRESS, Rewarder_ABI, provider),
      usdv: new Contract(USDV_TOKEN_ADDRESS, USDV_ABI, provider),
    };
  }, [provider]);

  const writer = useMemo(() => {
    if (!signer) return null;
    return new Contract(REWARDER_ADDRESS, Rewarder_ABI, signer);
  }, [signer]);

  const [global, setGlobal] = useState<UsdvGlobalInfo>({
    multiplier: 10n, totalMinted: 0n, usdvBalance: 0n,
  });
  const [statusMap, setStatusMap] = useState<Record<string, UsdvPositionStatus>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const setKey = (k: string, v: boolean) => setActionLoading((p) => ({ ...p, [k]: v }));

  const refreshGlobal = useCallback(async () => {
    if (!reader) return;
    const [mult, total, bal] = await Promise.all([
      safe(reader.rewarder.multiplier() as Promise<bigint>, 10n),
      safe(reader.rewarder.totalUsdvMinted() as Promise<bigint>, 0n),
      account ? safe(reader.usdv.balanceOf(account) as Promise<bigint>, 0n) : Promise.resolve(0n),
    ]);
    setGlobal({ multiplier: mult, totalMinted: total, usdvBalance: bal });
  }, [reader, account]);

  const fetchStatuses = useCallback(
    async (positions: Array<{ id: bigint; closed: boolean }>) => {
      if (!reader || positions.length === 0) {
        setStatusMap({});
        return;
      }
      const entries = await Promise.all(
        positions.map(async (p) => {
          const [registered, claimed] = await Promise.all([
            safe(reader.rewarder.isRegistered(p.id) as Promise<boolean>, false),
            safe(reader.rewarder.isClaimed(p.id) as Promise<boolean>, false),
          ]);
          let preview = 0n;
          if (registered) {
            preview = p.closed
              ? await safe(reader.rewarder.previewClaim(p.id) as Promise<bigint>, 0n)
              : await safe(reader.rewarder.previewLive(p.id) as Promise<bigint>, 0n);
          }
          return [p.id.toString(), { registered, claimed, preview } as UsdvPositionStatus] as const;
        })
      );
      setStatusMap(Object.fromEntries(entries));
    },
    [reader]
  );

  useEffect(() => { refreshGlobal(); }, [refreshGlobal]);

  const checkReady = useCallback(() => {
    if (!account || !writer) {
      toast.error(isZh ? "请先连接钱包" : "Please connect wallet");
      return false;
    }
    if (chainId !== BSC_CHAIN_ID) {
      toast.error(isZh ? "请切换到 BSC 主网" : "Switch to BSC Mainnet");
      return false;
    }
    return true;
  }, [account, writer, chainId, isZh]);

  const register = useCallback(async (id: bigint) => {
    if (!checkReady()) return false;
    const k = `register-${id}`;
    setKey(k, true);
    try {
      const tx = await writer!.register(id);
      toast.info(isZh ? `激活已提交: ${tx.hash.slice(0, 10)}…` : `Submitted: ${tx.hash.slice(0, 10)}…`);
      await tx.wait();
      toast.success(isZh ? "USDV 奖励已激活" : "USDV reward activated");
      await refreshGlobal();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(mapErr(e?.shortMessage || e?.message || "register failed", isZh));
      return false;
    } finally { setKey(k, false); }
  }, [checkReady, writer, refreshGlobal, isZh]);

  const claim = useCallback(async (id: bigint) => {
    if (!checkReady()) return false;
    const k = `claim-usdv-${id}`;
    setKey(k, true);
    try {
      const tx = await writer!.claim(id);
      toast.info(isZh ? `领取已提交: ${tx.hash.slice(0, 10)}…` : `Submitted: ${tx.hash.slice(0, 10)}…`);
      await tx.wait();
      toast.success(isZh ? "USDV 已到账" : "USDV claimed");
      await refreshGlobal();
      return true;
    } catch (e: any) {
      if (e?.code !== 4001) toast.error(mapErr(e?.shortMessage || e?.message || "claim failed", isZh));
      return false;
    } finally { setKey(k, false); }
  }, [checkReady, writer, refreshGlobal, isZh]);

  return {
    global,
    statusMap,
    actionLoading,
    fetchStatuses,
    refreshGlobal,
    register,
    claim,
  };
}

export const formatUSDV = (v: bigint, digits = 2) => {
  try {
    return Number(formatUnits(v, USDV_DECIMALS)).toLocaleString(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 2,
    });
  } catch { return "0.00"; }
};
