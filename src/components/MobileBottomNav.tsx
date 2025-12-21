import { useLocation, useNavigate } from "react-router-dom";
import { Rocket, Heart, Coins, Crown, FileText } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useI18n();

  const navItems = [
    { 
      id: "launch", 
      label: "启航", 
      labelEn: "Launch",
      icon: Rocket, 
      path: `/${language}` 
    },
    { 
      id: "charity", 
      label: "善举", 
      labelEn: "Charity",
      icon: Heart, 
      path: `/${language}/invest` 
    },
    { 
      id: "usdv", 
      label: "USDV", 
      labelEn: "USDV",
      icon: Coins, 
      path: `/${language}/usdv` 
    },
    { 
      id: "vip", 
      label: "尊享", 
      labelEn: "VIP",
      icon: Crown, 
      path: `/${language}/referral`
    },
    { 
      id: "whitepaper", 
      label: "白皮书", 
      labelEn: "Docs",
      icon: FileText, 
      path: `/${language}/whitepaper` 
    },
  ];

  const isActive = (path: string) => {
    if (path === `/${language}`) {
      return location.pathname === path || location.pathname === `/${language}/`;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
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
      </div>
    </nav>
  );
};

export default MobileBottomNav;
