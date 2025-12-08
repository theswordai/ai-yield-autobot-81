import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";

export default function Whitepaper() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Helmet>
        <title>{t('meta.title')} | 和谐财富引擎</title>
        <meta name="description" content="和谐财富引擎白皮书 - 构建财富与慈善的和谐统一" />
        <link rel="canonical" href="/whitepaper" />
      </Helmet>
      
      <div className="pt-16 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                和谐财富引擎
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
            </div>

            {/* PDF Viewer */}
            <div className="w-full bg-card rounded-lg border border-border overflow-hidden shadow-lg">
              <embed 
                src="/和谐财富引擎.pdf" 
                type="application/pdf"
                className="w-full"
                style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
              />
            </div>
            
            {/* Fallback for browsers that don't support embed */}
            <div className="mt-4 text-center">
              <a 
                href="/和谐财富引擎.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline"
              >
                如果PDF无法显示，点击此处在新窗口打开
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
