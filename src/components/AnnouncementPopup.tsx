import { useEffect, useState } from "react";
import { X, Sparkles, Star, Megaphone } from "lucide-react";
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6 animate-fade-in"
      onClick={handleClose}
    >
      <style>{`
        @keyframes ribbon-sway {
          0%,100% { transform: rotate(-8deg); }
          50%     { transform: rotate(6deg); }
        }
        @keyframes star-twinkle {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.35); opacity: 0.6; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md mx-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow halo */}
        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.35),transparent_70%)] blur-2xl" />

        {/* Corner sparkles */}
        <div className="pointer-events-none absolute -top-3 -left-3">
          <Sparkles className="h-6 w-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.9)] animate-pulse" />
        </div>
        <div className="pointer-events-none absolute -bottom-3 -right-3">
          <Sparkles className="h-6 w-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.9)] animate-pulse" />
        </div>
        <Star
          className="pointer-events-none absolute -top-4 right-6 h-5 w-5 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]"
          style={{ animation: "star-twinkle 1.6s ease-in-out infinite" }}
        />

        {/* Megaphone icon swaying */}
        <div
          className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 origin-bottom"
          style={{ animation: "ribbon-sway 3s ease-in-out infinite" }}
        >
          <div className="relative">
            <Megaphone className="h-9 w-9 text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]" />
            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Close button */}
        <button
          aria-label="关闭"
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-20 h-9 w-9 rounded-full bg-white/95 text-black shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl ring-2 ring-yellow-300/60 shadow-[0_0_40px_rgba(255,215,0,0.35)] bg-background">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-lg font-bold pr-8 break-words">{current.title}</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 pb-4 space-y-3">
            {current.image_url && (
              <img src={current.image_url} alt={current.title} className="w-full rounded-md" />
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {current.content}
            </p>
          </div>
          <div className="flex justify-end px-5 pb-4">
            <Button onClick={handleClose}>我知道了</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
