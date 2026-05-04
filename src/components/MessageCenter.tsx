import { useState } from "react";
import { Headphones, Megaphone, Mail, MessageSquareMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMessageCenter } from "@/hooks/useMessageCenter";
import { SupportChat } from "@/components/SupportChat";
import { cn } from "@/lib/utils";

interface MessageCenterProps {
  floating?: boolean;
}

export function MessageCenter({ floating = true }: MessageCenterProps = {}) {
  const [open, setOpen] = useState(false);
  const mc = useMessageCenter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {floating ? (
          <button
            aria-label="在线客服"
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50"
          >
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
              <MessageSquareMore className="w-5 h-5" />
              {mc.totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold ring-2 ring-background">
                  {mc.totalUnread > 99 ? "99+" : mc.totalUnread}
                </span>
              )}
            </span>
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="消息中心">
            <MessageSquareMore className="w-5 h-5" />
            {mc.totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {mc.totalUnread > 99 ? "99+" : mc.totalUnread}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2"><Headphones className="w-4 h-4 text-primary" />消息中心 / 在线客服</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="announcements" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 mx-4 mt-3">
            <TabsTrigger value="announcements" className="text-xs">
              <Megaphone className="w-3.5 h-3.5 mr-1" />公告
              {mc.unreadAnnouncements.length > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]" variant="destructive">{mc.unreadAnnouncements.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="inbox" className="text-xs">
              <Mail className="w-3.5 h-3.5 mr-1" />站内信
              {mc.unreadInboxCount > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]" variant="destructive">{mc.unreadInboxCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs">
              <Headphones className="w-3.5 h-3.5 mr-1" />客服
              {mc.unreadSupportCount > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]" variant="destructive">!</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full px-4 pb-4">
              {mc.announcements.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无公告</p>}
              <div className="space-y-3">
                {mc.announcements.map((a) => {
                  const unread = !mc.unreadAnnouncements.find((u) => u.id === a.id) ? false : true;
                  return (
                    <div key={a.id} className={cn("rounded-lg border border-border p-3 bg-card", unread && "ring-1 ring-primary/30")}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{a.title}</h4>
                        {unread && <span className="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1.5" />}
                      </div>
                      {a.image_url && <img src={a.image_url} alt={a.title} className="mt-2 w-full rounded-md" />}
                      <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                        {unread && mc.wallet && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => mc.markAnnouncementRead(a.id)}>标为已读</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="inbox" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full px-4 pb-4">
              {!mc.wallet && <p className="text-sm text-muted-foreground text-center py-8">请先连接钱包</p>}
              {mc.wallet && mc.inbox.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无站内信</p>}
              {mc.wallet && mc.inbox.length > 0 && (
                <div className="flex justify-end mb-2">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={mc.markAllInboxRead}>全部已读</Button>
                </div>
              )}
              <div className="space-y-3">
                {mc.inbox.map((m) => (
                  <div key={m.id}
                    className={cn("rounded-lg border border-border p-3 bg-card cursor-pointer", !m.is_read && "ring-1 ring-primary/30")}
                    onClick={() => !m.is_read && mc.markInboxRead(m.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">{m.title}</h4>
                      {!m.is_read && <span className="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1.5" />}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{m.content}</p>
                    <div className="mt-2 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="support" className="flex-1 min-h-0 mt-3 flex flex-col">
            <SupportChat side="user" wallet={mc.wallet} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
