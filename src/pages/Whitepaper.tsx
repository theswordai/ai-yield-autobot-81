import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { PDFViewer } from "@/components/PDFViewer";

export default function Whitepaper() {
  const { t } = useI18n();
  const pdfUrl = "/harmony-wealth-engine.pdf";
  
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
              <p className="text-muted-foreground">
                构建财富与慈善的和谐统一，通过区块链技术实现透明、高效的价值创造
              </p>
            </div>

            {/* PDF Viewer */}
            <PDFViewer url={pdfUrl} title="和谐财富引擎白皮书" />
          </div>
        </div>
      </div>
    </div>
  );
}
