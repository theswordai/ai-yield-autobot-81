import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useI18n() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    
    // 更新 HTML lang 属性
    document.documentElement.lang = language;
    
    // 更新 URL 参数
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState({}, '', url.toString());
    
    // 更新 localStorage
    localStorage.setItem('i18nextLng', language);
  };
  
  // 设置初始 HTML lang 属性
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  return {
    t,
    language: i18n.language,
    changeLanguage,
    isLoading: !i18n.isInitialized
  };
}