import { Navbar } from "@/components/Navbar";
import { PageWrapper } from "@/components/PageWrapper";
import { Helmet } from "react-helmet-async";
import { PDFViewer } from "@/components/PDFViewer";
import { useI18n } from "@/hooks/useI18n";

export default function Audit() {
  const { language } = useI18n();
  const pdfUrl = "/LockStakingV3_Audit_Report.pdf";

  const isZh = language === "zh";
  const title = isZh ? "审计报告" : "Audit Report";
  const subtitle = isZh
    ? "LockStaking V3 智能合约安全审计报告"
    : "LockStaking V3 Smart Contract Security Audit Report";

  return (
    <PageWrapper>
      <Navbar />
      <Helmet>
        <title>{title} | USD.ONLINE</title>
        <meta name="description" content={subtitle} />
        <link rel="canonical" href="/audit" />
      </Helmet>
      <div className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>

            {/* PDF Viewer */}
            <PDFViewer url={pdfUrl} title="LockStaking V3 Audit Report" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
