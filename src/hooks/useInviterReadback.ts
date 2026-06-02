import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { LegendaryReferral_ABI } from "@/abis/LegendaryReferral";
import { LEGENDARY_REFERRAL_ADDRESS } from "@/config/legendary";
import { getReadProvider } from "@/lib/rpcClient";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/**
 * Independent, account-scoped readback of `inviterOf(account)` straight from
 * the public-RPC fallback provider. Survives shared-dashboard resets caused
 * by wrong-chain or transient wallet hiccups, so once we've ever seen a
 * non-zero inviter for this account we never render the "bind" form again.
 */
export function useInviterReadback(account: string | null): string | null {
  const [inviter, setInviter] = useState<string | null>(null);

  useEffect(() => {
    setInviter(null);
    if (!account) return;
    let cancelled = false;
    const run = async (attempt = 0) => {
      try {
        const provider = getReadProvider();
        const c = new Contract(LEGENDARY_REFERRAL_ADDRESS, LegendaryReferral_ABI, provider);
        const inv: string = await c.inviterOf(account);
        if (cancelled) return;
        if (inv && inv.toLowerCase() !== ZERO_ADDR) {
          setInviter(inv);
        } else if (attempt < 2) {
          // Retry a couple times for transient RPC blips.
          setTimeout(() => run(attempt + 1), 1500 * (attempt + 1));
        }
      } catch {
        if (!cancelled && attempt < 3) {
          setTimeout(() => run(attempt + 1), 1500 * (attempt + 1));
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [account]);

  return inviter;
}
