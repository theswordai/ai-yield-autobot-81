import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              
              {/* Action buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Button asChild variant="default" className="gap-2">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    在新窗口打开
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href={pdfUrl} download="harmony-wealth-engine.pdf">
                    <Download className="w-4 h-4" />
                    下载PDF
                  </a>
                </Button>
              </div>
            </div>

            {/* PDF Viewer using object tag with iframe fallback */}
            <div className="w-full bg-card rounded-lg border border-border overflow-hidden shadow-lg">
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full"
                style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
              >
                {/* Fallback for browsers that don't support object/embed */}
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-6">
                  <FileText className="w-20 h-20 text-primary" />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">和谐财富引擎白皮书</h2>
                    <p className="text-muted-foreground max-w-md">
                      您的浏览器不支持内嵌PDF预览，请点击下方按钮查看或下载白皮书。
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild size="lg" className="gap-2">
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5" />
                        打开PDF
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                      <a href={pdfUrl} download="harmony-wealth-engine.pdf">
                        <Download className="w-5 h-5" />
                        下载PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
