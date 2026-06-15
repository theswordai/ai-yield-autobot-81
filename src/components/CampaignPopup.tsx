import { useEffect, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Gift, Sparkles, Star } from "lucide-react";
import ferrariAsset from "@/assets/campaign-ferrari.png.asset.json";
import conferenceAsset from "@/assets/campaign-conference.png.asset.json";
import useEmblaCarousel from "embla-carousel-react";

const SLIDES = [
  { url: ferrariAsset.url, alt: "USD.ONLINE 增值资本团队业绩", label: "活动一" },
  { url: conferenceAsset.url, alt: "USD.ONLINE 全球大会", label: "活动二" },
];

// Decorative floating particles around the popup
function Confetti() {
  const items = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        const colors = ["#FFD700", "#FF4D6D", "#FF8A3D", "#7CFFCB", "#5EA8FF", "#FFFFFF"];
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 6 + Math.random() * 8,
          color: colors[i % colors.length],
          delay: Math.random() * 2,
          duration: 2.5 + Math.random() * 2.5,
          rotate: Math.random() * 360,
        };
      }),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `confetti-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function CornerSparkle({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <Sparkles className="h-6 w-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.9)] animate-pulse" />
    </div>
  );
}

export default function CampaignPopup() {
  const [open, setOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      {/* Inline keyframes for decoration */}
      <style>{`
        @keyframes confetti-float {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-18px) rotate(180deg); }
        }
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

        {/* Floating confetti */}
        <Confetti />

        {/* Corner sparkles */}
        <CornerSparkle className="-top-3 -left-3" />
        <CornerSparkle className="-bottom-3 -right-3" />
        <Star
          className="pointer-events-none absolute -top-4 right-6 h-5 w-5 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]"
          style={{ animation: "star-twinkle 1.6s ease-in-out infinite" }}
        />
        <Star
          className="pointer-events-none absolute bottom-10 -left-4 h-4 w-4 text-pink-300 fill-pink-300 drop-shadow-[0_0_6px_rgba(255,150,200,0.9)]"
          style={{ animation: "star-twinkle 2.2s ease-in-out infinite" }}
        />

        {/* Gift icon swaying */}
        <div
          className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 origin-bottom"
          style={{ animation: "ribbon-sway 3s ease-in-out infinite" }}
        >
          <div className="relative">
            <Gift className="h-9 w-9 text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]" />
            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Close button */}
        <button
          aria-label="关闭"
          onClick={() => setOpen(false)}
          className="absolute -top-2 -right-2 z-20 h-9 w-9 rounded-full bg-white/95 text-black shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-2xl ring-2 ring-yellow-300/60 shadow-[0_0_40px_rgba(255,215,0,0.35)]" ref={emblaRef}>
          <div className="flex">
            {SLIDES.map((s, i) => (
              <div key={i} className="relative flex-[0_0_100%] min-w-0">
                <img
                  src={s.url}
                  alt={s.alt}
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
                {/* Label badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="relative">
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white text-sm font-bold tracking-wider shadow-lg border border-yellow-200/70 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{s.label}</span>
                    </div>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-300 animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows (desktop) */}
        <button
          aria-label="上一张"
          onClick={() => emblaApi?.scrollPrev()}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white items-center justify-center hover:bg-black/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="下一张"
          onClick={() => emblaApi?.scrollNext()}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white items-center justify-center hover:bg-black/70"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`第 ${i + 1} 张`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                selected === i ? "w-6 bg-yellow-300" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
