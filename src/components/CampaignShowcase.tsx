import { useEffect, useState } from "react";
import { X } from "lucide-react";
import poster from "@/assets/campaign-poster.png.asset.json";
import ferrari from "@/assets/ferrari.png.asset.json";
import rolls from "@/assets/rolls-royce.png.asset.json";

const DISMISS_KEY = "campaign_showcase_dismissed_v1";

export const CampaignShowcase = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setOpen(true);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-2xl mt-8 mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="关闭"
          className="absolute -top-3 -right-3 z-30 w-10 h-10 rounded-full bg-white/95 text-black shadow-xl flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster container */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={poster.url}
            alt="USD.ONLINE 增值资本团队业绩活动"
            className="relative z-0 w-full block"
          />

          {/* Ferrari — drives in from the left, parks on its podium (upper card) */}
          <img
            src={ferrari.url}
            alt="Ferrari 296 GTB"
            className="pointer-events-none absolute z-10 drop-shadow-2xl animate-[driveFerrari_2.4s_cubic-bezier(0.22,1,0.36,1)_0.3s_both]"
            style={{
              left: "38%",
              top: "38%",
              width: "58%",
            }}
          />

          {/* Rolls-Royce Cullinan — drives in from the right, parks on its podium (lower card) */}
          <img
            src={rolls.url}
            alt="Rolls-Royce Cullinan"
            className="pointer-events-none absolute z-10 drop-shadow-2xl animate-[driveRolls_2.4s_cubic-bezier(0.22,1,0.36,1)_0.7s_both]"
            style={{
              left: "32%",
              top: "62%",
              width: "64%",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes driveFerrari {
          0%   { transform: translateX(-180%); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes driveRolls {
          0%   { transform: translateX(180%); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CampaignShowcase;
