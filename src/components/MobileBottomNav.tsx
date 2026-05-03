import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Rocket,
  Heart,
  Coins,
  FileText,
  TrendingUp,
  BarChart3,
  Crown,
  Wallet,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary slots — always visible in the bottom bar
  const primaryItems = [
    { id: "launch",  label: "启航",  labelEn: "Launch",  icon: Rocket,     path: `/${language}` },
    { id: "charity", label: "善举",  labelEn: "Charity", icon: Heart,      path: `/${language}/invest` },
    { id: "flexible", label: "活期", labelEn: "Flexible", icon: Wallet,    path: `/${language}/flexible` },
    { id: "swap",    label: "兑换",  labelEn: "Swap",    icon: Coins,      path: `/${language}/usdv?tab=dex` },
    { id: "asset",   label: "资产", labelEn: "Asset", icon: BarChart3, path: `/${language}/asset-dashboard` },
  ];

  // Secondary slots — surfaced via "More" drawer
  const moreItems = [
    {
      id: "predict",
      label: "预测",
      labelEn: "Predict",
      desc: "预测市场 · Polymarket",
      descEn: "Prediction markets",
      icon: TrendingUp,
      path: `/${language}/predict`,
    },
    {
      id: "vip",
      label: "尊享",
      labelEn: "VIP",
      desc: "推荐返佣 · 邀请奖励",
      descEn: "Referral & rewards",
      icon: Crown,
      path: `/${language}/referral`,
    },
    {
      id: "whitepaper",
      label: "白皮书",
      labelEn: "Whitepaper",
      desc: "协议机制 · 风控披露",
      descEn: "Protocol & risk disclosure",
      icon: FileText,
      path: `/${language}/whitepaper`,
    },
  ];

  const isActive = (path: string) => {
    const cleanPath = path.split("?")[0];
    if (cleanPath === `/${language}`) {
      return location.pathname === cleanPath || location.pathname === `/${language}/`;
    }
    return location.pathname.startsWith(cleanPath);
  };

  // Highlight the More button when the current route lives inside one of its items.
  const moreActive = moreItems.some((it) => isActive(it.path));

  const goTo = (path: string) => {
    setMoreOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? "text-primary" : ""}`} />
                <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>
                  {language === "zh" ? item.label : item.labelEn}
                </span>
                {active && (
                  <div className="absolute bottom-1 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              moreActive || moreOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={language === "zh" ? "更多" : "More"}
          >
            <MoreHorizontal
              className={`w-5 h-5 mb-1 ${moreActive || moreOpen ? "text-primary" : ""}`}
            />
            <span
              className={`text-xs font-medium ${
                moreActive || moreOpen ? "text-primary" : ""
              }`}
            >
              {language === "zh" ? "更多" : "More"}
            </span>
            {moreActive && (
              <div className="absolute bottom-1 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="md:hidden">
          <DrawerHeader className="flex flex-row items-center justify-between pb-2">
            <DrawerTitle className="text-base font-semibold">
              {language === "zh" ? "更多功能" : "More"}
            </DrawerTitle>
            <DrawerClose
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label={language === "zh" ? "关闭" : "Close"}
            >
              <X className="w-4 h-4" />
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-2">
            {moreItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.path)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                    active
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-card/40 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/40 text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {language === "zh" ? item.label : item.labelEn}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {language === "zh" ? item.desc : item.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;
