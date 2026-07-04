import { useCallback, useEffect, useState } from "react";
import { callPredictionAction } from "@/lib/predictionAction";

export interface PredictionAccount {
  wallet_address: string;
  balance: number;
  total_invested: number;
  total_payout: number;
  realized_pnl: number;
  claimed_initial_balance_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PredictionOrder {
  id: string;
  wallet_address: string;
  market_id: string;
  outcome_index: number;
  outcome_label: string;
  amount: number;
  price: number;
  shares: number;
  status: "open" | "won" | "lost" | "refunded";
  settled_at: string | null;
  payout: number;
  pnl: number;
  created_at: string;
}

export interface PredictionPosition {
  wallet_address: string;
  market_id: string;
  outcome_index: number;
  outcome_label: string;
  order_count: number;
  total_amount: number;
  total_shares: number;
  avg_price: number;
}

export interface PredictionLedgerEntry {
  id: string;
  wallet_address: string;
  market_id: string | null;
  order_id: string | null;
  type: string;
  amount: number;
  balance_after: number;
  note: string | null;
  created_at: string;
}

interface Snapshot {
  account: PredictionAccount | null;
  orders: PredictionOrder[];
  ledger: PredictionLedgerEntry[];
  positions: PredictionPosition[];
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
        account: res.account,
        orders: (res.orders || []).map((o: any) => ({
          ...o,
          amount: Number(o.amount),
          price: Number(o.price),
          shares: Number(o.shares),
          payout: Number(o.payout),
          pnl: Number(o.pnl),
        })),
        ledger: (res.ledger || []).map((l: any) => ({
          ...l,
          amount: Number(l.amount),
          balance_after: Number(l.balance_after),
        })),
        positions: (res.positions || []).map((p: any) => ({
          ...p,
          order_count: Number(p.order_count),
          total_amount: Number(p.total_amount),
          total_shares: Number(p.total_shares),
          avg_price: Number(p.avg_price),
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
