import { useEffect, useRef, useState } from "react";
import { Users, Send, Trash2, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatRoom } from "@/hooks/useChatRoom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

function shortAddr(a: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function ChatRoom() {
  const [open, setOpen] = useState(false);
  const chat = useChatRoom({ enabled: open });
  const { isAdmin } = useIsAdmin();
  const [text, setText] = useState("");
  const [sendErr, setSendErr] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Always render unread badge based on global subscription
  const badge = useChatRoom({ enabled: true });

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
      chat.markAllRead();
      badge.markAllRead();
    }
  }, [open, chat.messages.length]);

  const onSend = async () => {
    setSendErr("");
    const v = text;
    if (!v.trim()) return;
    const res = await chat.send(v);
    if (res.ok) {
      setText("");
    } else if (res.reason === "cooldown") {
      setSendErr("发言过于频繁，请稍候再试");
    } else if (res.reason === "too-long") {
      setSendErr("单条消息最多 500 字");
    } else if (res.reason === "not-eligible") {
      setSendErr("需绑定邀请人或拥有有效质押才能发言");
    } else {
      setSendErr("发送失败，请重试");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="聊天大厅"
          className="fixed bottom-40 md:bottom-24 right-4 md:right-6 z-50"
        >
          <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground border border-border/60 backdrop-blur-md shadow-md hover:bg-secondary/80 transition-colors">
            <Users className="w-5 h-5" />
            {badge.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold ring-2 ring-background">
                {badge.unreadCount > 99 ? "99+" : badge.unreadCount}
              </span>
            )}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />聊天大厅
            <span className="text-xs font-normal text-muted-foreground ml-1">
              （全站公开）
            </span>
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
          {chat.messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              暂无消息，来说点什么吧
            </p>
          )}
          {chat.messages.map((m) => {
            const mine = chat.account && m.wallet_address.toLowerCase() === chat.account.toLowerCase();
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
                  mine ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                )}>
                  <div className={cn("flex items-center gap-1 text-[10px] opacity-70 mb-0.5", mine && "justify-end")}>
                    <span className="font-mono">{shortAddr(m.wallet_address)}</span>
                    <span>·</span>
                    <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                    {isAdmin && (
                      <button
                        onClick={() => chat.softDelete(m.id)}
                        className="ml-1 opacity-60 hover:opacity-100"
                        aria-label="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border bg-card">
          {!chat.account ? (
            <div className="p-3 text-xs text-center text-muted-foreground">
              请先连接钱包
            </div>
          ) : !chat.canChat ? (
            <div className="p-3 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              需绑定邀请人或拥有有效质押才能发言
            </div>
          ) : (
            <>
              {sendErr && (
                <div className="px-3 pt-2 text-[11px] text-destructive">{sendErr}</div>
              )}
              <div className="p-2 flex items-center gap-2">
                <Input
                  value={text}
                  maxLength={500}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  placeholder="输入消息（最多 500 字）..."
                />
                <Button size="icon" onClick={onSend} disabled={!text.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
