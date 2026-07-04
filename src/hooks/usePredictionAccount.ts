import { useCallback, useEffect, useState } from "react";
import { callPredictionAction } from "@/lib/predictionAction";

export interface PredictionAccount {
  wallet_address: string;
  balance: number;
  total_pnl: number;
  claimed_initial_balance: boolean;
  created_at: string;
  updated_at: string;
}

export interface PredictionOrder {
  id: string;
  wallet_address: string;
  polymarket_id: string;
  outcome: string;
  amount: number;
  price: number;
  shares: number;
  status: "open" | "won" | "lost" | "refunded";
  payout: number;
  pnl: number;
  created_at: string;
  settled_at: string | null;
}

export interface PredictionPosition {
  wallet_address: string;
  polymarket_id: string;
  outcome: string;
  shares: number;
  invested: number;
  avg_price: number;
  realized_pnl: number;
  status: "open" | "won" | "lost" | "refunded";
  updated_at: string;
}

export interface PredictionLedgerEntry {
  id: string;
  wallet_address: string;
  type: string;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

interface Snapshot {
  account: PredictionAccount | null;
  orders: PredictionOrder[];
  positions: PredictionPosition[];
  ledger: PredictionLedgerEntry[];
}

function toNum(v: unknown, d = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function usePredictionAccount(account: string | null) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callPredictionAction("account.get");
      setData({
        account: res.account
          ? {
              ...res.account,
              balance: toNum(res.account.balance),
              total_pnl: toNum(res.account.total_pnl),
              claimed_initial_balance: !!res.account.claimed_initial_balance,
            }
          : null,
        orders: (res.orders || []).map((o: any) => ({
          ...o,
          amount: toNum(o.amount),
          price: toNum(o.price),
          shares: toNum(o.shares),
          payout: toNum(o.payout),
          pnl: toNum(o.pnl),
        })),
        positions: (res.positions || []).map((p: any) => ({
          ...p,
          shares: toNum(p.shares),
          invested: toNum(p.invested),
          avg_price: toNum(p.avg_price),
          realized_pnl: toNum(p.realized_pnl),
        })),
        ledger: (res.ledger || []).map((l: any) => ({
          ...l,
          amount: toNum(l.amount),
          balance_after: toNum(l.balance_after),
        })),
      });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    setData(null);
    if (account) void refresh();
  }, [account, refresh]);

  return { data, loading, error, refresh };
}
