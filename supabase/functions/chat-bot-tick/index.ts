import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

// 40 fixed "regular" wallet addresses (deterministic-looking but generated once)
const REGULAR_WALLETS: string[] = [
  "0x3a7f1c9b8d2e4a6c1f0e9b7a5d3c2e1f4b6a8d0c",
  "0x8c2e9a1b3d5f7e9c0a2b4d6f8e0c2a4b6d8f0e1c",
  "0x1f4b6a8d0c3e5f7a9b1d3c5e7f9a1b3d5c7e9f0a",
  "0x9d3c5e7f1b3a5d7f9c1e3a5d7f9b1c3e5a7d9f1b",
  "0x4a6c8e0f2d4b6a8c0e2f4d6b8a0c2e4f6d8b0a2c",
  "0x7e9c1a3d5f7b9e1c3a5d7f9b1e3c5a7d9f1b3e5c",
  "0x2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f",
  "0x5b7d9f1e3a5c7d9f1b3e5a7c9f1d3b5e7a9c1f3d",
  "0xc1e3a5d7f9b1c3e5a7d9f1b3c5e7a9d1f3b5c7e9",
  "0xf0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8",
  "0x6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d",
  "0xa3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1",
  "0x0e2f4d6b8a0c2e4f6d8b0a2c4e6f8d0b2a4c6e8f",
  "0xd5f7b9e1c3a5d7f9b1e3c5a7d9f1b3e5c7a9d1f3",
  "0x4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d",
  "0x91b3d5c7e9f1a3b5d7c9e1f3a5b7d9c1e3f5a7b9",
  "0x6f8e0c2a4b6d8f0e1c3a5b7d9f0e2c4a6b8d0f1e",
  "0xc3a5d7f9b1e3c5a7d9f1b3e5c7a9d1f3b5c7e9a1",
  "0x2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c",
  "0x7d9f1b3e5c7a9d1f3b5c7e9a1d3f5b7c9e1a3d5f",
  "0xe9f1a3b5d7c9e1f3a5b7d9c1e3f5a7b9d1c3e5f7",
  "0x4f6d8b0a2c4e6f8d0b2a4c6e8f0d2b4a6c8e0f2d",
  "0xb1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9",
  "0x82e0c4a6b8d0f2e4c6a8b0d2f4e6c8a0b2d4f6e8",
  "0x37b5d9c1e3f5a7b9d1c3e5f7a9b1d3c5e7f9a1b3",
  "0xc5a7d9f1b3c5e7a9d1f3b5c7e9a1d3f5b7c9e1a3",
  "0x6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4f",
  "0xa9c1e3f5b7d9a1c3e5f7b9d1a3c5e7f9b1d3a5c7",
  "0x18d4f0e2c6a8b4d0f2e6c8a4b0d2f6e8c4a0b2d6",
  "0x5c7a9d1f3b5e7c9a1d3f5b7e9c1a3d5f7b9e1c3a",
  "0xb7d9c1e3f5a7b9d1c3e5f7a9b1d3c5e7f9a1b3d5",
  "0x40c2e6f8a4b0d2f6e8c4a0b2d6f8e4c0a2b4d6f8",
  "0x9b1d3c5e7f9a1b3d5c7e9f1a3b5d7c9e1f3a5b7d",
  "0xe1c3a5d7f9b1e3c5a7d9f1b3e5c7a9d1f3b5c7e9",
  "0x26b8d4f0e2c6a8b4d0f2e6c8a4b0d2f6e8c4a0b2",
  "0x7f9b1c3e5a7d9f1b3c5e7a9d1f3b5c7e9a1d3f5b",
  "0xd3c5e7f9a1b3d5c7e9f1a3b5d7c9e1f3a5b7d9c1",
  "0x4e6f8d0b2a4c6e8f0d2b4a6c8e0f2d4b6a8c0e2f",
  "0xa1b3d5c7e9f1a3b5d7c9e1f3a5b7d9c1e3f5a7b9",
  "0x59f1b3e5c7a9d1f3b5c7e9a1d3f5b7c9e1a3d5f7",
];

