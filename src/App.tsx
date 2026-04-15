import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/components/I18nProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Referral from "./pages/Referral";
import Stake from "./pages/Stake";
import StakeNew from "./pages/StakeNew";
import Whitepaper from "./pages/Whitepaper";
import NotFound from "./pages/NotFound";
import Invest from "./pages/Invest";
import UserCenter from "./pages/UserCenter";
import Invite from "./pages/Invite";
import USDV from "./pages/USDV";
import Predict from "./pages/Predict";
import PredictDetail from "./pages/PredictDetail";
import FAQCustomerService from "./components/FAQCustomerService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile sidebar trigger */}
                <header className="h-12 flex items-center border-b border-border md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
                  <SidebarTrigger className="ml-3" />
                  <span className="ml-2 text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    USD.ONLINE
                  </span>
                </header>
                <main className="flex-1">
                  <FAQCustomerService />
                  <Routes>
                    {/* Language-specific routes */}
                    <Route path="/zh" element={<Index />} />
                    <Route path="/zh/invest" element={<Invest />} />
                    <Route path="/zh/stake-new" element={<StakeNew />} />
                    <Route path="/zh/usdv" element={<USDV />} />
                    <Route path="/zh/user" element={<UserCenter />} />
                    <Route path="/zh/referral" element={<Referral />} />
                    <Route path="/zh/invite/:inviter" element={<Invite />} />
                    <Route path="/zh/i/:code" element={<Invite />} />
                    <Route path="/zh/whitepaper" element={<Whitepaper />} />
                    <Route path="/zh/predict" element={<Predict />} />
                    <Route path="/zh/predict/:id" element={<PredictDetail />} />
                    
                    <Route path="/en" element={<Index />} />
                    <Route path="/en/invest" element={<Invest />} />
                    <Route path="/en/stake-new" element={<StakeNew />} />
                    <Route path="/en/usdv" element={<USDV />} />
                    <Route path="/en/user" element={<UserCenter />} />
                    <Route path="/en/referral" element={<Referral />} />
                    <Route path="/en/invite/:inviter" element={<Invite />} />
                    <Route path="/en/i/:code" element={<Invite />} />
                    <Route path="/en/whitepaper" element={<Whitepaper />} />
                    <Route path="/en/predict" element={<Predict />} />
                    <Route path="/en/predict/:id" element={<PredictDetail />} />

                    {/* Default routes redirect to Chinese */}
                    <Route path="/" element={<Navigate to="/zh" replace />} />
                    <Route path="/invest" element={<Navigate to="/zh/invest" replace />} />
                    <Route path="/stake-new" element={<Navigate to="/zh/stake-new" replace />} />
                    <Route path="/usdv" element={<Navigate to="/zh/usdv" replace />} />
                    <Route path="/user" element={<Navigate to="/zh/user" replace />} />
                    <Route path="/invite/:inviter" element={<Navigate to="/zh/invite/:inviter" replace />} />
                    <Route path="/i/:code" element={<Navigate to="/zh/i/:code" replace />} />
                    <Route path="/whitepaper" element={<Navigate to="/zh/whitepaper" replace />} />

                    {/* Legacy routes -> redirects */}
                    <Route path="/dashboard" element={<Navigate to="/zh/user" replace />} />
                    <Route path="/referral" element={<Navigate to="/zh/referral" replace />} />
                    <Route path="/trade" element={<Navigate to="/zh/invest" replace />} />
                    <Route path="/stake" element={<Navigate to="/zh/invest" replace />} />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
