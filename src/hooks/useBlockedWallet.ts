import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useBlockedWallet(account?: string | null) {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!account) {
      setBlocked(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const addr = account.toLowerCase();
    supabase
      .from("blocked_wallets")
      .select("wallet_address")
      .eq("wallet_address", addr)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setBlocked(!!data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [account]);

  return { blocked, loading };
}
