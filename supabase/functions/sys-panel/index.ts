import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { verifyMessage } from "npm:ethers@6";
import { z } from "npm:zod@3";

const Body = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(10),
  message: z.string().min(10),
  op: z.enum(["verify", "blocked.list", "blocked.add", "blocked.delete"]),
  payload: z.record(z.any()).optional(),
});

const MAX_SKEW_MS = 5 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function verifySig(wallet: string, signature: string, message: string) {
  const m = message.match(/^USD\.ONLINE sys action\nop=([\w.]+)\nts=(\d+)\nnonce=[a-f0-9]{8,}$/);
  if (!m) return { ok: false, error: "Bad message format" };
  const ts = Number(m[2]);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return { ok: false, error: "Stale signature" };
  }
  let recovered: string;
  try { recovered = verifyMessage(message, signature); }
  catch { return { ok: false, error: "Invalid signature" }; }
  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    return { ok: false, error: "Signer mismatch" };
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const { wallet, signature, message, op, payload = {} } = parsed.data;

  const sigCheck = verifySig(wallet, signature, message);
  if (!sigCheck.ok) return json({ error: sigCheck.error }, 401);

  const superAdmin = Deno.env.get("SUPER_ADMIN_WALLET");
  if (!superAdmin) return json({ error: "Not configured" }, 503);
  if (wallet.toLowerCase() !== superAdmin.toLowerCase()) {
    return json({ error: "Unauthorized" }, 403);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (op === "verify") {
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

  return json({ error: "Unknown op" }, 400);
});
