import { Navbar } from "@/components/Navbar";
import Stake from "./Stake";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect } from "react";
import InvitationLandingPage from "@/components/InvitationLandingPage";
import { useNavigate, useLocation } from "react-router-dom";

export default function Invest() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLandingPage, setShowLandingPage] = useState(false);

  // Check if user has seen the landing page before
  useEffect(() => {
    const hasSeenLanding = localStorage.getItem('hasSeenInvestLanding');
    if (!hasSeenLanding) {
      setShowLandingPage(true);
    }
  }, []);

  const handleCloseLanding = () => {
    localStorage.setItem('hasSeenInvestLanding', 'true');
    setShowLandingPage(false);
  };

  const handleGoToReferral = () => {
    localStorage.setItem('hasSeenInvestLanding', 'true');
    setShowLandingPage(false);
    
    // Get current language prefix
    const currentPath = location.pathname;
    const langMatch = currentPath.match(/^\/([a-z]{2})/);
    const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
    
    navigate(`${langPrefix}/referral`);
  };

  if (showLandingPage) {
    return (
      <>
        <Helmet>
          <title>数美在线 · USDV 的孵化器</title>
          <meta name="description" content="通往 USDV 的唯一入口，驱动文明级财富裂变的终极引擎" />
        </Helmet>
        <InvitationLandingPage 
          onClose={handleCloseLanding} 
          onProceed={handleCloseLanding}
          onGoToReferral={handleGoToReferral}
        />
      </>
    );
  }
  
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Helmet>
        <title>{t("invest.title")}</title>
        <meta name="description" content={t("invest.description")} />
        <link rel="canonical" href="/invest" />
      </Helmet>
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-10 relative z-10">
        <header className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("invest.header")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("invest.subtitle")}</p>
        </header>
        <div className="mt-6">
          <Stake embedded />
        </div>
      </main>
    </div>;
}