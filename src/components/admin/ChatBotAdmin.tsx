import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bot, Send, Loader2 } from "lucide-react";

interface BotConfig {
  enabled: boolean;
  min_interval_minutes: number;
  max_interval_minutes: number;
  last_bot_post_at: string | null;
}

export function ChatBotAdmin() {
  const [cfg, setCfg] = useState<BotConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("chat_bot_config").select("*").eq("id", 1).maybeSingle();
    if (data) setCfg(data as any);
  };

  useEffect(() => { load(); }, []);

  const update = async (patch: Partial<BotConfig>) => {
    if (!cfg) return;
    const next = { ...cfg, ...patch };
    if (next.max_interval_minutes <= next.min_interval_minutes) {
      next.max_interval_minutes = next.min_interval_minutes + 1;
    }
    setCfg(next);
    setSaving(true);
    const { error } = await supabase.from("chat_bot_config").update({
      enabled: next.enabled,
      min_interval_minutes: next.min_interval_minutes,
      max_interval_minutes: next.max_interval_minutes,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) toast({ title: "保存失败", description: error.message, variant: "destructive" });
  };

  const sendOne = async () => {
    setSending(true);
    try {
      // Pick from same regular pool client-side (small subset is fine for manual test)
      const wallets = [
        "0x3a7f1c9b8d2e4a6c1f0e9b7a5d3c2e1f4b6a8d0c",
        "0x8c2e9a1b3d5f7e9c0a2b4d6f8e0c2a4b6d8f0e1c",
        "0x9d3c5e7f1b3a5d7f9c1e3a5d7f9b1c3e5a7d9f1b",
        "0xa3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1",
      ];
      const lines = [
        "再观望就真的晚了",
        `刚补仓 ${(200 + Math.random() * 19800).toFixed(2)} U`,
        "USDONLINE 的复利曲线是真扛打",
        "邀请人怎么绑定来着？",
      ];
      const wallet = wallets[Math.floor(Math.random() * wallets.length)];
      const content = lines[Math.floor(Math.random() * lines.length)];
      const { error } = await supabase.from("chat_messages").insert({ wallet_address: wallet, content });
      if (error) throw error;
      toast({ title: "已发送一条机器人消息", description: `${wallet.slice(0, 6)}…：${content}` });
    } catch (e: any) {
      toast({ title: "发送失败", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (!cfg) return <p className="text-sm text-muted-foreground">加载中...</p>;

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">聊天机器人</h3>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="bot-enabled" className="text-sm">{cfg.enabled ? "已启用" : "已停用"}</Label>
            <Switch id="bot-enabled" checked={cfg.enabled} onCheckedChange={(v) => update({ enabled: v })} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          机器人会在大厅冷场超过最小间隔后，按概率发布 FOMO/晒单/讨论/提问类消息，
          冷场超过最大间隔则必发一条。真人活跃时机器人会自动安静。
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">最小间隔</Label>
            <span className="text-xs font-mono text-muted-foreground">{cfg.min_interval_minutes} 分钟</span>
          </div>
          <Slider
            min={5} max={60} step={1}
            value={[cfg.min_interval_minutes]}
            onValueChange={(v) => update({ min_interval_minutes: v[0] })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">最大间隔</Label>
            <span className="text-xs font-mono text-muted-foreground">{cfg.max_interval_minutes} 分钟</span>
          </div>
          <Slider
            min={10} max={120} step={1}
            value={[cfg.max_interval_minutes]}
            onValueChange={(v) => update({ max_interval_minutes: v[0] })}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            上次机器人发言：{cfg.last_bot_post_at ? new Date(cfg.last_bot_post_at).toLocaleString() : "—"}
          </span>
          <Button size="sm" onClick={sendOne} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            立即发一条
          </Button>
        </div>
        {saving && <p className="text-[10px] text-muted-foreground">保存中...</p>}
      </Card>

      <Card className="p-4 space-y-2">
        <h4 className="font-semibold text-sm">说明</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>定时任务每分钟触发一次，按节奏决定是否发言。</li>
          <li>每次发言：80% 从固定老用户池抽取地址，20% 即时随机生成新地址。</li>
          <li>文案分为 FOMO 短句、晒单数字、项目讨论、提问互动四类，权重 35/30/20/15。</li>
          <li>「立即发一条」会绕过节奏直接发送，可用于测试效果。</li>
        </ul>
      </Card>
    </div>
  );
}
