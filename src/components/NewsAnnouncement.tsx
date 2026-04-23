import { useState } from "react";
import { ChevronDown, ChevronUp, Radio } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function NewsAnnouncement() {
  const { language } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const announcements = [
    {
      id: 4,
      title: "USD.ONLINE兑换功能已上线",
      titleEn: "USD.ONLINE Swap Feature is Now Live",
      content: "USD.ONLINE DEX兑换功能已正式上线，支持多币种快速兑换",
      contentEn: "USD.ONLINE DEX swap feature is now live, supporting fast multi-token swaps",
      date: "2026-04-15",
      time: "12:00 UTC",
    },
    {
      id: 3,
      title: "USD.ONLINE主网将于2026年Q2正式上线",
      titleEn: "USD.ONLINE Mainnet to Launch in Q2 2026",
      content: "USD.ONLINE主网将于2026年第二季度正式上线，敬请期待",
      contentEn: "USD.ONLINE mainnet will officially launch in Q2 2026, stay tuned",
      date: "2025-11-17",
      time: "10:20 UTC",
    },
    {
      id: 2,
      title: "加入全球善意计划",
      titleEn: "Join the Global Goodwill Plan",
      content: "芝麻开门 · 善意化为财富 · 价值融合之旅启程",
      contentEn: "Open Sesame · Goodwill Becomes Wealth · The Journey of Value Fusion Begins",
      date: "2025-09-14",
      time: "08:15 UTC",
    },
    {
      id: 1,
      title: "USD.ONLINE即将上线🚀",
      titleEn: "USD.ONLINE Launch Soon 🚀",
      content: "USD.ONLINE平台即将正式上线，为用户带来全新的数字资产体验",
      contentEn: "USD.ONLINE platform is launching soon, bringing users a new digital asset experience",
      date: "2025-09",
      time: "06:00 UTC",
    },
  ];

  const latest = announcements[0];
  const rest = announcements.slice(1);

  return (
    <div className="rounded-[28px] border border-border/40 bg-card/45 p-4 shadow-card backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/45 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <Radio className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Live
              </span>
              <span className="text-[11px] text-muted-foreground">{latest.date}</span>
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-foreground">
              {language === "en" ? latest.titleEn : latest.title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {language === "en" ? latest.contentEn : latest.content}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-card/50 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          aria-label={expanded ? "Collapse announcements" : "Expand announcements"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {rest.map((announcement) => (
            <div key={announcement.id} className="rounded-2xl border border-border/30 bg-background/35 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {language === "en" ? announcement.titleEn : announcement.title}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{announcement.date}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {language === "en" ? announcement.contentEn : announcement.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
