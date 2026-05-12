import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, Settings, HelpCircle, ShieldCheck, Mail, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link, useNavigate } from "@tanstack/react-router";
import { type Pegawai, type Approval, nextPangkat, nextKgb, daysUntil } from "@/lib/simpeg-data";
import api from "@/services/api";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const [pRes, aRes] = await Promise.all([api.get("/pegawai"), api.get("/approvals")]);

        const pData: Pegawai[] = pRes.data.success ? pRes.data.data : [];
        const aData: Approval[] = aRes.data.success ? aRes.data.data : [];

        const alerts: any[] = [];

        // 1. Upcoming deadlines (Admin/Pimpinan only)
        if (user.role !== "pegawai") {
          pData.forEach((p) => {
            const dPangkat = daysUntil(nextPangkat(p));
            if (dPangkat <= 30 && dPangkat > 0) {
              alerts.push({
                id: `p-${p.id}`,
                title: `Naik Pangkat: ${p.nama}`,
                desc: `H-${dPangkat} Menuju TMT`,
                type: "deadline",
              });
            }
            const dKgb = daysUntil(nextKgb(p));
            if (dKgb <= 30 && dKgb > 0) {
              alerts.push({
                id: `k-${p.id}`,
                title: `KGB: ${p.nama}`,
                desc: `H-${dKgb} Menuju TMT`,
                type: "deadline",
              });
            }
          });

          // 2. Pending Approvals
          aData
            .filter((a) => a.status === "pending")
            .forEach((a) => {
              alerts.push({
                id: `a-${a.id}`,
                title: "Pengajuan Baru",
                desc: `Dari ${(a as any).pegawai?.nama || a.pegawaiNama}`,
                type: "approval",
              });
            });
        } else {
          // Personal alerts for Pegawai
          const me = pData.find((p) => p.nip === user.nip);
          if (me) {
            const dP = daysUntil(nextPangkat(me));
            if (dP <= 30 && dP > 0)
              alerts.push({
                id: "me-p",
                title: "Jadwal Pangkat",
                desc: `H-${dP} lagi!`,
                type: "deadline",
              });
            const dK = daysUntil(nextKgb(me));
            if (dK <= 30 && dK > 0)
              alerts.push({
                id: "me-k",
                title: "Jadwal KGB",
                desc: `H-${dK} lagi!`,
                type: "deadline",
              });
          }

          // My approval updates
          aData
            .filter((a) => a.status !== "pending" && a.pegawai_id === (user as any).id)
            .forEach((a) => {
              alerts.push({
                id: `my-a-${a.id}`,
                title: `Pengajuan ${a.type}`,
                desc: `Status: ${a.status}`,
                type: "info",
              });
            });
        }

        setNotifications(alerts.slice(0, 5));
      } catch (err) {
        console.error("Gagal memuat notifikasi:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="hidden lg:block">
          <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sistem Informasi Kepegawaian & Pangkat (SIKAPAS)
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full hover:bg-muted"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 shadow-elevated border-border">
            <DropdownMenuLabel className="p-4 font-bold border-b flex items-center justify-between">
              Notifikasi
              {notifications.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {notifications.length}
                </Badge>
              )}
            </DropdownMenuLabel>
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p className="text-xs">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="p-4 focus:bg-muted/50 cursor-pointer border-b last:border-0 border-border/50"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === "deadline" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}
                      >
                        {n.type === "deadline" ? (
                          <Clock className="size-4" />
                        ) : (
                          <ShieldCheck className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[11px] text-primary"
                  asChild
                >
                  <Link to="/reminder">Lihat Semua Reminder</Link>
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-muted rounded-full"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 capitalize leading-none">
                  {user?.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 shadow-elevated border-border">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="p-3 cursor-pointer focus:bg-primary/5 focus:text-primary"
            >
              <Link to="/profile" className="flex w-full items-center">
                <User className="mr-3 h-4 w-4" />
                <span>Profil Saya</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="p-3 cursor-pointer focus:bg-primary/5 focus:text-primary"
            >
              <Link to="/pengaturan" className="flex w-full items-center">
                <Settings className="mr-3 h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer focus:bg-primary/5 focus:text-primary">
              <HelpCircle className="mr-3 h-4 w-4" />
              <span>Bantuan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="p-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
