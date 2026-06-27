import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { verifyMessage } from "npm:ethers@6";
import { z } from "npm:zod@3";

const Body = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(10),
  message: z.string().min(10),
  op: z.enum([
    "announcement.create",
    "announcement.update",
    "announcement.delete",
    "admin.bootstrap",
    "blocked.add",
    "blocked.delete",
    "blocked.list",
  ]),
  payload: z.record(z.any()).optional(),
});

const MAX_SKEW_MS = 5 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const { wallet, signature, message, op, payload = {} } = parsed.data;

  // Verify message format: "USD.ONLINE admin action\nop=<op>\nts=<ms>\nnonce=<hex>"
  const m = message.match(/^USD\.ONLINE admin action\nop=([\w.]+)\nts=(\d+)\nnonce=[a-f0-9]{8,}$/);
  if (!m) return json({ error: "Bad message format" }, 400);
  if (m[1] !== op) return json({ error: "op mismatch" }, 400);
  const ts = Number(m[2]);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return json({ error: "Stale signature" }, 401);
  }

  // Verify signature recovers to wallet
  let recovered: string;
  try { recovered = verifyMessage(message, signature); }
  catch { return json({ error: "Invalid signature" }, 401); }
  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    return json({ error: "Signer mismatch" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Bootstrap: only allowed when admin_wallets is empty.
  if (op === "admin.bootstrap") {
    const { count } = await supabase
      .from("admin_wallets")
      .select("*", { count: "exact", head: true });
    if ((count || 0) > 0) return json({ error: "Admin already exists" }, 403);
    const { error } = await supabase
      .from("admin_wallets")
      .insert({ wallet_address: wallet.toLowerCase(), note: "first admin" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  // All other ops require admin
  const { data: isAdmin } = await supabase.rpc("is_admin_wallet", { _wallet: wallet.toLowerCase() });
  if (!isAdmin) return json({ error: "Not admin" }, 403);

  if (op === "announcement.create") {
    const Schema = z.object({
      title: z.string().trim().min(1).max(500),
      content: z.string().trim().min(1).max(20000),
      image_url: z.string().max(5_000_000).nullable().optional(),
      priority: z.number().int().min(-100).max(100).optional(),
    });
    const p = Schema.safeParse(payload);
    if (!p.success) return json({ error: p.error.flatten() }, 400);
    const { error } = await supabase.from("announcements").insert({
      title: p.data.title,
      content: p.data.content,
      image_url: p.data.image_url ?? null,
      priority: p.data.priority ?? 0,
      is_active: true,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (op === "announcement.update") {
    const Schema = z.object({
      id: z.string().uuid(),
      fields: z.object({
        title: z.string().trim().min(1).max(500).optional(),
        content: z.string().trim().min(1).max(20000).optional(),
        image_url: z.string().max(5_000_000).nullable().optional(),
        priority: z.number().int().min(-100).max(100).optional(),
        is_active: z.boolean().optional(),
      }),
    });
    const p = Schema.safeParse(payload);
    if (!p.success) return json({ error: p.error.flatten() }, 400);
    const { error } = await supabase.from("announcements").update(p.data.fields).eq("id", p.data.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (op === "announcement.delete") {
    const Schema = z.object({ id: z.string().uuid() });
    const p = Schema.safeParse(payload);
    if (!p.success) return json({ error: p.error.flatten() }, 400);
    const { error } = await supabase.from("announcements").delete().eq("id", p.data.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (op === "blocked.add") {
    const Schema = z.object({
      wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      note: z.string().max(500).optional().nullable(),
    });
    const p = Schema.safeParse(payload);
    if (!p.success) return json({ error: p.error.flatten() }, 400);
    const { error } = await supabase
      .from("blocked_wallets")
      .upsert({
        wallet_address: p.data.wallet_address.toLowerCase(),
        note: p.data.note ?? null,
      });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (op === "blocked.delete") {
    const Schema = z.object({
      wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    });
    const p = Schema.safeParse(payload);
    if (!p.success) return json({ error: p.error.flatten() }, 400);
    const { error } = await supabase
      .from("blocked_wallets")
      .delete()
      .eq("wallet_address", p.data.wallet_address.toLowerCase());
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (op === "blocked.list") {
    const { data, error } = await supabase
      .from("blocked_wallets")
      .select("wallet_address, note, created_at")
      .order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, rows: data || [] });
  }

  return json({ error: "Unknown op" }, 400);
});
