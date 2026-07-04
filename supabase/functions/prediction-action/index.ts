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

  try {
    if (op === "account.claim_initial_balance") {
      const acct = await ensureAccount();
      if (acct.claimed_initial_balance_at) {
        return json({ error: "Already claimed" }, 409);
      }
      const newBal = Number(acct.balance) + INITIAL_BALANCE;
      const { data: upd, error: uerr } = await supabase
        .from("prediction_accounts")
        .update({
          balance: newBal,
          claimed_initial_balance_at: new Date().toISOString(),
        })
        .eq("wallet_address", walletLc)
        .is("claimed_initial_balance_at", null)
        .select("*")
        .single();
      if (uerr || !upd) return json({ error: "Already claimed" }, 409);
      await supabase.from("prediction_ledger").insert({
        wallet_address: walletLc,
        type: "initial_claim",
        amount: INITIAL_BALANCE,
        balance_after: newBal,
        note: "Initial 10,000 simulated USDV",
      });
      return json({ ok: true, account: upd });
    }

    if (op === "account.get") {
      const acct = await ensureAccount();
      const [ordersRes, ledgerRes, positionsRes] = await Promise.all([
        supabase.from("prediction_orders")
          .select("*")
          .eq("wallet_address", walletLc)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("prediction_ledger")
          .select("*")
          .eq("wallet_address", walletLc)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("prediction_positions")
          .select("*")
          .eq("wallet_address", walletLc),
      ]);
      return json({
        ok: true,
        account: acct,
        orders: ordersRes.data || [],
        ledger: ledgerRes.data || [],
        positions: positionsRes.data || [],
      });
    }

    if (op === "trade.place") {
      const Schema = z.object({
        market: z.object({
          market_id: z.string().min(1),
          title: z.string(),
          slug: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
          category: z.string().optional().nullable(),
          outcomes: z.array(z.string()).min(2),
          end_date: z.string().optional().nullable(),
          yes_price: z.number().optional().nullable(),
          no_price: z.number().optional().nullable(),
          volume: z.number().optional().nullable(),
          volume_24hr: z.number().optional().nullable(),
          liquidity: z.number().optional().nullable(),
          image: z.string().optional().nullable(),
          icon: z.string().optional().nullable(),
        }),
        outcome_index: z.number().int().min(0),
        outcome_label: z.string().min(1),
        amount: z.number().positive(),
        price: z.number().min(0.01).max(0.99),
      });
      const p = Schema.safeParse(payload);
      if (!p.success) return json({ error: p.error.flatten() }, 400);
      const { market, outcome_index, outcome_label, amount, price } = p.data;

      // Upsert market snapshot
      const { data: mktRow, error: mktErr } = await supabase
        .from("prediction_markets")
        .upsert({
          market_id: market.market_id,
          title: market.title,
          slug: market.slug ?? null,
          description: market.description ?? null,
          category: market.category ?? null,
          outcomes: market.outcomes,
          end_date: market.end_date ?? null,
          yes_price: market.yes_price ?? null,
          no_price: market.no_price ?? null,
          volume: market.volume ?? null,
          volume_24hr: market.volume_24hr ?? null,
          liquidity: market.liquidity ?? null,
          image: market.image ?? null,
          icon: market.icon ?? null,
        }, { onConflict: "market_id" })
        .select("*")
        .single();
      if (mktErr) return json({ error: mktErr.message }, 500);
      if (mktRow.status !== "open") return json({ error: "Market not open" }, 400);

      const acct = await ensureAccount();
      const bal = Number(acct.balance);
      const roundedAmount = round(amount, 6);
      if (bal < roundedAmount) return json({ error: "Insufficient balance" }, 400);

      const shares = round(roundedAmount / price, 8);
      const newBal = round(bal - roundedAmount, 6);
      const newInvested = round(Number(acct.total_invested) + roundedAmount, 6);

      const { error: updErr } = await supabase
        .from("prediction_accounts")
        .update({ balance: newBal, total_invested: newInvested })
        .eq("wallet_address", walletLc);
      if (updErr) return json({ error: updErr.message }, 500);

      const { data: order, error: oerr } = await supabase
        .from("prediction_orders")
        .insert({
          wallet_address: walletLc,
          market_id: market.market_id,
          outcome_index,
          outcome_label,
          amount: roundedAmount,
          price,
          shares,
          status: "open",
        })
        .select("*")
        .single();
      if (oerr) return json({ error: oerr.message }, 500);

      await supabase.from("prediction_ledger").insert({
        wallet_address: walletLc,
        market_id: market.market_id,
        order_id: order.id,
        type: "trade_open",
        amount: -roundedAmount,
        balance_after: newBal,
        note: `Buy ${outcome_label} @ ${price}`,
      });

      return json({ ok: true, order, balance: newBal });
    }

    if (op === "admin.settle_market") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const Schema = z.object({
        market_id: z.string().min(1),
        winning_outcome_index: z.number().int().min(0),
        winning_outcome_label: z.string().min(1),
        note: z.string().max(500).optional().nullable(),
      });
      const p = Schema.safeParse(payload);
      if (!p.success) return json({ error: p.error.flatten() }, 400);
      const { market_id, winning_outcome_index, winning_outcome_label, note } = p.data;

      const { data: mkt } = await supabase
        .from("prediction_markets")
        .select("*")
        .eq("market_id", market_id)
        .maybeSingle();
      if (!mkt) return json({ error: "Market not found" }, 404);
      if (mkt.status === "settled") return json({ error: "Already settled" }, 409);

      const { data: settlement, error: serr } = await supabase
        .from("prediction_settlements")
        .insert({
          market_id,
          winning_outcome_index,
          winning_outcome_label,
          source: "admin",
          settled_by_wallet: walletLc,
          note: note ?? null,
        })
        .select("*")
        .single();
      if (serr) return json({ error: serr.message }, 500);

      const { data: orders } = await supabase
        .from("prediction_orders")
        .select("*")
        .eq("market_id", market_id)
        .eq("status", "open");

      const walletDeltas = new Map<string, { payout: number; won: number; lost: number }>();
      for (const o of orders || []) {
        const isWin = o.outcome_index === winning_outcome_index;
        const payout = isWin ? round(Number(o.shares) * 1, 6) : 0;
        const pnl = round(payout - Number(o.amount), 6);
        await supabase.from("prediction_orders").update({
          status: isWin ? "won" : "lost",
          settled_at: new Date().toISOString(),
          payout,
          pnl,
        }).eq("id", o.id);

        const d = walletDeltas.get(o.wallet_address) ?? { payout: 0, won: 0, lost: 0 };
        d.payout += payout;
        if (isWin) d.won += pnl; else d.lost += pnl;
        walletDeltas.set(o.wallet_address, d);

        if (payout > 0) {
          const { data: acct } = await supabase
            .from("prediction_accounts")
            .select("balance")
            .eq("wallet_address", o.wallet_address)
            .maybeSingle();
          const newBal = round(Number(acct?.balance ?? 0) + payout, 6);
          await supabase.from("prediction_ledger").insert({
            wallet_address: o.wallet_address,
            market_id,
            order_id: o.id,
            type: "trade_settle_win",
            amount: payout,
            balance_after: newBal,
            note: `Won ${o.outcome_label}`,
          });
        } else {
          const { data: acct } = await supabase
            .from("prediction_accounts")
            .select("balance")
            .eq("wallet_address", o.wallet_address)
            .maybeSingle();
          await supabase.from("prediction_ledger").insert({
            wallet_address: o.wallet_address,
            market_id,
            order_id: o.id,
            type: "trade_settle_loss",
            amount: 0,
            balance_after: Number(acct?.balance ?? 0),
            note: `Lost ${o.outcome_label}`,
          });
        }
      }

      // Update account aggregates + balances
      for (const [w, d] of walletDeltas) {
        const { data: acct } = await supabase
          .from("prediction_accounts")
          .select("*")
          .eq("wallet_address", w)
          .maybeSingle();
        if (!acct) continue;
        const newBal = round(Number(acct.balance) + d.payout, 6);
        const newPayout = round(Number(acct.total_payout) + d.payout, 6);
        const newPnl = round(Number(acct.realized_pnl) + d.won + d.lost, 6);
        await supabase.from("prediction_accounts").update({
          balance: newBal,
          total_payout: newPayout,
          realized_pnl: newPnl,
        }).eq("wallet_address", w);
      }

      await supabase.from("prediction_markets").update({ status: "settled" }).eq("market_id", market_id);

      return json({ ok: true, settlement, affected_orders: orders?.length ?? 0 });
    }

    if (op === "admin.adjust_balance") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const Schema = z.object({
        wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        delta: z.number().refine((n) => n !== 0, "delta must be non-zero"),
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
      const newBal = round(currBal + p.data.delta, 6);
      if (newBal < 0) return json({ error: "Would go negative" }, 400);
      await supabase.from("prediction_accounts")
        .update({ balance: newBal })
        .eq("wallet_address", targetLc);
      await supabase.from("prediction_ledger").insert({
        wallet_address: targetLc,
        type: "admin_adjust",
        amount: p.data.delta,
        balance_after: newBal,
        note: p.data.note ?? `Admin adjust by ${walletLc}`,
      });
      return json({ ok: true, balance: newBal });
    }

    if (op === "admin.list_markets") {
      if (!(await isAdmin())) return json({ error: "Not admin" }, 403);
      const { data: markets } = await supabase
        .from("prediction_markets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500);
      const ids = (markets || []).map((m) => m.market_id);
      let counts: Record<string, number> = {};
      let settlements: Record<string, any> = {};
      if (ids.length) {
        const { data: openOrders } = await supabase
          .from("prediction_orders")
          .select("market_id")
          .in("market_id", ids)
          .eq("status", "open");
        for (const r of openOrders || []) counts[r.market_id] = (counts[r.market_id] || 0) + 1;
        const { data: sets } = await supabase
          .from("prediction_settlements")
          .select("*")
          .in("market_id", ids);
        for (const s of sets || []) settlements[s.market_id] = s;
      }
      return json({
        ok: true,
        markets: (markets || []).map((m) => ({
          ...m,
          open_order_count: counts[m.market_id] || 0,
          settlement: settlements[m.market_id] || null,
        })),
      });
    }

    return json({ error: "Unknown op" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message || String(e) }, 500);
  }
});
