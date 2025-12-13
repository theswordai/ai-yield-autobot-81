import { Navbar } from "@/components/Navbar";
import { PerformanceChart } from "@/components/PerformanceChart";
import { useI18n } from "@/hooks/useI18n";

export default function Strategy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              {t("strategy.title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("strategy.subtitle")}
            </p>
          </div>

          {/* Performance Chart */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8">
            <PerformanceChart />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">{t("strategy.aiExecution")}</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">19+</div>
              <div className="text-sm text-muted-foreground">{t("strategy.weeksLive")}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
