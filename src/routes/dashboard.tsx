import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  type ImportantDoc,
  type Pegawai,
  daysUntil,
  nextPangkat,
  nextKgb,
} from "@/lib/simpeg-data";
import {
  Users,
  TrendingUp,
  Wallet,
  Clock,
  ArrowUpRight,
  FileCheck,
  Bell,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  ExternalLink,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<ImportantDoc[]>([]);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "PDF", size: "" });

  // Dashboard Data States
  const [stats, setStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [myData, setMyData] = useState<Pegawai | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const isPegawai = user?.role === "pegawai";

        // Parallel requests
        const requests: Promise<any>[] = [api.get("/dokumen")];

        if (!isPegawai) {
          requests.push(api.get("/dashboard/stats"));
          requests.push(api.get("/dashboard/distribution"));
          requests.push(api.get("/dashboard/trends"));
        } else {
          // Fetch personal profile for pegawai
          requests.push(api.get("/pegawai", { params: { search: user?.nip } }));
          // Still fetch stats for the small cards if needed, or just personal ones
          requests.push(api.get("/approvals")); // To count my own approvals
        }

        const responses = await Promise.all(requests);

        setDocs(responses[0].data.data);

        if (!isPegawai) {
          setStats(responses[1].data.data);
          setDistribution(responses[2].data.data);
          setTrends(responses[3].data.data);
        } else {
          const pegawaiList = responses[1].data.data;
          const me = pegawaiList.find((p: any) => p.nip === user?.nip);
          setMyData(me || null);

          // Filter my own approvals
          const myApps = responses[2].data.data.filter(
            (a: any) => a.pegawai_id === (user as any).id,
          );
          setStats({
            myApprovalsCount: myApps.length,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.currentTarget as any).querySelector('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!newDoc.name || !file) {
      toast.error("Mohon isi nama dokumen dan pilih file");
      return;
    }

    const formData = new FormData();
    formData.append("name", newDoc.name);
    formData.append("file", file);

    try {
      const response = await api.post("/dokumen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setDocs([response.data.data, ...docs]);
        setIsAddDocOpen(false);
        setNewDoc({ name: "", type: "PDF", size: "" });
        toast.success("Dokumen berhasil ditambahkan");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengunggah dokumen");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File terlalu besar! Maksimal 2MB");
      e.target.value = "";
      setNewDoc((prev) => ({ ...prev, size: "" }));
      return;
    }

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const extension = file.name.split(".").pop()?.toUpperCase() || "PDF";

    setNewDoc((prev) => ({
      ...prev,
      size: sizeStr,
      type: extension,
      name: prev.name || file.name.split(".")[0],
    }));
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;
    try {
      const response = await api.delete(`/dokumen/${id}`);
      if (response.data.success) {
        setDocs(docs.filter((d) => d.id !== id));
        toast.success("Dokumen berhasil dihapus");
      }
    } catch (error: any) {
      toast.error("Gagal menghapus dokumen");
    }
  };

  const daysToPangkat = myData ? daysUntil(nextPangkat(myData)) : 0;
  const daysToKgb = myData ? daysUntil(nextKgb(myData)) : 0;

  const isPegawai = user?.role === "pegawai";

  const COLORS = [
    "oklch(0.65 0.14 200)",
    "oklch(0.55 0.16 260)",
    "oklch(0.7 0.15 155)",
    "oklch(0.78 0.16 75)",
  ];

  const chartTrendData = useMemo(() => {
    if (!trends) return [];
    const months = Array.from(
      new Set([...trends.pangkat.map((i: any) => i.month), ...trends.kgb.map((i: any) => i.month)]),
    ).sort();

    return months.map((m) => ({
      bulan: m,
      pangkat: trends.pangkat.find((i: any) => i.month === m)?.count || 0,
      kgb: trends.kgb.find((i: any) => i.month === m)?.count || 0,
    }));
  }, [trends]);

  if (loading)
    return (
      <AppShell title="Dashboard">
        <div className="p-8 text-center">Memuat data...</div>
      </AppShell>
    );

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="rounded-2xl bg-gradient-hero p-6 lg:p-8 text-white shadow-elevated relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Halo, {user?.name.split(",")[0]} 👋
              </h2>
              <p className="mt-2 text-white/80 max-w-xl">
                {!isPegawai &&
                  user?.role === "admin" &&
                  "Anda memiliki beberapa tugas verifikasi dokumen yang menunggu hari ini."}
                {!isPegawai &&
                  user?.role === "pimpinan" &&
                  `${stats?.pendingApprovals || 0} pengajuan menunggu persetujuan Anda.`}
                {isPegawai &&
                  `Selamat datang di portal mandiri. Anda berada di Golongan ${myData?.golongan || "-"} sebagai ${myData?.jabatan || "-"}.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button
                asChild
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-glow"
              >
                <Link to={isPegawai ? "/kenaikan-pangkat" : "/reminder"}>
                  {isPegawai ? "Ajukan Dokumen" : "Lihat Reminder"}
                </Link>
              </Button>

              {isPegawai ? (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto bg-info/20 border-info/30 text-white hover:bg-info/30 backdrop-blur-sm"
                      >
                        <FileText className="size-4 mr-2" /> Dokumen Penting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-card w-[95vw] sm:w-full">
                      <DialogHeader>
                        <DialogTitle>Dokumen & Panduan Penting</DialogTitle>
                        <DialogDescription>
                          Akses cepat ke berkas panduan kenaikan pangkat dan aturan kepegawaian.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors group gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="size-5" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">
                                  {doc.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  {doc.type} • {doc.size}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 w-full sm:w-auto justify-center"
                                onClick={async () => {
                                  try {
                                    const response = await api.get(`/dokumen/download/${doc.id}`, {
                                      responseType: "blob",
                                    });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", `${doc.name}.${doc.type.toLowerCase()}`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                  } catch (error) {
                                    toast.error("Gagal mengunduh dokumen");
                                  }
                                }}
                              >
                                <Download className="size-4 mr-2 sm:mr-0" />
                                <span className="sm:hidden">Download</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {user?.role === "admin" && (
                    <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                        >
                          <Plus className="size-4 mr-2" /> Kelola Format Surat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card w-[95vw] sm:w-full">
                        <DialogHeader>
                          <DialogTitle>Manajemen Format Surat</DialogTitle>
                          <DialogDescription>Tambahkan atau hapus format surat.</DialogDescription>
                        </DialogHeader>

                        <form
                          onSubmit={handleAddDoc}
                          className="space-y-4 mt-4 p-4 border rounded-xl bg-muted/20"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nama Dokumen</Label>
                              <Input
                                placeholder="Contoh: Template SKP..."
                                value={newDoc.name}
                                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Pilih File (Max 2MB)</Label>
                              <Input
                                type="file"
                                className="cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.doc,.xlsx,.xls"
                              />
                              {newDoc.size && (
                                <p className="text-[10px] text-primary font-medium">
                                  Ukuran: {newDoc.size}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button type="submit" className="w-full">
                            Tambahkan Dokumen
                          </Button>
                        </form>

                        <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <span className="text-sm font-medium truncate pr-2">
                                {doc.name} ({doc.size})
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="shrink-0"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/laporan">Generate Laporan</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(isPegawai
            ? [
                {
                  label: "Golongan Saat Ini",
                  value: myData?.golongan || "-",
                  icon: UserIcon,
                  accent: "bg-primary/10 text-primary",
                },
                {
                  label: "Hari Menuju Pangkat",
                  value: Math.max(0, daysToPangkat).toString(),
                  icon: TrendingUp,
                  accent: "bg-info/10 text-info",
                },
                {
                  label: "Hari Menuju KGB",
                  value: Math.max(0, daysToKgb).toString(),
                  icon: Wallet,
                  accent: "bg-success/10 text-success",
                },
                {
                  label: "Status Pengajuan",
                  value: stats?.myApprovalsCount?.toString() || "0",
                  icon: FileCheck,
                  accent: "bg-warning/10 text-warning",
                },
              ]
            : [
                {
                  label: "Total Pegawai",
                  value: stats?.totalPegawai?.toString() || "0",
                  icon: Users,
                  accent: "bg-info/10 text-info",
                },
                {
                  label: "Akan Naik Pangkat",
                  value: stats?.upcomingPangkat?.toString() || "0",
                  icon: TrendingUp,
                  accent: "bg-primary/10 text-primary",
                },
                {
                  label: "Akan KGB",
                  value: stats?.upcomingKGB?.toString() || "0",
                  icon: Wallet,
                  accent: "bg-success/10 text-success",
                },
                {
                  label: "Pending Approval",
                  value: stats?.pendingApprovals?.toString() || "0",
                  icon: FileCheck,
                  accent: "bg-warning/10 text-warning",
                },
              ]
          ).map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-5">
                <div className={`size-10 rounded-xl flex items-center justify-center ${s.accent}`}>
                  <s.icon className="size-5" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        {!isPegawai && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Trend Kenaikan Pangkat & KGB</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bulan" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Area
                      name="Pangkat"
                      type="monotone"
                      dataKey="pangkat"
                      stroke="oklch(0.55 0.16 260)"
                      fill="oklch(0.55 0.16 260)"
                      fillOpacity={0.1}
                    />
                    <Area
                      name="KGB"
                      type="monotone"
                      dataKey="kgb"
                      stroke="oklch(0.7 0.15 155)"
                      fill="oklch(0.7 0.15 155)"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Distribusi Golongan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="golongan_kode"
                      innerRadius={60}
                      outerRadius={80}
                    >
                      {distribution.map((d, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
