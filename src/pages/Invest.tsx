import { Navbar } from "@/components/Navbar";
import Stake from "./Stake";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
export default function Invest() {
  const { t } = useI18n();
  
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