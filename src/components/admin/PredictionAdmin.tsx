import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { callPredictionAction } from "@/lib/predictionAction";

interface AdminMarketRow {
  market_id: string;
  title: string;
  status: string;
  outcomes: string[];
  open_order_count: number;
  settlement: { winning_outcome_index: number; winning_outcome_label: string; note: string | null } | null;
}

export function PredictionAdmin() {
  const [markets, setMarkets] = useState<AdminMarketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Adjust balance form state
  const [adjustWallet, setAdjustWallet] = useState("");
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await callPredictionAction("admin.list_markets");
      setMarkets(res.markets || []);
    } catch (e: any) {
      toast({ title: "加载失败", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const settle = async (m: AdminMarketRow, idx: number, note: string) => {
    setBusy(m.market_id);
    try {
      await callPredictionAction("admin.settle_market", {
        market_id: m.market_id,
        winning_outcome_index: idx,
        winning_outcome_label: m.outcomes[idx],
        note: note || null,
      });
      toast({ title: "已结算" });
      await refresh();
    } catch (e: any) {
      toast({ title: "结算失败", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const adjust = async () => {
    const delta = parseFloat(adjustDelta);
    if (!/^0x[a-fA-F0-9]{40}$/.test(adjustWallet)) {
      toast({ title: "无效钱包地址", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(delta) || delta === 0) {
      toast({ title: "delta 必须为非零数字", variant: "destructive" });
      return;
    }
    setAdjusting(true);
    try {
      const res = await callPredictionAction("admin.adjust_balance", {
        wallet_address: adjustWallet,
        delta,
        note: adjustNote || null,
      });
      toast({ title: "已调整", description: `新余额: ${res.balance}` });
      setAdjustWallet(""); setAdjustDelta(""); setAdjustNote("");
    } catch (e: any) {
      toast({ title: "调整失败", description: e?.message, variant: "destructive" });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">调整钱包模拟余额</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input placeholder="0x... 钱包地址" value={adjustWallet} onChange={(e) => setAdjustWallet(e.target.value)} />
          <Input type="number" placeholder="delta (可为负)" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} />
          <Input placeholder="备注（可选）" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
        </div>
        <Button onClick={adjust} disabled={adjusting}>
          {adjusting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}调整余额
        </Button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">预测市场缓存</h3>
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "刷新"}
          </Button>
        </div>
        {markets.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">暂无缓存市场（用户下单后自动缓存）。</p>
        )}
        <div className="space-y-3">
          {markets.map((m) => (
            <MarketSettleRow key={m.market_id} market={m} busy={busy === m.market_id} onSettle={settle} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function MarketSettleRow({
  market, busy, onSettle,
}: { market: AdminMarketRow; busy: boolean; onSettle: (m: AdminMarketRow, idx: number, note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <div className="border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{market.title}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">{market.market_id}</p>
        </div>
        <Badge variant={market.status === "settled" ? "secondary" : "default"}>{market.status}</Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        Open orders: {market.open_order_count}
        {market.settlement && (
          <span className="ml-2">· Winner: <b>{market.settlement.winning_outcome_label}</b></span>
        )}
      </div>
      {market.status !== "settled" && (
        <div className="space-y-2">
          <Input placeholder="结算备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs" />
          <div className="flex flex-wrap gap-2">
            {market.outcomes.map((o, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onSettle(market, i, note)}
              >
                {busy && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                结算为 {o}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
