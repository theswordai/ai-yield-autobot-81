import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function InboxAdmin() {
  const [addresses, setAddresses] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const list = addresses.split(/[\s,;]+/).map((a) => a.trim().toLowerCase()).filter((a) => /^0x[a-f0-9]{40}$/.test(a));
    if (list.length === 0) { toast({ title: "请填写至少一个有效钱包地址" }); return; }
    if (!title.trim() || !content.trim()) { toast({ title: "请填写标题和内容" }); return; }
    setSending(true);
    const rows = list.map((wallet_address) => ({ wallet_address, title, content }));
    const { error } = await supabase.from("inbox_messages").insert(rows);
    setSending(false);
    if (error) { toast({ title: "发送失败", description: error.message, variant: "destructive" }); return; }
    toast({ title: `已发送给 ${list.length} 个地址` });
    setTitle(""); setContent(""); setAddresses("");
  };

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">发送站内信</h3>
      <Textarea
        placeholder="目标钱包地址（多个用逗号、空格或换行分隔）"
        rows={4}
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
      />
      <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="内容" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
      <Button onClick={send} disabled={sending}>{sending ? "发送中..." : "发送"}</Button>
    </Card>
  );
}
