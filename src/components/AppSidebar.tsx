import { useLocation, Link } from "react-router-dom";
import { Rocket, Heart, Coins, Crown, FileText, TrendingUp, User } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { language } = useI18n();

  const langPrefix = language === "zh" ? "/zh" : "/en";

  const navItems = [
    {
      title: language === "zh" ? "启航" : "Launch",
      icon: Rocket,
      href: `${langPrefix}`,
    },
    {
      title: language === "zh" ? "善举" : "Invest",
      icon: Heart,
      href: `${langPrefix}/invest`,
    },
    {
      title: language === "zh" ? "兑换" : "Swap",
      icon: Coins,
      href: `${langPrefix}/usdv?tab=dex`,
    },
    {
      title: language === "zh" ? "尊享" : "VIP",
      icon: Crown,
      href: `${langPrefix}/referral`,
    },
    {
      title: language === "zh" ? "用户中心" : "User",
      icon: User,
      href: `${langPrefix}/user`,
    },
    {
      title: language === "zh" ? "白皮书" : "Docs",
      icon: FileText,
      href: `${langPrefix}/whitepaper`,
    },
    {
      title: language === "zh" ? "预测" : "Predict",
      icon: TrendingUp,
      href: `${langPrefix}/predict`,
    },
  ];

  const isActive = (path: string) => {
    const cleanPath = path.split("?")[0];
    if (cleanPath === langPrefix) {
      return location.pathname === cleanPath || location.pathname === `${langPrefix}/`;
    }
    return location.pathname.startsWith(cleanPath);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border z-40 !top-16 !h-[calc(100vh-4rem)]">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-primary/15 text-primary font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${active ? "text-primary" : ""}`} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
