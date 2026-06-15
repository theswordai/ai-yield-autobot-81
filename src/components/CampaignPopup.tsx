import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ferrariAsset from "@/assets/campaign-ferrari.png.asset.json";
import conferenceAsset from "@/assets/campaign-conference.png.asset.json";
import useEmblaCarousel from "embla-carousel-react";

const SLIDES = [
  { url: ferrariAsset.url, alt: "USD.ONLINE 增值资本团队业绩" },
  { url: conferenceAsset.url, alt: "USD.ONLINE 全球大会" },
];

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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="关闭"
          onClick={() => setOpen(false)}
          className="absolute -top-2 -right-2 z-10 h-9 w-9 rounded-full bg-white/95 text-black shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {SLIDES.map((s, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0">
                <img
                  src={s.url}
                  alt={s.alt}
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows (desktop hint) */}
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

        <div className="flex justify-center gap-2 mt-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`第 ${i + 1} 张`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                selected === i ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
