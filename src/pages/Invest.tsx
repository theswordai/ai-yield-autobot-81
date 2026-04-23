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
        <div className="mt-6 max-w-2xl mx-auto">
          <a
            href="https://usdonline.xyz/hourdraw"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-border/40 shadow-lg hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300"
            aria-label="幸运5分钟 - Lucky 5Min Jackpot"
          >
            <img
              src={lucky5MinBanner}
              alt="幸运5分钟 Jackpot - 每5分钟开奖一次 Chainlink VRF"
              className="w-full h-auto block"
              loading="lazy"
            />
          </a>
        </div>
      </main>
    </PageWrapper>;
}