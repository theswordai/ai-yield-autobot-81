import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻译资源
import zh from '../locales/zh.json';
import en from '../locales/en.json';

const resources = {
  zh: {
    translation: zh
  },
  en: {
    translation: en
  }
};

// URL 路径语言检测器
const urlPathDetector = {
  name: 'urlPath',
  lookup(options: any) {
    let found: string[] = [];
    
    // 检查路径前缀
    const pathname = window.location.pathname;
    console.log('Current pathname:', pathname);
    const pathMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (pathMatch) {
      console.log('Language detected from path:', pathMatch[1]);
      found.push(pathMatch[1]);
    }
    
    return found.length > 0 ? found : undefined;
  },
  cacheUserLanguage(lng: string) {
    console.log('Caching language:', lng);
    // 不需要缓存到URL，因为URL路径本身就是语言状态
    localStorage.setItem('i18nextLng', lng);
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    defaultNS: 'translation',
    
    // 语言检测配置
    detection: {
      order: ['urlPath', 'localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    
    // 支持的语言列表
    supportedLngs: ['zh', 'en'],
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    },
    
    // 添加调试信息
    debug: true
  });

// 添加自定义检测器
i18n.services.languageDetector.addDetector(urlPathDetector);

export default i18n;