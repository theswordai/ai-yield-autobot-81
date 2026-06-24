import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "blocked_wallets_cache";

function readCache(): Set<string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((s: string) => s.toLowerCase()));
  } catch {
    return new Set();
  }
}

function writeCache(set: Set<string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

function isCachedBlocked(account?: string | null): boolean {
  if (!account) return false;
  return readCache().has(account.toLowerCase());
}

export function useBlockedWallet(account?: string | null) {
  // Synchronously initialize from cache so the first render already reflects
  // a known-blocked wallet — no flash of unblocked content.
  const [blocked, setBlocked] = useState<boolean>(() => isCachedBlocked(account));
  const [loading, setLoading] = useState<boolean>(!!account);

  useEffect(() => {
    let cancelled = false;
    if (!account) {
      setBlocked(false);
      setLoading(false);
      return;
    }
    const addr = account.toLowerCase();
    // Re-sync from cache for the new account immediately.
    setBlocked(readCache().has(addr));
    setLoading(true);

    supabase
      .from("blocked_wallets")
      .select("wallet_address")
      .eq("wallet_address", addr)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const isBlocked = !!data;
        const cache = readCache();
        if (isBlocked) {
          cache.add(addr);
        } else {
          cache.delete(addr);
        }
        writeCache(cache);
        setBlocked(isBlocked);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [account]);

  return { blocked, loading };
}
