import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Pegawai, nextPangkat, nextKgb, daysUntil } from "@/lib/simpeg-data";
import { useAuth } from "@/lib/auth-context";
import api from "@/services/api";
import {
  Bell,
  Search,
  Calendar,
  ArrowRight,
  TrendingUp,
  Wallet,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/reminder")({
  component: ReminderPage,
});

function ReminderPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pangkat" | "kgb">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/pegawai");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data reminder:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const reminders = useMemo(() => {
    const isPegawai = user?.role === "pegawai";

    // If pegawai, only show their own
    const filteredData = isPegawai ? data.filter((p) => p.nip === user?.nip) : data;

    const items: {
      id: string;
      pegawai: Pegawai;
      type: "pangkat" | "kgb";
      date: string;
      days: number;
    }[] = [];

    filteredData.forEach((p) => {
      const dP = nextPangkat(p);
      const dK = nextKgb(p);

      items.push({
        id: `${p.id}-pangkat`,
        pegawai: p,
        type: "pangkat",
        date: dP,
        days: daysUntil(dP),
      });

      items.push({
        id: `${p.id}-kgb`,
        pegawai: p,
        type: "kgb",
        date: dK,
        days: daysUntil(dK),
      });
    });

    return items
      .filter((item) => {
        const matchSearch =
          item.pegawai.nama.toLowerCase().includes(search.toLowerCase()) ||
          item.pegawai.nip.includes(search);
        const matchFilter = filter === "all" || item.type === filter;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => a.days - b.days);
  }, [data, user, search, filter]);

  const getStatusBadge = (days: number) => {
    if (days <= 30)
      return (
        <Badge variant="destructive" className="animate-pulse">
          Segera
        </Badge>
      );
    if (days <= 90)
      return (
        <Badge variant="warning">
          Mendekat
        </Badge>
      );
    return <Badge variant="secondary">Terjadwal</Badge>;
  };

  const getDayColor = (days: number) => {
    if (days <= 30) return "text-destructive font-bold";
    if (days <= 90) return "text-warning font-bold";
    return "text-muted-foreground";
  };

  if (loading)
    return (
      <AppShell title="Reminder Kepegawaian">
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          Memuat data reminder...
        </div>
      </AppShell>
    );

  return (
    <AppShell title="Reminder Kepegawaian">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reminders.filter((r) => r.days <= 30).length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Perlu Tindakan (30 Hari)
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reminders.filter((r) => r.type === "pangkat").length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Total Kenaikan Pangkat
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-info/5 border-info/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <Wallet className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reminders.filter((r) => r.type === "kgb").length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Total KGB Mendatang
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIP..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Semua
              </Button>
              <Button
                variant={filter === "pangkat" ? "default" : "outline"}
                onClick={() => setFilter("pangkat")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Pangkat
              </Button>
              <Button
                variant={filter === "kgb" ? "default" : "outline"}
                onClick={() => setFilter("kgb")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                KGB
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminder List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((r) => (
            <Card
              key={r.id}
              className="shadow-card hover:shadow-elevated transition-all border-l-4 group"
              style={{
                borderLeftColor:
                  r.type === "pangkat" ? "oklch(0.55 0.16 260)" : "oklch(0.7 0.15 155)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center ${r.type === "pangkat" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}
                  >
                    {r.type === "pangkat" ? (
                      <TrendingUp className="size-5" />
                    ) : (
                      <Wallet className="size-5" />
                    )}
                  </div>
                  {getStatusBadge(r.days)}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                    {r.pegawai.nama}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{r.pegawai.nip}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                      Tanggal Estimasi
                    </div>
                    <div className="text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="size-3 text-muted-foreground shrink-0" />
                      {new Date(r.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                      Sisa Waktu
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${getDayColor(r.days)}`}>
                      <Clock className="size-3 shrink-0" />
                      {r.days} Hari Lagi
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {reminders.length === 0 && (
            <div className="col-span-full py-12 text-center bg-card rounded-2xl border-2 border-dashed border-border">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                <AlertCircle className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">Tidak ada reminder ditemukan</h3>
              <p className="text-sm text-muted-foreground">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
