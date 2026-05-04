import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import type { Announcement } from "@/hooks/useMessageCenter";

export function AnnouncementsAdmin() {
  const [list, setList] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState("0");

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setList((data || []) as Announcement[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !content.trim()) { toast({ title: "请填写标题和内容" }); return; }
    const { error } = await supabase.from("announcements").insert({
      title, content, image_url: imageUrl || null, priority: parseInt(priority) || 0, is_active: true,
    });
    if (error) { toast({ title: "创建失败", description: error.message, variant: "destructive" }); return; }
    setTitle(""); setContent(""); setImageUrl(""); setPriority("0");
    toast({ title: "公告已创建" });
    load();
  };

  const toggle = async (a: Announcement) => {
    await supabase.from("announcements").update({ is_active: !a.is_active }).eq("id", a.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("确认删除？")) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">新建公告</h3>
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="内容" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        <Input placeholder="图片链接（可选）" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <div className="flex items-center gap-2">
          <span className="text-sm">优先级：</span>
          <Input type="number" className="w-24" value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
        <Button onClick={create}>发布公告</Button>
      </Card>

      <div className="space-y-2">
        {list.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{a.title}</h4>
                  <span className="text-xs text-muted-foreground">优先级 {a.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">{a.content}</p>
                <div className="text-[10px] text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={a.is_active} onCheckedChange={() => toggle(a)} />
                <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">暂无公告</p>}
      </div>
    </div>
  );
}
