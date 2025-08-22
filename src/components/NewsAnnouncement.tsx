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
  return <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 max-w-5xl mx-auto mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold">NEWS</h3>
      </div>
      
      <div className="relative h-32 overflow-hidden">
        <div className="absolute animate-marquee-vertical">
          {[...announcements, ...announcements].map((announcement, index) => (
            <div key={`${announcement.id}-${index}`} className="border border-border/20 rounded-lg p-4 bg-background/30 mb-4 min-h-[120px]">
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
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
          ))}
        </div>
      </div>
    </Card>;
}