import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PanelLeft } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Floating sidebar toggle button */}
          <SidebarTrigger 
            className="fixed left-2 top-[4.5rem] z-50 
              w-10 h-10 rounded-full 
              bg-primary text-primary-foreground 
              shadow-lg shadow-primary/30
              hover:bg-primary/90 hover:shadow-primary/50
              flex items-center justify-center
              transition-all duration-200
              md:left-3 md:top-20
              btn-pulse"
          >
            <PanelLeft className="w-5 h-5" />
          </SidebarTrigger>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
