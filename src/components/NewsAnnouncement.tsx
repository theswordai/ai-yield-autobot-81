import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function NewsAnnouncement() {
  const { t, language } = useI18n();
  const [expanded, setExpanded] = useState(false);

  // 按日期从新到旧排列
  const announcements = [
    {
      id: 4,
      title: "🧧 USD.ONLINE祝全球华人新年快乐，马到成功！！🎆",
      titleEn: "🧧 USD.ONLINE Wishes All Chinese Around the World a Happy New Year! Great Success! 🎆",
      content: "恭喜发财，万事如意！USD.ONLINE与您共迎新春佳节！",
      contentEn: "Wishing you prosperity and good fortune! USD.ONLINE celebrates the Lunar New Year with you!",
      date: "2026-02-11",
      type: "event",
      urgent: true,
    },
    {
      id: 3,
      title: "USD.ONLINE主网将于2026年Q2正式上线",
      titleEn: "USD.ONLINE Mainnet to Launch in Q2 2026",
      content: "USD.ONLINE主网将于2026年第二季度正式上线，敬请期待",
      contentEn: "USD.ONLINE mainnet will officially launch in Q2 2026, stay tuned",
      date: "2025-11-17",
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
      type: "event",
      urgent: true,
    },
  ];

  const getTypeColor = (type: string, urgent: boolean) => {
    if (urgent) return "destructive";
    switch (type) {
      case "maintenance": return "secondary";
      case "event": return "default";
      default: return "outline";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "maintenance": return t("news.maintenance");
      case "event": return t("news.event");
      default: return t("news.general");
    }
  };

  const latest = announcements[0];
  const rest = announcements.slice(1);

  const AnnouncementItem = ({ announcement }: { announcement: typeof announcements[0] }) => (
    <div className="border border-border/20 rounded-lg p-4 bg-background/30 hover:bg-background/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={getTypeColor(announcement.type, announcement.urgent)}>
            {getTypeText(announcement.type)}
          </Badge>
          {announcement.urgent && (
            <Badge variant="destructive" className="animate-pulse">
              {t("news.urgent")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
          <Clock className="w-3 h-3" />
          {announcement.date}
        </div>
      </div>
      <h4 className="font-medium mb-2 text-foreground">
        {language === 'en' ? announcement.titleEn : announcement.title}
      </h4>
      <p className="text-sm text-muted-foreground">
        {language === 'en' ? announcement.contentEn : announcement.content}
      </p>
    </div>
  );

  return (
    <Card
      className="relative overflow-hidden border-red-500/60 p-6 max-w-5xl mx-auto mb-8"
      style={{ background: 'linear-gradient(135deg, hsl(0 85% 45%), hsl(355 80% 40%), hsl(0 85% 42%))' }}
    >
      {/* 鞭炮装饰 */}
      <div className="absolute top-2 left-3 text-2xl opacity-70 animate-bounce" style={{ animationDuration: '2s' }}>🧨</div>
      <div className="absolute top-4 right-4 text-2xl opacity-70 animate-bounce" style={{ animationDuration: '2.5s' }}>🎆</div>
      <div className="absolute bottom-3 left-6 text-xl opacity-50">🎇</div>
      <div className="absolute bottom-2 right-8 text-xl opacity-50 animate-bounce" style={{ animationDuration: '3s' }}>🧨</div>
      <div className="absolute top-1/2 right-2 text-lg opacity-30">🏮</div>
      <div className="absolute top-1/2 left-1 text-lg opacity-30">🏮</div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-red-900" />
        </div>
        <h3 className="text-xl font-semibold text-yellow-300">NEWS 🎊</h3>
      </div>

      {/* 最新一条 - 默认显示 */}
      <div className="space-y-3 relative z-10">
        <AnnouncementItem announcement={latest} />

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-background/20 hover:bg-background/40 transition-colors text-yellow-200 text-sm font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {language === 'en' ? 'Hide older news' : '收起历史公告'}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {language === 'en' ? `View ${rest.length} more` : `查看更多 ${rest.length} 条公告`}
            </>
          )}
        </button>

        {/* 历史公告 - 展开后显示 */}
        {expanded && (
          <div className="space-y-3">
            {rest.map((announcement) => (
              <AnnouncementItem key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
