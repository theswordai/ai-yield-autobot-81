import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ferrariAsset from "@/assets/news-ferrari.png.asset.json";
import conferenceAsset from "@/assets/news-conference.png.asset.json";

export function NewsAnnouncement() {
  const { t, language } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [detailIds, setDetailIds] = useState<Set<number>>(new Set());

  const gallery = [
    { url: ferrariAsset.url, alt: language === 'en' ? 'Campaign 1' : '活动一' },
    { url: conferenceAsset.url, alt: language === 'en' ? 'Global Conference' : '全球大会' },
  ];

  const announcements = [
    {
      id: 8,
      title: "关于遭受有预谋链上恶意攻击的紧急公告",
      titleEn: "Urgent Announcement on Pre-Planned On-Chain Malicious Attack",
      content: "经初步研判，本次事件系外部恶意攻击所致，因本次链上黑客团队攻击手段高度复杂、痕迹非常隐蔽，技术团队需更多时间完成链上信息收集与溯源分析。我们预计在 7 月 10 日前公布调查进展及解决方案。请以官网公告为准。感谢大家的耐心等待。",
      contentEn: "Based on preliminary analysis, this incident was caused by external malicious attacks. The on-chain hacker team employed highly complex and extremely covert attack methods. The technical team needs more time to complete on-chain information collection and traceability analysis. We expect to announce investigation progress and solutions before July 10. Please refer to official website announcements. Thank you for your patience.",
      date: "2026-06-30",
      time: "02:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 7,
      title: "紧急安全公告",
      titleEn: "Urgent Security Notice",
      content: "项目遭遇未授权黑客攻击，团队正在紧急排查处理。请勿继续向本项目投入资金。本次事件给用户带来的不便，我们深表歉意。",
      contentEn: "The project has suffered an unauthorized hacker attack. The team is urgently investigating and handling the issue. Please do not continue to deposit funds into this project. We sincerely apologize for the inconvenience caused to users.",
      date: "2026-06-28",
      time: "00:00 UTC",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 6,
      title: "GLOBAL ANNOUNCEMENT — A New Era Begins",
      titleEn: "GLOBAL ANNOUNCEMENT — A New Era Begins",
      content: `June 20, 2026 USD.ONLINE will officially launch globally.\n\nThis is not merely a launch; it is a global enterprise forged for the next decade.\n\nFollowing extensive preparation and strategic planning, the project has successfully completed its compliance structuring in the United Kingdom and continues to accelerate its global expansion strategy. Simultaneously, the FutureDAOX ecosystem is actively under development. Grounded in AI, big data, advanced algorithms, and blockchain technology, it is dedicated to building a next-generation digital value ecosystem. Moving forward, the FutureDAO project will actively explore growth opportunities within international capital markets, strictly adhering to local laws, regulations, and compliance requirements.\n\nTo drive the construction of our global ecosystem, we are officially initiating:\n\nFounding Partner Program\n\nNational Partner Program\n\nRegional Leader Program\n\nThe initial cohort of Global Partners will have the exclusive opportunity to participate in ecosystem development and market expansion. In accordance with future institutional frameworks, partners will receive corresponding incentive rights and growth opportunities.\n\nOur Conviction\n\nThe greatest opportunities of the future do not belong to those who wait, but to those who take the initiative.\n\nThe greatest value of the future stems not just from possessing resources, but from actively participating in value creation.\n\nWho We Are Looking For\n\nVisionary entrepreneurs with big dreams\n\nDriven leaders with established teams\n\nForward-thinking investors\n\nTrailblazers ready to embrace the era of AI and the digital economy\n\nToday's participants may well become the pivotal contributors to tomorrow's ecosystem.\n\nUSD.ONLINE FutureDAO\n\nGlobal Launch · Global Recruitment · Global Co-Creation Connecting the World, Creating the Future.`,
      contentEn: `June 20, 2026 USD.ONLINE will officially launch globally.\n\nThis is not merely a launch; it is a global enterprise forged for the next decade.\n\nFollowing extensive preparation and strategic planning, the project has successfully completed its compliance structuring in the United Kingdom and continues to accelerate its global expansion strategy. Simultaneously, the FutureDAOX ecosystem is actively under development. Grounded in AI, big data, advanced algorithms, and blockchain technology, it is dedicated to building a next-generation digital value ecosystem. Moving forward, the FutureDAO project will actively explore growth opportunities within international capital markets, strictly adhering to local laws, regulations, and compliance requirements.\n\nTo drive the construction of our global ecosystem, we are officially initiating:\n\nFounding Partner Program\n\nNational Partner Program\n\nRegional Leader Program\n\nThe initial cohort of Global Partners will have the exclusive opportunity to participate in ecosystem development and market expansion. In accordance with future institutional frameworks, partners will receive corresponding incentive rights and growth opportunities.\n\nOur Conviction\n\nThe greatest opportunities of the future do not belong to those who wait, but to those who take the initiative.\n\nThe greatest value of the future stems not just from possessing resources, but from actively participating in value creation.\n\nWho We Are Looking For\n\nVisionary entrepreneurs with big dreams\n\nDriven leaders with established teams\n\nForward-thinking investors\n\nTrailblazers ready to embrace the era of AI and the digital economy\n\nToday's participants may well become the pivotal contributors to tomorrow's ecosystem.\n\nUSD.ONLINE FutureDAO\n\nGlobal Launch · Global Recruitment · Global Co-Creation Connecting the World, Creating the Future.`,
      date: "2026-06-20",
      time: "00:00 UTC",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
    {
      id: 5,
      title: "USD.ONLINE 2026年6月20日正式上线",
      titleEn: "USD.ONLINE Officially Launches on June 20, 2026",
      content: "USD.ONLINE将于2026年6月20日正式上线，敬请期待",
      contentEn: "USD.ONLINE will officially launch on June 20, 2026. Stay tuned.",
      date: "2026-06-20",
      time: "00:00 UTC",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
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
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
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
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
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
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
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
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
  ];

  const latest = announcements[0];
  const rest = announcements.slice(1);
  const visibleItems = expanded ? announcements : [latest];

  const toggleDetail = (id: number) => {
    setDetailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground tracking-wide">NEWS</h3>
        <span className="px-3 py-1 text-xs font-bold tracking-wider border border-primary/50 text-primary rounded bg-primary/10">
          LIVE
        </span>
      </div>

      {/* Campaign images thumbnails */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {gallery.map((img) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setZoomImg(img.url)}
            className="group relative overflow-hidden rounded-lg border border-primary/30 bg-card/60 hover:border-primary/60 transition-colors"
          >
            <img
              src={img.url}
              alt={img.alt}
              loading="lazy"
              className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Timeline items */}
      <div className="space-y-3">
        {visibleItems.map((announcement) => {
          const isOpen = detailIds.has(announcement.id);
          return (
            <div
              key={announcement.id}
              className="relative pl-4 border-l-2 border-primary/60 rounded-r-lg bg-card/60 p-4 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground leading-relaxed flex-1">
                  {language === 'en' ? announcement.titleEn : announcement.title}
                </p>
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 rounded border border-primary/20">
                  {announcement.date}
                </span>
              </div>
              <button
                onClick={() => toggleDetail(announcement.id)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    {language === 'en' ? 'Collapse' : '收起'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    {language === 'en' ? 'View Details' : '查看详情'}
                  </>
                )}
              </button>
              {isOpen && (
                <div className="mt-3">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                    <span>
                      {language === 'en' ? 'Published: ' : '发布时间: '}
                      {announcement.date} {announcement.time}
                    </span>
                    <span className="w-px h-3 bg-border/50" />
                    <span>
                      {language === 'en' ? 'Source: ' : '来源: '}
                      {language === 'en' ? announcement.sourceEn : announcement.source}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'en' ? announcement.contentEn : announcement.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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

      {/* Zoom dialog */}
      <Dialog open={!!zoomImg} onOpenChange={(o) => !o && setZoomImg(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-2 bg-background/95 border-primary/40">
          {zoomImg && (
            <img
              src={zoomImg}
              alt="zoom"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

