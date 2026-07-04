import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { verifyMessage } from "npm:ethers@6";
import { z } from "npm:zod@3";

const INITIAL_BALANCE = 10000;
const MAX_SKEW_MS = 5 * 60 * 1000;

const Body = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(10),
  message: z.string().min(10),
  op: z.enum([
    "account.claim_initial_balance",
    "account.get",
    "trade.place",
    "admin.settle_market",
    "admin.adjust_balance",
    "admin.list_markets",
  ]),
  payload: z.record(z.any()).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function round(n: number, d = 8) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const { wallet, signature, message, op, payload = {} } = parsed.data;

  // Verify message format: "USD.ONLINE prediction action\nop=<op>\nts=<ms>\nnonce=<hex>"
  const m = message.match(/^USD\.ONLINE prediction action\nop=([\w.]+)\nts=(\d+)\nnonce=[a-f0-9]{8,}$/);
  if (!m) return json({ error: "Bad message format" }, 400);
  if (m[1] !== op) return json({ error: "op mismatch" }, 400);
  const ts = Number(m[2]);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return json({ error: "Stale signature" }, 401);
  }

  let recovered: string;
  try { recovered = verifyMessage(message, signature); }
  catch { return json({ error: "Invalid signature" }, 401); }
  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    return json({ error: "Signer mismatch" }, 401);
  }
  const walletLc = wallet.toLowerCase();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  async function ensureAccount() {
    const { data } = await supabase
      .from("prediction_accounts")
      .select("*")
      .eq("wallet_address", walletLc)
      .maybeSingle();
    if (data) return data;
    const { data: created, error } = await supabase
      .from("prediction_accounts")
      .insert({ wallet_address: walletLc, balance: 0 })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return created;
  }

  async function isAdmin(): Promise<boolean> {
    const { data } = await supabase.rpc("is_admin_wallet", { _wallet: walletLc });
    return !!data;
  }

  async function writeLedger(entry: {
    wallet_address: string;
    type: string;
    amount: number;
    balance_after: number;
    reference_type?: string | null;
    reference_id?: string | null;
    note?: string | null;
  }) {
    await supabase.from("prediction_ledger").insert(entry);
  }

  try {
    // ── account.claim_initial_balance ─────────────────────────────
    if (op === "account.claim_initial_balance") {
      const acct = await ensureAccount();
      if (acct.claimed_initial_balance) {
        return json({ error: "Already claimed" }, 409);
      }
      const newBal = round(Number(acct.balance) + INITIAL_BALANCE, 6);
      const { data: upd, error: uerr } = await supabase
        .from("prediction_accounts")
        .update({ balance: newBal, claimed_initial_balance: true })
        .eq("wallet_address", walletLc)
        .eq("claimed_initial_balance", false)
        .select("*")
        .single();
      if (uerr || !upd) return json({ error: "Already claimed" }, 409);
      await writeLedger({
        wallet_address: walletLc,
        type: "initial_claim",
        amount: INITIAL_BALANCE,
        balance_after: newBal,
        reference_type: "system",
        note: "Initial 10,000 simulated USDV",
      });
      return json({ ok: true, account: upd });
    }

    // ── account.get ───────────────────────────────────────────────
    if (op === "account.get") {
      const acct = await ensureAccount();
      const [ordersRes, positionsRes, ledgerRes] = await Promise.all([
        supabase.from("prediction_orders")
          .select("*")
          .eq("wallet_address", walletLc)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("prediction_positions")
          .select("*")
          .eq("wallet_address", walletLc),
        supabase.from("prediction_ledger")
          .select("*")
          .eq("wallet_address", walletLc)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      return json({
        ok: true,
        account: acct,
        orders: ordersRes.data || [],
        positions: positionsRes.data || [],
        ledger: ledgerRes.data || [],
      });
    }

    // ── trade.place ───────────────────────────────────────────────
    if (op === "trade.place") {
      const Schema = z.object({
        market: z.object({
          polymarket_id: z.string().min(1),
          title: z.string().min(1),
          slug: z.string().optional().nullable(),
          outcomes: z.array(z.string()).min(2),
          end_date: z.string().optional().nullable(),
          yes_price: z.number().min(0).max(1).optional().nullable(),
          no_price: z.number().min(0).max(1).optional().nullable(),
        }),
        outcome: z.string().min(1),
        amount: z.number().positive(),
      });
      const p = Schema.safeParse(payload);
      if (!p.success) return json({ error: p.error.flatten() }, 400);
      const { market, outcome, amount } = p.data;

      // Validate outcome belongs to market
      if (!market.outcomes.includes(outcome)) {
        return json({ error: "Outcome not in market" }, 400);
      }

      // Server-side price selection from snapshot (do not trust client price directly)
      const outcomeIdx = market.outcomes.indexOf(outcome);
      let price: number | null = null;
      if (outcomeIdx === 0) price = market.yes_price ?? null;
      else if (outcomeIdx === 1) price = market.no_price ?? null;
      if (price == null || !(price > 0) || price > 1) {
        return json({ error: "Invalid price" }, 400);
      }
      // Clamp to safe trading band
      price = Math.max(0.01, Math.min(0.99, price));

      // Upsert market snapshot (do not overwrite settled markets' resolution)
      const { data: existingMarket } = await supabase
        .from("prediction_markets")
        .select("*")
        .eq("polymarket_id", market.polymarket_id)
        .maybeSingle();

      if (existingMarket && existingMarket.status !== "open") {
        return json({ error: "Market not open" }, 400);
      }

      if (existingMarket) {
        await supabase.from("prediction_markets").update({
          title: market.title,
          slug: market.slug ?? existingMarket.slug,
          outcomes: market.outcomes,
          end_date: market.end_date ?? existingMarket.end_date,
          yes_price: market.yes_price ?? existingMarket.yes_price,
          no_price: market.no_price ?? existingMarket.no_price,
        }).eq("polymarket_id", market.polymarket_id);
      } else {
        const { error: insErr } = await supabase.from("prediction_markets").insert({
          polymarket_id: market.polymarket_id,
          title: market.title,
          slug: market.slug ?? null,
          outcomes: market.outcomes,
          end_date: market.end_date ?? null,
          yes_price: market.yes_price ?? null,
          no_price: market.no_price ?? null,
        });
        if (insErr) return json({ error: insErr.message }, 500);
      }

      const acct = await ensureAccount();
      const bal = Number(acct.balance);
      const roundedAmount = round(amount, 6);
      if (bal < roundedAmount) return json({ error: "Insufficient balance" }, 400);

      const shares = round(roundedAmount / price, 8);
      const newBal = round(bal - roundedAmount, 6);

      // Deduct balance
      const { error: updErr } = await supabase
        .from("prediction_accounts")
        .update({ balance: newBal })
        .eq("wallet_address", walletLc);
      if (updErr) return json({ error: updErr.message }, 500);

      // Insert order
      const { data: order, error: oerr } = await supabase
        .from("prediction_orders")
        .insert({
          wallet_address: walletLc,
          polymarket_id: market.polymarket_id,
          outcome,
          amount: roundedAmount,
          price,
          shares,
          status: "open",
        })
        .select("*")
        .single();
      if (oerr) return json({ error: oerr.message }, 500);

      // Update/create position with weighted average
      const { data: pos } = await supabase
        .from("prediction_positions")
        .select("*")
        .eq("wallet_address", walletLc)
        .eq("polymarket_id", market.polymarket_id)
        .eq("outcome", outcome)
        .maybeSingle();

      if (pos) {
        const newShares = round(Number(pos.shares) + shares, 8);
        const newInvested = round(Number(pos.invested) + roundedAmount, 6);
        const newAvg = newShares > 0 ? round(newInvested / newShares, 8) : 0;
        await supabase.from("prediction_positions").update({
          shares: newShares,
          invested: newInvested,
          avg_price: newAvg,
          status: "open",
        })
          .eq("wallet_address", walletLc)
          .eq("polymarket_id", market.polymarket_id)
          .eq("outcome", outcome);
      } else {
        await supabase.from("prediction_positions").insert({
          wallet_address: walletLc,
          polymarket_id: market.polymarket_id,
          outcome,
          shares,
          invested: roundedAmount,
          avg_price: price,
          status: "open",
        });
      }

      await writeLedger({
        wallet_address: walletLc,
        type: "trade_open",
        amount: -roundedAmount,
        balance_after: newBal,
        reference_type: "order",
        reference_id: order.id,
        note: `Buy ${outcome} @ ${price}`,
      });

      return json({ ok: true, order, balance: newBal });
    }

    // ── admin.settle_market ───────────────────────────────────────
    if (op === "admin.settle_market") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const Schema = z.object({
        polymarket_id: z.string().min(1),
        winning_outcome: z.string().min(1),
        note: z.string().max(500).optional().nullable(),
      });
      const p = Schema.safeParse(payload);
      if (!p.success) return json({ error: p.error.flatten() }, 400);
      const { polymarket_id, winning_outcome, note } = p.data;

      const { data: mkt } = await supabase
        .from("prediction_markets")
        .select("*")
        .eq("polymarket_id", polymarket_id)
        .maybeSingle();
      if (!mkt) return json({ error: "Market not found" }, 404);
      if (mkt.status === "settled") return json({ error: "Already settled" }, 409);
      const outcomes = mkt.outcomes as string[];
      if (!Array.isArray(outcomes) || !outcomes.includes(winning_outcome)) {
        return json({ error: "Winning outcome not in market" }, 400);
      }

      const nowIso = new Date().toISOString();

      // Mark market settled first (idempotency guard via status)
      const { data: mktUpd, error: mktErr } = await supabase
        .from("prediction_markets")
        .update({
          status: "settled",
          winning_outcome,
          settled_at: nowIso,
        })
        .eq("polymarket_id", polymarket_id)
        .eq("status", "open")
        .select("*")
        .single();
      if (mktErr || !mktUpd) return json({ error: "Market already settled" }, 409);

      // Insert settlement audit
      const { data: settlement } = await supabase
        .from("prediction_settlements")
        .insert({
          polymarket_id,
          winning_outcome,
          settled_by: walletLc,
          source: "admin",
        })
        .select("*")
        .single();

      // Fetch open orders
      const { data: orders } = await supabase
        .from("prediction_orders")
        .select("*")
        .eq("polymarket_id", polymarket_id)
        .eq("status", "open");

      // Aggregate per-wallet: payout, pnl
      const walletDeltas = new Map<string, { payout: number; pnl: number }>();
      for (const o of orders || []) {
        const isWin = o.outcome === winning_outcome;
        const payout = isWin ? round(Number(o.shares) * 1, 6) : 0;
        const pnl = round(payout - Number(o.amount), 6);

        await supabase.from("prediction_orders").update({
          status: isWin ? "won" : "lost",
          payout,
          pnl,
          settled_at: nowIso,
        }).eq("id", o.id);

        const d = walletDeltas.get(o.wallet_address) ?? { payout: 0, pnl: 0 };
        d.payout = round(d.payout + payout, 6);
        d.pnl = round(d.pnl + pnl, 6);
        walletDeltas.set(o.wallet_address, d);
      }

      // Update positions per (wallet, outcome) in this market
      const { data: positions } = await supabase
        .from("prediction_positions")
        .select("*")
        .eq("polymarket_id", polymarket_id);
      for (const p of positions || []) {
        const isWin = p.outcome === winning_outcome;
        const payout = isWin ? round(Number(p.shares) * 1, 6) : 0;
        const realized = round(payout - Number(p.invested), 6);
        await supabase.from("prediction_positions").update({
          status: isWin ? "won" : "lost",
          realized_pnl: realized,
        })
          .eq("wallet_address", p.wallet_address)
          .eq("polymarket_id", polymarket_id)
          .eq("outcome", p.outcome);
      }

      // Credit accounts + write ledger
      for (const [w, d] of walletDeltas) {
        const { data: acct } = await supabase
          .from("prediction_accounts")
          .select("balance,total_pnl")
          .eq("wallet_address", w)
          .maybeSingle();
        if (!acct) continue;
        const newBal = round(Number(acct.balance) + d.payout, 6);
        const newPnl = round(Number(acct.total_pnl) + d.pnl, 6);
        await supabase.from("prediction_accounts").update({
          balance: newBal,
          total_pnl: newPnl,
        }).eq("wallet_address", w);

        await writeLedger({
          wallet_address: w,
          type: d.payout > 0 ? "settle_payout" : "settle_loss",
          amount: d.payout,
          balance_after: newBal,
          reference_type: "market",
          reference_id: polymarket_id,
          note: `Settled ${polymarket_id} → ${winning_outcome}${note ? ` (${note})` : ""}`,
        });
      }

      return json({
        ok: true,
        settlement,
        market: mktUpd,
        affected_orders: orders?.length ?? 0,
      });
    }

    // ── admin.adjust_balance ──────────────────────────────────────
    if (op === "admin.adjust_balance") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const Schema = z.object({
        wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        amount: z.number().refine((n) => n !== 0, "amount must be non-zero"),
        note: z.string().max(500).optional().nullable(),
      });
      const p = Schema.safeParse(payload);
      if (!p.success) return json({ error: p.error.flatten() }, 400);
      const targetLc = p.data.wallet_address.toLowerCase();

      const { data: acct } = await supabase
        .from("prediction_accounts")
        .select("*")
        .eq("wallet_address", targetLc)
        .maybeSingle();
      let currBal = 0;
      if (!acct) {
        await supabase.from("prediction_accounts").insert({ wallet_address: targetLc, balance: 0 });
      } else {
        currBal = Number(acct.balance);
      }
      const newBal = round(currBal + p.data.amount, 6);
      if (newBal < 0) return json({ error: "Would go negative" }, 400);
      await supabase.from("prediction_accounts")
        .update({ balance: newBal })
        .eq("wallet_address", targetLc);
      await writeLedger({
        wallet_address: targetLc,
        type: "admin_adjust",
        amount: p.data.amount,
        balance_after: newBal,
        reference_type: "admin",
        reference_id: walletLc,
        note: p.data.note ?? `Admin adjust by ${walletLc}`,
      });
      return json({ ok: true, balance: newBal });
    }

    // ── admin.list_markets ────────────────────────────────────────
    if (op === "admin.list_markets") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const { data: markets } = await supabase
        .from("prediction_markets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500);
      const ids = (markets || []).map((m) => m.polymarket_id);
      const counts: Record<string, number> = {};
      if (ids.length) {
        const { data: openOrders } = await supabase
          .from("prediction_orders")
          .select("polymarket_id")
          .in("polymarket_id", ids)
          .eq("status", "open");
        for (const r of openOrders || []) {
          counts[r.polymarket_id] = (counts[r.polymarket_id] || 0) + 1;
        }
      }
      return json({
        ok: true,
        markets: (markets || []).map((m) => ({
          ...m,
          open_order_count: counts[m.polymarket_id] || 0,
        })),
      });
    }

    return json({ error: "Unknown op" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message || String(e) }, 500);
  }
});
