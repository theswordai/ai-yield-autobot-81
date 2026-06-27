import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "acl_cache";

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

function isCachedDenied(account?: string | null): boolean {
  if (!account) return false;
  return readCache().has(account.toLowerCase());
}

export function useAccessStatus(account?: string | null) {
  const [denied, setDenied] = useState<boolean>(() => isCachedDenied(account));
  const [loading, setLoading] = useState<boolean>(!!account);

  useEffect(() => {
    let cancelled = false;
    if (!account) {
      setDenied(false);
      setLoading(false);
      return;
    }
    const addr = account.toLowerCase();
    setDenied(readCache().has(addr));
    setLoading(true);

    supabase
      .from("blocked_wallets")
      .select("wallet_address")
      .eq("wallet_address", addr)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const hit = !!data;
        const cache = readCache();
        if (hit) cache.add(addr);
        else cache.delete(addr);
        writeCache(cache);
        setDenied(hit);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [account]);

  return { denied, loading };
}
