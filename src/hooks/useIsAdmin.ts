import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";

export function useIsAdmin() {
  const { account } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!account) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("admin_wallets")
        .select("wallet_address")
        .eq("wallet_address", account.toLowerCase())
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [account]);

  return { isAdmin, loading, account };
}
