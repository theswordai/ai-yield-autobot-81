import { Rocket, Heart, Coins, Crown, TrendingUp, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { WalletConnector } from "@/components/WalletConnector";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const langPrefix = language === "zh" ? "/zh" : "/en";

  const navItems = [
    {
      id: "launch",
      label: language === "zh" ? "启航" : "Launch",
      icon: Rocket,
      path: `${langPrefix}`,
    },
    {
      id: "charity",
      label: language === "zh" ? "善举" : "Charity",
      icon: Heart,
      path: `${langPrefix}/invest`,
    },
    {
      id: "usdv",
      label: "USDV",
      icon: Coins,
      path: `${langPrefix}/usdv`,
    },
    {
      id: "vip",
      label: language === "zh" ? "和谐财富引擎" : "Wealth Engine",
      icon: Crown,
      path: `${langPrefix}/referral`,
    },
    {
      id: "whitepaper",
      label: language === "zh" ? "白皮书" : "Docs",
      icon: FileText,
      path: `${langPrefix}/whitepaper`,
    },
    {
      id: "predict",
      label: language === "zh" ? "预测市场" : "Predict",
      icon: TrendingUp,
      path: `${langPrefix}/predict`,
    },
  ];

  const isActive = (path: string) => {
    if (path === langPrefix) {
      return location.pathname === path || location.pathname === `${langPrefix}/`;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={{
        "--sidebar-background": "hsl(215 32% 8%)",
        "--sidebar-foreground": "hsl(210 40% 98%)",
        "--sidebar-border": "hsl(215 25% 14%)",
        "--sidebar-accent": "hsl(47 96% 53% / 0.15)",
        "--sidebar-accent-foreground": "hsl(47 96% 53%)",
      } as React.CSSProperties}
    >
      <SidebarContent className="pt-6 px-3">
        {/* Logo Section */}
        <div
          className={`flex items-center mb-8 cursor-pointer ${collapsed ? "justify-center px-0" : "px-3"}`}
          onClick={() => navigate(langPrefix)}
        >
          <img
            src="/lovable-uploads/e6bca233-40fa-44a0-bf40-dd55b080b52d.png"
            alt="USD.ONLINE logo"
            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
            loading="eager"
          />
          {!collapsed && (
            <div className="ml-3">
              <span className="text-lg font-bold tracking-wide" style={{ color: "hsl(47 96% 53%)" }}>
                USD.ONLINE
              </span>
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "hsl(215 13% 50%)" }}>
                Sovereign Ledger
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={active}
                  tooltip={item.label}
                  className={`h-11 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-[hsl(47_96%_53%_/_0.15)] text-[hsl(47,96%,53%)] font-semibold shadow-[inset_0_0_20px_hsl(47_96%_53%_/_0.05)]"
                      : "text-[hsl(215,13%,60%)] hover:text-[hsl(210,40%,90%)] hover:bg-[hsl(215_25%_14%)]"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[hsl(47,96%,53%)]" : ""}`} />
                  {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Wallet at bottom */}
        {!collapsed && (
          <div className="mt-auto pt-6 px-2">
            <WalletConnector />
            <div className="mt-4 flex items-center justify-center">
              <a href="https://x.com/ONLINE_USD" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <img src="/lovable-uploads/x-logo.png" alt="X" className="w-7 h-7 rounded opacity-60 hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
