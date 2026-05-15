import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Wallet,
  Bell,
  FileCheck,
  Calendar,
  FileBarChart,
  Settings,
  UserCircle,
  LogOut,
  Shield,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "pimpinan", "pegawai"],
  },
  { to: "/pegawai", label: "Data Pegawai", icon: Users, roles: ["admin", "pimpinan"] },
  {
    to: "/kenaikan-pangkat",
    label: "Kenaikan Pangkat",
    icon: TrendingUp,
    roles: ["admin", "pimpinan", "pegawai"],
  },
  { to: "/kgb", label: "KGB", icon: Wallet, roles: ["admin", "pimpinan", "pegawai"] },
  { to: "/approval", label: "Approval Dokumen", icon: FileCheck, roles: ["admin", "pimpinan"] },

  { to: "/kalender", label: "Kalender", icon: Calendar, roles: ["admin", "pimpinan", "pegawai"] },
  { to: "/laporan", label: "Laporan", icon: FileBarChart, roles: ["admin", "pimpinan"] },
  { to: "/profile", label: "Profile", icon: UserCircle, roles: ["admin", "pimpinan", "pegawai"] },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings, roles: ["admin"] },
];

const masterItems = [
  { to: "/master/golongan", label: "Master Golongan", icon: Shield, roles: ["admin"] },
  { to: "/master/jabatan", label: "Master Jabatan", icon: Building2, roles: ["admin"] },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  if (!user) return null;
  const items = navItems.filter((i) => i.roles.includes(user.role));
  const masterData = masterItems.filter((i) => i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-2 py-3 transition-all",
            state === "collapsed" ? "justify-center" : "px-3",
          )}
        >
          <div className="size-12 shrink-0 transition-transform duration-300">
            <img
              src="/kementrian_imigrasi_sikapas.png"
              alt="SIKAPAS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              state === "collapsed" ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <div className="font-bold text-base leading-tight text-sidebar-foreground">SIKAPAS</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Sistem Kepegawaian
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.to || path.startsWith(item.to + "/");
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "transition-all",
                        active &&
                          "bg-sidebar-primary text-sidebar-primary-foreground shadow-elevated",
                      )}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {masterData.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {masterData.map((item) => {
                  const active = path === item.to || path.startsWith(item.to + "/");
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={cn(
                          "transition-all",
                          active &&
                            "bg-sidebar-primary text-sidebar-primary-foreground shadow-elevated",
                        )}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50",
            state === "collapsed" && "justify-center p-1",
          )}
        >
          <div className="size-10 shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold shadow-sm transition-transform duration-300">
            {user.name.charAt(0)}
          </div>
          <div
            className={cn(
              "flex flex-1 min-w-0 items-center justify-between transition-all duration-300 ease-in-out",
              state === "collapsed" ? "w-0 opacity-0 hidden" : "w-auto opacity-100 flex",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user.name}</div>
              <div className="flex items-center gap-1 text-[10px] text-sidebar-foreground/60">
                <Shield className="size-3" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