// Templates: {amount} -> 200..20000 with 2 decimals; {yield} -> 3..380 with 2 decimals; {days} -> 90/180/365
const TEMPLATES = {
  fomo: [
    "这个项目都上了多少？我回本好久了",
    "重仓猛干兄弟们",
    "错过这波别哭，DeFi 那波没赶上，这次别再放跑了",
    "上个月没上车，我现在肠子都悔青了，现在还能干吗",
    "兄弟们冲吧，年底见分晓",
    "争取今年赚个A9",
    "兄弟们这个项目说实话，越看越踏实",
    "群里好几个人都在加仓，我也准备冲了",
    "今晚必须得加点仓，忍不住了",
    "这种机会一年也遇不到几次",
    "USDONLINE 是真的稳，我已经拉朋友进来了",
    "BSC 上现在最值得做的，我觉得就这一个",
    "那个复利曲线，看一眼你就忍不住",
    "锁仓到期之前我肯定不下车",
    "看这数据，团队确实是认真在做的",
  ],
  showoff: [
    "刚补了 {amount} U",
    "今天领了 {yield} U 收益，已经复投了",
    "锁了 {amount} U，{days} 天，到期再加",
    "刚收到 {yield} U，舒服了",
    "本金 {amount} U，滚到现在已经挺香了",
    "把币安那边搬过来 {amount} U，全锁进去了",
    "今天收益 {yield} U，继续复投",
    "复投了 {yield} U，雪球开始转了",
    "上车 {amount} U，基本没纠结",
    "从 OKX 提了 {amount} U 过来",
    "今晚再加 {amount} U",
  ],
  discuss: [
    "USDONLINE 的复利曲线是真的能打",
    "邀请奖励比我想的高，朋友也开始主动问了",
    "BSC 上的 gas 费几乎可以忽略不计",
    "审计页面的合约地址我自己去 BscScan 查过了，没问题",
    "这个团队的产品节奏还挺稳的",
    "白皮书看完，我反而更有信心了",
    "比起其他 DeFi，这个收益和透明度都算顶的",
    "看了一眼 TVL，一直在涨",
    "VIP 体系做得还可以，感觉是长期主义",
    "比我以前撸过的那些羊毛靠谱太多了",
    "美元稳定币 + 高 APY，这种组合确实不多见",
  ],
  question: [
    "{days} 天和 365 天哪个更划算？",
    "邀请人怎么绑定来着？",
    "白皮书在哪里看",
    "提现要多久到账啊",
    "锁仓中途能加仓吗",
    "新人有什么注意事项",
    "BSC 链上 gas 大概多少？",
    "这个 APY 是浮动的还是固定？",
    "邀请奖励是直接到钱包吗？",
    "客服在线时间是几点到几点",
  ],
} as const;

const CATEGORY_WEIGHTS: Array<[keyof typeof TEMPLATES, number]> = [
  ["showoff", 45],
  ["fomo", 25],
  ["discuss", 20],
  ["question", 10],
];

function pickWeighted<T>(entries: Array<[T, number]>): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNewWallet(): string {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

function pickWallet(): string {
  return Math.random() < 0.8 ? pick(REGULAR_WALLETS) : randomNewWallet();
}

function fillTemplate(t: string): string {
  return t
    .replace(/\{amount\}/g, () => (200 + Math.random() * 19800).toFixed(2))
    .replace(/\{yield\}/g, () => (3 + Math.random() * 377).toFixed(2))
    .replace(/\{days\}/g, () => pick([90, 180, 365]).toString());
}

function pickContent(): string {
  const cat = pickWeighted(CATEGORY_WEIGHTS);
  const tpl = pick(TEMPLATES[cat]);
  return fillTemplate(tpl);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // No auth: pacing logic in chat_bot_config protects against abuse — at most one
  // bot post per min_interval_minutes, regardless of who triggers the function.
  let body: any = {};
  try { body = await req.json(); } catch { /* empty */ }
  const force = false; // pacing always enforced; manual sends from admin go through direct insert
  void body;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Read config
  const { data: cfg } = await supabase
    .from("chat_bot_config").select("*").eq("id", 1).maybeSingle();
  if (!cfg) {
    return new Response(JSON.stringify({ ok: false, reason: "no-config" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!force && !cfg.enabled) {
    return new Response(JSON.stringify({ ok: true, posted: false, reason: "disabled" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let shouldPost = force;
  if (!force) {
    const { data: latest } = await supabase
      .from("chat_messages").select("created_at")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    const lastTs = latest?.created_at ? new Date(latest.created_at).getTime() : 0;
    const idleMin = (Date.now() - lastTs) / 60000;
    const minI = Math.max(1, cfg.min_interval_minutes || 20);
    const maxI = Math.max(minI + 1, cfg.max_interval_minutes || 40);

    if (idleMin < minI) {
      shouldPost = false;
    } else if (idleMin >= maxI) {
      shouldPost = true;
    } else {
      const p = (idleMin - minI) / (maxI - minI);
      shouldPost = Math.random() < p;
    }
  }

  if (!shouldPost) {
    return new Response(JSON.stringify({ ok: true, posted: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const wallet = pickWallet();
  const content = pickContent();

  const { error } = await supabase
    .from("chat_messages").insert({ wallet_address: wallet, content });
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  await supabase.from("chat_bot_config")
    .update({ last_bot_post_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", 1);

  return new Response(JSON.stringify({ ok: true, posted: true, wallet, content }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
