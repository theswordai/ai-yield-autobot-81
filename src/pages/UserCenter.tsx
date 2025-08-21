import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "./Dashboard";
import Referral from "./Referral";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
export default function UserCenter() {
  const { t } = useI18n();
  
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Helmet>
        <title>{t("user.title")}</title>
        <meta name="description" content={t("user.description")} />
        <link rel="canonical" href="/user" />
      </Helmet>
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-10 relative z-10">
        <header className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("user.header")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("user.subtitle")}</p>
        </header>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto h-9 sm:h-10">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">{t("user.tab.dashboard")}</TabsTrigger>
            <TabsTrigger value="referral" className="text-xs sm:text-sm">{t("user.tab.referral")}</TabsTrigger>
          </TabsList>
          <div className="mt-4 sm:mt-6">
            <TabsContent value="dashboard">
              <Dashboard embedded />
            </TabsContent>
            <TabsContent value="referral">
              <Referral embedded />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>;
}