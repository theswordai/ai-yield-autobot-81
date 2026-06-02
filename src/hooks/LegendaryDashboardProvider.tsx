import { useEffect, type ReactNode } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  useLegendaryContracts,
  _setLegendaryContext,
  _resetLegendaryShared,
  _resetLegendaryWalletOnly,
  _refetchLegendary,
} from "@/hooks/useLegendary";
import { TARGET_CHAIN } from "@/config/contracts";

/**
 * Mount this ONCE at the top of the Legendary page.
 * - Owns the only auto-refetch + 30s interval.
 * - Owns the only reset-on-disconnect / wrong-chain effect.
 * - Child tabs use useLegendaryDashboard() purely as a subscriber.
 */
export function LegendaryDashboardProvider({ children }: { children: ReactNode }) {
  const { account, chainId } = useWeb3();
  const { read } = useLegendaryContracts();

  // Keep module-level context in sync so child refetch() calls work.
  useEffect(() => {
    _setLegendaryContext(read, account);
  }, [read, account]);

  // Only fully clear shared data when the account is truly disconnected.
  // On wrong-chain, we keep public-RPC-derived fields (inviter, selfStake,
  // teamPerf, positions) and only clear wallet-chain-dependent fields like
  // USDT balance / allowance — they belong to whatever network the wallet
  // is currently on and would be misleading.
  useEffect(() => {
    const wrongChain = chainId !== null && chainId !== undefined && chainId !== TARGET_CHAIN;
    if (!account) {
      _resetLegendaryShared();
    } else if (wrongChain) {
      _resetLegendaryWalletOnly();
    }
  }, [account, chainId]);

  // Single auto-refetch driver for the whole page.
  useEffect(() => {
    _refetchLegendary();
    const t = setInterval(() => {
      _refetchLegendary();
    }, 30_000);
    return () => clearInterval(t);
  }, [read, account, chainId]);

  return <>{children}</>;
}
