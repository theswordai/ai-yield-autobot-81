import { Navbar } from "@/components/Navbar";
import { PageWrapper } from "@/components/PageWrapper";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { useNavigate } from "react-router-dom";
import { Coins, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export default function Invest() {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Helmet>
        <title>{t("invest.title")}</title>
        <meta name="description" content={t("invest.description")} />
        <link rel="canonical" href="/invest" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-12 sm:pb-20 max-w-5xl">
        <header className="mb-10 sm:mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] tracking-widest uppercase text-muted-foreground">
              Genesis Capital
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-amber-500 via-primary to-teal-500 bg-clip-text text-transparent">
              {t("invest.header")}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {t("invest.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-7">
          {/* 增值资本 */}
          <button
            onClick={() => navigate(`/${language}/legendary`)}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-9 text-left transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
          >
            {/* Glass background */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-foreground/[0.04] dark:bg-foreground/[0.04] backdrop-blur-xl border border-teal-600/30 dark:border-foreground/10 group-hover:border-teal-500/60 dark:group-hover:border-teal-400/40 transition-colors duration-500" />
            {/* Gradient sheen */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-500/25 via-transparent to-emerald-500/10 dark:from-teal-500/15 dark:to-emerald-500/5 opacity-90" />
            {/* Glow blob */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl bg-teal-400/25 group-hover:bg-teal-400/40 transition-all duration-700" />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-400/40 to-emerald-600/30 border border-teal-500/50 flex items-center justify-center shadow-[0_8px_30px_-12px_rgba(20,184,166,0.5)] group-hover:scale-110 transition-transform duration-500">
                  <Coins className="w-5 h-5 sm:w-7 sm:h-7 text-teal-700 dark:text-teal-300" />
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-teal-500/40 text-teal-700 dark:text-teal-300/90 bg-teal-500/10 dark:bg-teal-500/5">
                  CLASS-A / B
                </span>
              </div>

              <h3 className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-200 dark:to-emerald-400 bg-clip-text text-transparent">
                增值资本
              </h3>
              <p className="text-xs sm:text-sm text-foreground/70 dark:text-muted-foreground mb-3 sm:mb-6 leading-relaxed">
                CLASS-A / CLASS-B 质押引擎 · 复利锁仓 · 长周期增值
              </p>

              <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-foreground/10">
                <span className="text-[11px] sm:text-xs font-medium text-teal-700 dark:text-teal-300/90 tracking-wide">
                  进入策略
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500/20 dark:bg-teal-500/15 border border-teal-500/40 dark:border-teal-400/30 flex items-center justify-center group-hover:bg-teal-500/40 dark:group-hover:bg-teal-500/30 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 dark:text-teal-300" />
                </div>
              </div>
            </div>
          </button>

          {/* 自由资本 */}
          <button
            onClick={() => navigate(`/${language}/flexible`)}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-9 text-left transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-foreground/[0.04] backdrop-blur-xl border border-amber-600/30 dark:border-foreground/10 group-hover:border-amber-500/60 dark:group-hover:border-amber-400/40 transition-colors duration-500" />
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/25 via-transparent to-yellow-500/10 dark:from-amber-500/15 dark:to-yellow-500/5 opacity-90" />
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl bg-amber-400/25 group-hover:bg-amber-400/40 transition-all duration-700" />
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/40 to-yellow-600/30 border border-amber-500/50 flex items-center justify-center shadow-[0_8px_30px_-12px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-amber-700 dark:text-amber-300" />
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-amber-500/40 text-amber-700 dark:text-amber-300/90 bg-amber-500/10 dark:bg-amber-500/5">
                  AI Strategy
                </span>
              </div>

              <h3 className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-amber-200 dark:to-yellow-400 bg-clip-text text-transparent">
                自由资本
              </h3>
              <p className="text-xs sm:text-sm text-foreground/70 dark:text-muted-foreground mb-3 sm:mb-6 leading-relaxed">
                AI 资产管理策略 · 灵活申赎 · 智能动态调仓
              </p>

              <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-foreground/10">
                <span className="text-[11px] sm:text-xs font-medium text-amber-700 dark:text-amber-300/90 tracking-wide">
                  进入策略
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 dark:bg-amber-500/15 border border-amber-500/40 dark:border-amber-400/30 flex items-center justify-center group-hover:bg-amber-500/40 dark:group-hover:bg-amber-500/30 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </button>
        </div>

      </main>
    </PageWrapper>
  );
}
