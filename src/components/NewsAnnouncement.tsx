import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
export function NewsAnnouncement() {
  const { t, language } = useI18n();

  // 这里可以后续连接到API或者数据库来获取公告
  const [announcements] = useState([{
    id: 1,
    title: "USD.ONLINE即将上线🚀",
    titleEn: "USD.ONLINE LAUNCH SOON🚀",
    content: "USD.ONLINE平台即将正式上线，为用户带来全新的数字资产体验",
    contentEn: "USD.ONLINE platform is launching soon, bringing users a new digital asset experience",
    date: "2025-09",
    type: "event",
    urgent: true
  }, {
    id: 2,
    title: "加入全球善意计划",
    titleEn: "Join the Global Goodwill Plan",
    content: "芝麻开门 · 善意化为财富 · 价值融合之旅启程",
    contentEn: "Open Sesame· Goodwill Becomes Wealth · The Journey of Value Fusion Begins",
    date: "2025-09-14",
    type: "event",
    urgent: false
  }, {
    id: 3,
    title: "USD.ONLINE主网将于2026年Q2正式上线",
    titleEn: "USD.ONLINE Mainnet to Launch in Q2 2026",
    content: "USD.ONLINE主网将于2026年第二季度正式上线，敬请期待",
    contentEn: "USD.ONLINE mainnet will officially launch in Q2 2026, stay tuned",
    date: "2025-11-17",
    type: "event",
    urgent: false
  }]);
  const getTypeColor = (type: string, urgent: boolean) => {
    if (urgent) return "destructive";
    switch (type) {
      case "maintenance":
        return "secondary";
      case "event":
        return "default";
      default:
        return "outline";
    }
  };
  const getTypeText = (type: string) => {
    switch (type) {
      case "maintenance":
        return t("news.maintenance");
      case "event":
        return t("news.event");
      default:
        return t("news.general");
    }
  };
  return <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-3 md:p-6 max-w-5xl mx-auto mb-4 md:mb-8">
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <Megaphone className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>
        <h3 className="text-base md:text-xl font-semibold">NEWS</h3>
      </div>
      
      <div className="space-y-2 md:space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border border-border/20 rounded-lg p-2 md:p-4 bg-background/30 hover:bg-background/50 transition-colors">
            <div className="flex items-start justify-between gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <Badge variant={getTypeColor(announcement.type, announcement.urgent)} className="text-xs">
                  {getTypeText(announcement.type)}
                </Badge>
                {announcement.urgent && (
                  <Badge variant="destructive" className="animate-pulse text-xs">
                    {t("news.urgent")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {announcement.date}
              </div>
            </div>
            <h4 className="font-medium mb-1 md:mb-2 text-foreground text-sm md:text-base">
              {language === 'en' ? announcement.titleEn : announcement.title}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              {language === 'en' ? announcement.contentEn : announcement.content}
            </p>
          </div>
        ))}
      </div>
    </Card>;
}