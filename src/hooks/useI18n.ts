import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const changeLanguage = (language: string) => {
    // 获取当前路径，移除语言前缀
    const currentPath = location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}/, '') || '/';
    
    // 导航到新的语言路径
    const newPath = `/${language}${pathWithoutLang}`;
    navigate(newPath);
    
    // 更新 HTML lang 属性
    document.documentElement.lang = language;
    
    // 更新 localStorage
    localStorage.setItem('i18nextLng', language);
  };
  
  // 设置初始 HTML lang 属性和语言检测
  useEffect(() => {
    // 从URL路径中检测语言
    const pathname = location.pathname;
    const pathMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (pathMatch && pathMatch[1] !== i18n.language) {
      console.log('Changing language from path:', pathMatch[1]);
      i18n.changeLanguage(pathMatch[1]);
    }
    document.documentElement.lang = i18n.language;
  }, [i18n.language, location.pathname]);
  
  return {
    t,
    language: i18n.language,
    changeLanguage,
    isLoading: !i18n.isInitialized
  };
}