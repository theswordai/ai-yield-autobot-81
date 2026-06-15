import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import promoCars from "@/assets/promo-cars.png.asset.json";
import promoConference from "@/assets/promo-conference.png.asset.json";

const SESSION_KEY = "promo_popup_shown_v1";

const slides = [
  { url: promoCars.url, alt: "USD.ONLINE 增值资本团队业绩" },
  { url: promoConference.url, alt: "USD.ONLINE 全球大会" },
];

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setEntered(true));
    }, 400);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const go = (n: number) => setIdx((idx + n + slides.length) % slides.length);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    setTouchStart(null);
  };

  const close = () => {
    setEntered(false);
    setTimeout(() => setOpen(false), 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={close}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-500 ease-out ${
          entered ? "scale-100 translate-y-0 rotate-0" : "scale-75 translate-y-8 -rotate-3"
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* glow */}
        <div
          className="absolute -inset-6 rounded-3xl opacity-70 blur-2xl pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, #f5d27a, #b9842a, #f5d27a, #6ea8ff, #f5d27a)",
            animation: "promo-spin 8s linear infinite",
          }}
        />
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map((s) => (
              <img
                key={s.url}
                src={s.url}
                alt={s.alt}
                className="w-full flex-shrink-0 object-contain select-none"
                draggable={false}
              />
            ))}
          </div>

          {/* shimmer overlay on entrance */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
              transform: "translateX(-100%)",
              animation: "promo-shimmer 1.6s ease-out 0.4s 1",
            }}
          />

          {/* arrows */}
          <button
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* close */}
        <button
          onClick={close}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        @keyframes promo-spin { to { transform: rotate(360deg); } }
        @keyframes promo-shimmer { to { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}
