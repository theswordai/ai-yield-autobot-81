import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/components/I18nProvider";
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
import BluePoints from "./pages/BluePoints";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/blue-points" element={<BluePoints />} />
          <Route path="/stake-new" element={<StakeNew />} />
          <Route path="/user" element={<UserCenter />} />
          <Route path="/invite/:inviter" element={<Invite />} />
          <Route path="/i/:code" element={<Invite />} />

          {/* Legacy routes -> redirects */}
          <Route path="/dashboard" element={<Navigate to="/user" replace />} />
          <Route path="/referral" element={<Navigate to="/user" replace />} />
          <Route path="/trade" element={<Navigate to="/invest" replace />} />
          <Route path="/stake" element={<Navigate to="/invest" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
