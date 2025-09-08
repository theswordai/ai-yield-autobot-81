import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";

export default function USDV() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>USDV - USD.ONLINE</title>
        <meta name="description" content="USDV page" />
      </Helmet>
      
      <Navbar />

      <div className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Empty page - content removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}
