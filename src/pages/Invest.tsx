import { Navbar } from "@/components/Navbar";
import { PageWrapper } from "@/components/PageWrapper";
import Stake from "./Stake";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import lucky5MinBanner from "@/assets/lucky-5min-banner.png";
export default function Invest() {
  const { t } = useI18n();
  
  return <PageWrapper>
      <Helmet>
        <title>{t("invest.title")}</title>
        <meta name="description" content={t("invest.description")} />
        <link rel="canonical" href="/invest" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-10">
        <header className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("invest.header")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("invest.subtitle")}</p>
        </header>
        <div className="mt-6">
          <Stake embedded />
        </div>
        <div className="mt-6 max-w-md sm:max-w-lg mx-auto">
          <a
            href="https://usdonline.xyz/hourdraw"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl overflow-hidden border border-accent/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur shadow-lg hover:shadow-accent/30 hover:border-accent/40 transition-all duration-300"
            aria-label="幸运5分钟 - Lucky 5Min Jackpot"
          >
            <img
              src={lucky5MinBanner}
              alt="幸运5分钟 Jackpot - 每5分钟开奖一次 Chainlink VRF"
              className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </a>
        </div>
      </main>
    </PageWrapper>;
}