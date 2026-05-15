import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type Pegawai, nextPangkat, nextKgb } from "@/lib/simpeg-data";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Award,
  Wallet,
  Briefcase,
  Clock,
} from "lucide-react";
import api from "@/services/api";

export const Route = createFileRoute("/pegawai/$id")({ component: DetailPegawai });

function DetailPegawai() {
  const { id } = useParams({ from: "/pegawai/$id" });
  const [p, setP] = useState<Pegawai | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/pegawai/${id}`);
        if (response.data.success) {
          setP(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil detail pegawai:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <AppShell title="Detail Pegawai">
        <div className="p-8 text-center">Memuat data...</div>
      </AppShell>
    );

  if (!p)
    return (
      <AppShell title="Tidak ditemukan">
        <div className="p-8 text-center">
          <p>Pegawai tidak ditemukan.</p>
          <Link to="/pegawai" className="text-primary hover:underline mt-4 inline-block">
            Kembali ke Daftar Pegawai
          </Link>
        </div>
      </AppShell>
    );

  const riwayat = (p as any).riwayats || [];
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const getTenure = (iso: string) => {
    if (!iso) return "-";
    const start = new Date(iso);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y} thn ${m} bln`;
  };

  return (
    <AppShell title="Detail Pegawai">
      <Link
        to="/pegawai"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </Link>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="shadow-card lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="size-24 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-elevated">
              {p.nama.charAt(0)}
            </div>
            <h2 className="mt-4 font-bold text-lg">{p.nama}</h2>
            <p className="text-sm text-muted-foreground">{p.jabatan}</p>
            <Badge className="mt-2 bg-success/10 text-success border-0 capitalize">
              {p.status}
            </Badge>
            <div className="mt-6 space-y-3 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4" />
                {p.email}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="size-4" />
                {p.phone}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Briefcase className="size-4" />
                {p.jabatan}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Award className="size-4" />
                Golongan {p.golongan}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="size-4" />
                Masa Kerja: {getTenure(p.tanggalMasuk)}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3 text-left">
              <div className="text-xs text-muted-foreground">NIP</div>
              <div className="text-xs font-mono">{p.nip}</div>
              <div className="text-xs text-muted-foreground">TMT Pangkat</div>
              <div className="text-xs">{p.tmtPangkat ? fmt(p.tmtPangkat) : "-"}</div>
              <div className="text-xs text-muted-foreground">TMT KGB</div>
              <div className="text-xs">{p.tmtKgb ? fmt(p.tmtKgb) : "-"}</div>
              <div className="text-xs text-muted-foreground">Tanggal Masuk</div>
              <div className="text-xs">{p.tanggalMasuk ? fmt(p.tanggalMasuk) : "-"}</div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="shadow-card bg-gradient-primary text-white">
              <CardContent className="p-5">
                <Award className="size-6 opacity-80" />
                <div className="mt-3 text-xs opacity-80">Naik Pangkat Berikutnya</div>
                <div className="mt-1 text-xl font-bold">{fmt(nextPangkat(p))}</div>
                <div className="text-xs opacity-70 mt-1">+ 4 tahun berkala</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-5">
                <Wallet className="size-6 text-success" />
                <div className="mt-3 text-xs text-muted-foreground">KGB Berikutnya</div>
                <div className="mt-1 text-xl font-bold">{fmt(nextKgb(p))}</div>
                <div className="text-xs text-muted-foreground mt-1">+ 2 tahun berkala</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Riwayat & Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="timeline">
                  <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="pangkat">Pangkat</TabsTrigger>
                    <TabsTrigger value="kgb">KGB</TabsTrigger>
                    <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
                  </TabsList>
                  <TabsContent value="timeline" className="mt-4">
                    <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                      {riwayat.length === 0 && (
                        <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
                      )}
                      {riwayat.map((r: any) => (
                        <div key={r.id} className="relative">
                          <div className="absolute -left-6 top-1 size-4 rounded-full bg-card border-2 border-primary" />
                          <div className="text-xs text-muted-foreground">{fmt(r.date)}</div>
                          <div className="font-medium text-sm">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.description}</div>
                          {r.status && (
                            <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                              {r.status}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="pangkat" className="mt-4 text-sm text-muted-foreground">
                    Riwayat kenaikan pangkat akan tampil di sini.
                  </TabsContent>
                  <TabsContent value="kgb" className="mt-4 text-sm text-muted-foreground">
                    Riwayat KGB akan tampil di sini.
                  </TabsContent>
                  <TabsContent value="dokumen" className="mt-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <p className="text-sm text-muted-foreground italic col-span-2">
                        Gunakan menu Approval untuk mengelola dokumen pengajuan.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
