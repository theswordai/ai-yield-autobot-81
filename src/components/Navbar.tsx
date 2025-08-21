import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { WalletConnector } from "@/components/WalletConnector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/hooks/useI18n";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, language } = useI18n();

  // 获取当前语言前缀
  const langPrefix = language === 'zh' ? '/zh' : '/en';

  const navigation = [
    { name: t("nav.home"), href: `${langPrefix}` },
    { name: t("nav.invest"), href: `${langPrefix}/invest` },
    { name: t("nav.bluePoints"), href: `${langPrefix}/blue-points` },
    { name: t("nav.user"), href: `${langPrefix}/user` },
    { name: t("nav.whitepaper"), href: `${langPrefix}/whitepaper` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={langPrefix} className="flex items-center space-x-2" aria-label="USD.ONLINE Home">
            <img
              src="/lovable-uploads/e273a398-537e-4766-b1d0-aee195477fb3.png"
              alt="USD.ONLINE logo"
              className="w-8 h-8 rounded-md object-cover"
              loading="eager"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              USD.ONLINE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive(item.href) 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Language Selector and Wallet Connector */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <WalletConnector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-card/50 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                <LanguageSelector />
                <WalletConnector />
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}