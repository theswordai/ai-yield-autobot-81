import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
export function NewsAnnouncement() {
  const {
    t
  } = useI18n();

  // 这里可以后续连接到API或者数据库来获取公告
  const [announcements] = useState([{
    id: 1,
    title: "平台升级维护公告",
    content: "为提供更好的用户体验，平台将于北京时间12月25日02:00-06:00进行系统升级维护",
    date: "2024-12-24",
    type: "maintenance",
    urgent: false
  }, {
    id: 2,
    title: "新年活动预告",
    content: "元旦期间将推出限时高收益产品，敬请关注官方公告",
    date: "2024-12-23",
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
      
      <div className="space-y-4">
        {announcements.map(announcement => {})}
      </div>
    </Card>;
}