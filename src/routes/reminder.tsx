import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Pegawai, type Approval, nextPangkat, nextKgb, daysUntil } from "@/lib/simpeg-data";
import { Bell, Calendar, User as UserIcon, Clock, AlertTriangle } from "lucide-react";
import api from "@/services/api";

export const Route = createFileRoute("/reminder")({ component: Page });

function Page() {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          api.get("/pegawai"),
          api.get("/approvals")
        ]);
        if (pRes.data.success) setPegawai(pRes.data.data);
        if (aRes.data.success) setApprovals(aRes.data.data);
      } catch (error) {
        console.error("Gagal mengambil data reminder:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pReminders = pegawai
    .map((p) => ({
      p,
      type: "Kenaikan Pangkat",
      date: nextPangkat(p),
      days: daysUntil(nextPangkat(p)),
    }))
    .filter((r) => r.days <= 30 && r.days > 0);

  const kReminders = pegawai
    .map((p) => ({
      p,
      type: "KGB",
      date: nextKgb(p),
      days: daysUntil(nextKgb(p)),
    }))
    .filter((r) => r.days <= 30 && r.days > 0);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const allReminders = [
    ...pReminders.map(r => ({ ...r, category: 'deadline' })),
    ...kReminders.map(r => ({ ...r, category: 'deadline' })),
    ...pendingApprovals.map(a => ({ 
      p: { nama: a.pegawaiNama || 'Pegawai' }, 
      type: `Approval: ${a.type}`, 
      date: a.submittedAt, 
      days: daysUntil(a.submittedAt),
      category: 'approval',
      id: a.id
    }))
  ].sort((a, b) => a.days - b.days);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) return <AppShell title="Reminder"><div className="p-8 text-center">Memuat data...</div></AppShell>;

  return (
    <AppShell title="Pusat Reminder">
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Mendekati Batas Waktu</CardTitle>
              <Badge className="bg-destructive/10 text-destructive border-0">Urgent</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {allReminders.filter(r => r.category === 'deadline').length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada batas waktu dalam 30 hari ke depan.</p>
              )}
              {allReminders.filter(r => r.category === 'deadline').map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <div className={`size-10 rounded-lg flex items-center justify-center ${r.days <= 7 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{(r.p as any).nama}</div>
                    <div className="text-xs text-muted-foreground">{r.type} • {fmt(r.date)}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">H-{r.days}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Persetujuan Menunggu</CardTitle>
              <Bell className="size-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
               {pendingApprovals.length === 0 && (
                 <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada pengajuan yang menunggu.</p>
               )}
               {pendingApprovals.map((a: any) => (
                 <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Clock className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{a.pegawai?.nama || a.pegawaiNama}</div>
                      <div className="text-xs text-muted-foreground">{a.type} • Diajukan {new Date(a.submitted_at).toLocaleDateString()}</div>
                    </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
