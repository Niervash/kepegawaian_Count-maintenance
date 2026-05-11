import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
