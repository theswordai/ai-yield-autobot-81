import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMessageCenter } from "@/hooks/useMessageCenter";

export function AnnouncementPopup() {
  const { wallet, unreadAnnouncements, markAnnouncementRead } = useMessageCenter();
  const [idx, setIdx] = useState(0);
  const [closed, setClosed] = useState<Set<string>>(new Set());

  useEffect(() => { setIdx(0); }, [wallet]);

  if (!wallet) return null;
  const queue = unreadAnnouncements.filter((a) => !closed.has(a.id));
  const current = queue[idx];
  if (!current) return null;

  const handleClose = async () => {
    await markAnnouncementRead(current.id);
    setClosed((prev) => new Set(prev).add(current.id));
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription className="sr-only">公告</DialogDescription>
        </DialogHeader>
        {current.image_url && <img src={current.image_url} alt={current.title} className="w-full rounded-md" />}
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{current.content}</p>
        <div className="flex justify-end">
          <Button onClick={handleClose}>我知道了</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
