import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Trash2, Upload, X, Loader2 } from "lucide-react";
import type { Announcement } from "@/hooks/useMessageCenter";
import { callAdminAction } from "@/lib/adminAction";

export function AnnouncementsAdmin() {
  const [list, setList] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "请选择图片文件", variant: "destructive" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "图片不能超过 3MB", description: "请压缩后再上传", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("读取失败"));
        reader.readAsDataURL(file);
      });
      setImageUrl(dataUrl);
      toast({ title: "图片已就绪" });
    } catch (e: any) {
      toast({ title: "上传失败", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };


  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.items)
      .find((it) => it.type.startsWith("image/"))
      ?.getAsFile();
    if (file) {
      e.preventDefault();
      uploadImage(file);
    }
  };

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setList((data || []) as Announcement[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !content.trim()) { toast({ title: "请填写标题和内容" }); return; }
    try {
      await callAdminAction("announcement.create", {
        title, content, image_url: imageUrl || null, priority: parseInt(priority) || 0,
      });
      setTitle(""); setContent(""); setImageUrl(""); setPriority("0");
      toast({ title: "公告已创建" });
      load();
    } catch (e: any) {
      toast({ title: "创建失败", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const toggle = async (a: Announcement) => {
    try {
      await callAdminAction("announcement.update", { id: a.id, fields: { is_active: !a.is_active } });
      load();
    } catch (e: any) {
      toast({ title: "更新失败", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确认删除？")) return;
    try {
      await callAdminAction("announcement.delete", { id });
      load();
    } catch (e: any) {
      toast({ title: "删除失败", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3" onPaste={onPaste}>
        <h3 className="font-semibold">新建公告</h3>
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="内容" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed cursor-pointer transition-colors p-4 text-center ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }}
          />
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="预览" className="max-h-48 mx-auto rounded" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-7 w-7"
                onClick={(e) => { e.stopPropagation(); setImageUrl(""); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : uploading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> 上传中…
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Upload className="w-6 h-6" />
              <div>点击 / 拖拽 / 粘贴图片到此处</div>
              <div className="text-xs">支持 PNG / JPG / GIF / WebP，最大 10MB</div>
            </div>
          )}
        </div>
        <Input
          placeholder="或直接粘贴图片链接"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm">优先级：</span>
          <Input type="number" className="w-24" value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
        <Button onClick={create} disabled={uploading}>发布公告</Button>
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
