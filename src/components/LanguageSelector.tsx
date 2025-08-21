import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const languages = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSelector() {
  const { language, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-primary/10"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="sm:hidden text-xs">
          {currentLanguage?.flag}
        </span>
        <ChevronDown className="w-3 h-3" />
      </Button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute top-full right-0 mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 hover:bg-primary/10 transition-colors ${
                    language === lang.code 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}