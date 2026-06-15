import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Sparkles, Gift, Star } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import ferrariAsset from "@/assets/campaign-ferrari.png.asset.json";
import conferenceAsset from "@/assets/campaign-conference.png.asset.json";

export function NewsAnnouncement() {
  const { t, language } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const announcements = [
    {
      id: 5,
      title: "USD.ONLINE 2026年6月20日正式上线",
      titleEn: "USD.ONLINE Officially Launches on June 20, 2026",
      content: "USD.ONLINE将于2026年6月20日正式上线，敬请期待",
      contentEn: "USD.ONLINE will officially launch on June 20, 2026. Stay tuned.",
      date: "2026-06-20",
      time: "00:00 UTC",
      type: "event",
      urgent: true,
    },
    {
      id: 4,
      title: "USD.ONLINE兑换功能已上线",
      titleEn: "USD.ONLINE Swap Feature is Now Live",
      content: "USD.ONLINE DEX兑换功能已正式上线，支持多币种快速兑换",
      contentEn: "USD.ONLINE DEX swap feature is now live, supporting fast multi-token swaps",
      date: "2026-04-15",
      time: "12:00 UTC",
      type: "event",
      urgent: false,
    },
    {
      id: 3,
      title: "USD.ONLINE主网将于2026年Q2正式上线",
      titleEn: "USD.ONLINE Mainnet to Launch in Q2 2026",
      content: "USD.ONLINE主网将于2026年第二季度正式上线，敬请期待",
      contentEn: "USD.ONLINE mainnet will officially launch in Q2 2026, stay tuned",
      date: "2025-11-17",
      time: "10:20 UTC",
      type: "event",
      urgent: false,
    },
    {
      id: 2,
      title: "加入全球善意计划",
      titleEn: "Join the Global Goodwill Plan",
      content: "芝麻开门 · 善意化为财富 · 价值融合之旅启程",
      contentEn: "Open Sesame· Goodwill Becomes Wealth · The Journey of Value Fusion Begins",
      date: "2025-09-14",
      time: "08:15 UTC",
      type: "event",
      urgent: false,
    },
    {
      id: 1,
      title: "USD.ONLINE即将上线🚀",
      titleEn: "USD.ONLINE LAUNCH SOON🚀",
      content: "USD.ONLINE平台即将正式上线，为用户带来全新的数字资产体验",
      contentEn: "USD.ONLINE platform is launching soon, bringing users a new digital asset experience",
      date: "2025-09",
      time: "06:00 UTC",
      type: "event",
      urgent: true,
    },
  ];

  const latest = announcements[0];
  const rest = announcements.slice(1);
  const visibleItems = expanded ? announcements : [latest];

  return (
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
      {/* ===== Activity Campaign Images (mobile-first swipe) ===== */}
      <div className="relative mb-5 -mx-2">
        {/* Decorative stars */}
        <Star className="pointer-events-none absolute -top-1 left-2 h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse z-10" />
        <Star className="pointer-events-none absolute top-1/2 -right-1 h-3 w-3 text-pink-300 fill-pink-300 animate-pulse z-10" style={{ animationDelay: "0.6s" }} />
        {/* Gift sway */}
        <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Gift className="h-5 w-5 text-yellow-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.8)] animate-bounce" />
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-2 pb-1 scrollbar-hide">
          {[
            { url: ferrariAsset.url, alt: "USD.ONLINE 增值资本团队业绩", label: "活动一" },
            { url: conferenceAsset.url, alt: "USD.ONLINE 全球大会", label: "活动二" },
          ].map((s, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[78%] snap-center rounded-xl overflow-hidden ring-1 ring-yellow-300/40 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              <img
                src={s.url}
                alt={s.alt}
                className="w-full h-auto block select-none"
                draggable={false}
              />
              {/* Label badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white text-xs font-bold tracking-wider shadow-md border border-yellow-200/60 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{s.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          <span className="h-1.5 w-4 rounded-full bg-yellow-300/80" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground tracking-wide">NEWS</h3>
        <span className="px-3 py-1 text-xs font-bold tracking-wider border border-primary/50 text-primary rounded bg-primary/10">
          LIVE
        </span>
      </div>

      {/* Timeline items */}
      <div className="space-y-3">
        {visibleItems.map((announcement) => (
          <div
            key={announcement.id}
            className="relative pl-4 border-l-2 border-primary/60 rounded-r-lg bg-card/60 p-4 hover:bg-card/80 transition-colors"
          >
          
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {language === 'en' ? announcement.titleEn : announcement.title}
            </p>
          </div>
        ))}
      </div>

      {/* Expand/Collapse */}
      {rest.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-card/60 hover:bg-card/80 transition-colors text-sm font-medium text-muted-foreground border border-border/20"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {language === 'en' ? 'Collapse' : '收起'}
            </>
          ) : (
            <>
              {language === 'en' ? `View ${rest.length} more` : `查看更多 ${rest.length} 条`}
            </>
          )}
        </button>
      )}
    </div>
  );
}
