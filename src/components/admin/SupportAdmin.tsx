import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportChat } from "@/components/SupportChat";
import { cn } from "@/lib/utils";
import type { SupportThread } from "@/hooks/useMessageCenter";

export function SupportAdmin() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("support_threads").select("*").order("last_message_at", { ascending: false });
    setThreads((data || []) as SupportThread[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("admin-threads")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_threads" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const active = threads.find((t) => t.id === activeId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3 h-[600px]">
      <Card className="overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border font-semibold text-sm">会话列表 ({threads.length})</div>
        <ScrollArea className="flex-1">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActiveId(t.id)}
              className={cn("w-full text-left px-3 py-2 border-b border-border hover:bg-muted/50 transition-colors", activeId === t.id && "bg-muted")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono truncate">{t.wallet_address.slice(0, 6)}...{t.wallet_address.slice(-4)}</span>
                {t.unread_admin && <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(t.last_message_at).toLocaleString()}</div>
            </button>
          ))}
          {threads.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">暂无会话</p>}
        </ScrollArea>
      </Card>
      <Card className="overflow-hidden flex flex-col">
        {active ? (
          <>
            <div className="p-3 border-b border-border text-sm">
              <span className="font-semibold">用户：</span>
              <span className="font-mono text-xs">{active.wallet_address}</span>
            </div>
            <div className="flex-1 min-h-0">
              <SupportChat side="admin" threadId={active.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">请选择左侧会话</div>
        )}
      </Card>
    </div>
  );
}
