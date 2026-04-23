import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { WalletConnector } from "@/components/WalletConnector";
import { useI18n } from "@/hooks/useI18n";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, language } = useI18n();

  const langPrefix = language === "zh" ? "/zh" : "/en";

  const navigation = [
    { name: t("nav.home"), href: `${langPrefix}` },
    { name: t("nav.invest"), href: `${langPrefix}/invest` },
    { name: t("nav.swap"), href: `${langPrefix}/usdv?tab=dex` },
    { name: t("nav.user"), href: `${langPrefix}/user` },
    { name: t("nav.whitepaper"), href: `${langPrefix}/whitepaper` },
    { name: t("nav.predict"), href: `${langPrefix}/predict` },
  ];

  const isActive = (path: string) => {
    const cleanPath = path.split("?")[0];
    return location.pathname === cleanPath;
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-6xl rounded-[24px] border border-border/50 bg-background/75 shadow-card backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-5">
          <Link to={langPrefix} className="flex items-center gap-3" aria-label="USD.ONLINE Home">
            <img
              src="/lovable-uploads/e6bca233-40fa-44a0-bf40-dd55b080b52d.png"
              alt="USD.ONLINE logo"
              className="h-9 w-9 rounded-xl object-cover"
              loading="eager"
              width={36}
              height={36}
            />
            <div className="min-w-0">
              <span className="block bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-lg font-black tracking-normal text-transparent sm:text-xl">
                USD.ONLINE
              </span>
              <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground sm:block">MORAL ALPHA 3.0</span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <div className="flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <WalletConnector />
              <a
                href="https://x.com/ONLINE_USD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card/70"
              >
                <img src="/lovable-uploads/x-logo.png" alt="X" className="h-5 w-5 rounded" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a
              href="https://x.com/ONLINE_USD"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-card/50 transition-colors hover:border-primary/30"
            >
              <img src="/lovable-uploads/x-logo.png" alt="X" className="h-5 w-5 rounded" />
            </a>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/70"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-border/40 bg-card/40 px-3 pb-3 pt-2 md:hidden">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                <WalletConnector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
