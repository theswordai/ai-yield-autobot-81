import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import { cn } from "@/lib/utils";

interface Props {
  wallet?: string | null;
  threadId?: string | null;
  side: "user" | "admin";
  emptyHint?: string;
}

export function SupportChat({ wallet, threadId, side, emptyHint }: Props) {
  const { messages, send } = useSupportChat({ wallet, threadId, side });
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const onSend = async () => {
    if (!text.trim()) return;
    const v = text;
    setText("");
    await send(v);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            {emptyHint || "暂无消息，发送一条开始对话吧"}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender === side;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
                mine ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
              )}>
                {m.content}
                <div className={cn("text-[10px] mt-1 opacity-60", mine ? "text-right" : "text-left")}>
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-border bg-card flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={side === "user" ? (wallet ? "输入消息..." : "请先连接钱包") : "回复用户..."}
          disabled={side === "user" && !wallet}
        />
        <Button size="icon" onClick={onSend} disabled={!text.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
