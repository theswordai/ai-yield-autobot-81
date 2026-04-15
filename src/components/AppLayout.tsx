import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PanelLeft, PanelLeftClose } from "lucide-react";

function SidebarToggleButton() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <SidebarTrigger 
      className={`fixed z-50 
        w-10 h-10 rounded-full 
        bg-primary text-primary-foreground 
        shadow-lg shadow-primary/30
        hover:bg-primary/90 hover:shadow-primary/50 hover:scale-105
        flex items-center justify-center
        transition-all duration-300
        hidden md:flex
        top-20
        ${isExpanded ? "left-[16.5rem]" : "left-[3.5rem]"}`}
    >
      {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
    </SidebarTrigger>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <SidebarToggleButton />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
