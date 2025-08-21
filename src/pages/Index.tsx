import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";

const Index = () => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <link rel="canonical" href="/" />
        
        {/* Open Graph / Social Media Preview */}
        <meta property="og:title" content={t("meta.title")} />
        <meta property="og:description" content={t("meta.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/lovable-uploads/3c6b91d2-0114-4026-bfae-76468771746f.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://usd.online" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("meta.title")} />
        <meta name="twitter:description" content={t("meta.description")} />
        <meta name="twitter:image" content="/lovable-uploads/3c6b91d2-0114-4026-bfae-76468771746f.png" />
        
        {/* Additional social platforms */}
        <meta property="telegram:image" content="/lovable-uploads/3c6b91d2-0114-4026-bfae-76468771746f.png" />
      </Helmet>
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Index;
