import { LEGENDARY_STAKING_ADDRESS } from "@/config/legendary";
import { supabase } from "@/integrations/supabase/client";

export type ClaimRecord = {
  hash: string;
  block: number;
  amount: bigint;
  ts?: number;
};

const cacheKey = (account: string) =>
  `legendary_claims_v1_${account.toLowerCase()}_${LEGENDARY_STAKING_ADDRESS.toLowerCase()}`;

export function readClaimCache(account: string): ClaimRecord[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(account));
    if (!raw) return null;
    const arr = JSON.parse(raw) as Array<Omit<ClaimRecord, "amount"> & { amount: string }>;
    return arr.map((r) => ({ ...r, amount: BigInt(r.amount) }));
  } catch {
    return null;
  }
}

export function writeClaimCache(account: string, records: ClaimRecord[]) {
  try {
    localStorage.setItem(
      cacheKey(account),
      JSON.stringify(records.map((r) => ({ ...r, amount: r.amount.toString() }))),
    );
  } catch {
    // ignore
  }
}

export async function fetchClaimHistory(account: string): Promise<ClaimRecord[]> {
  const { data, error } = await supabase.functions.invoke("etherscan-claims", {
    body: {
      user: account,
      contract: LEGENDARY_STAKING_ADDRESS,
    },
  });
  if (error) throw new Error(error.message || "请求失败");
  if (data?.error) throw new Error(data.error);
  const records = (data?.records ?? []) as Array<{
    hash: string;
    block: number;
    ts?: number;
    amount: string;
  }>;
  return records.map((r) => ({ ...r, amount: BigInt(r.amount) }));
}
