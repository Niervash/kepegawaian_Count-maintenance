import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Pegawai, type Approval } from "@/lib/simpeg-data";
import { Download, FileText, Printer, Filter, PieChart as PieChartIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";
import {
  generatePangkatPDF,
  generateKgbPDF,
  generateStatistikPDF,
  generateYearlyAnalysisPDF,
  exportToExcel,
} from "@/lib/report-utils";

export const Route = createFileRoute("/laporan")({ component: Page });

function Page() {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("statistik");
  const [formatType, setFormatType] = useState("pdf");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([api.get("/pegawai"), api.get("/approvals")]);
        if (pRes.data.success) setPegawai(pRes.data.data);
        if (aRes.data.success) setApprovals(aRes.data.data);
      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
        toast.error("Gagal mengambil data untuk laporan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = (overrideFormat?: string) => {
    const finalFormat = overrideFormat || formatType;

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          try {
            if (finalFormat === "pdf") {
              switch (reportType) {
                case "statistik":
                  generateStatistikPDF(pegawai);
                  break;
                case "pangkat":
                  generatePangkatPDF(pegawai);
                  break;
                case "kgb":
                  generateKgbPDF(pegawai);
                  break;
                case "approval":
                  generateYearlyAnalysisPDF(approvals);
                  break;
                default:
                  generateStatistikPDF(pegawai);
              }
            } else {
              // Excel export - simplified for now as a general export
              exportToExcel(pegawai);
            }
            resolve(true);
          } catch (err) {
            console.error(err);
            throw err;
          }
        }, 1000);
      }),
      {
        loading: "Sedang men-generate laporan...",
        success: "Laporan berhasil diunduh",
        error: "Gagal men-generate laporan",
      },
    );
  };

  if (loading)
    return (
      <AppShell title="Laporan & Rekapitulasi">
        <div className="p-8 text-center">Memuat data...</div>
      </AppShell>
    );

  return (
    <AppShell title="Laporan & Rekapitulasi">
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-primary">Konfigurasi Laporan</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                <Printer className="size-4 mr-2" /> Cetak PDF
              </Button>
              <Button size="sm" onClick={() => handleExport("xlsx")} className="shadow-glow">
                <Download className="size-4 mr-2" /> Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Jenis Laporan
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statistik">Statistik Pegawai</SelectItem>
                  <SelectItem value="pangkat">Rekap Kenaikan Pangkat</SelectItem>
                  <SelectItem value="kgb">Rekap KGB</SelectItem>
                  <SelectItem value="approval">Rekap Approval Dokumen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Periode
              </label>
              <Select defaultValue="2026">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026 (Tahun Berjalan)</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Format Default
              </label>
              <Select value={formatType} onValueChange={setFormatType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Ringkasan Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm font-medium">Total Pegawai</span>
                <Badge variant="secondary" className="text-lg">
                  {pegawai.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm font-medium">Pengajuan Selesai</span>
                <Badge variant="secondary" className="text-lg bg-success/10 text-success">
                  {approvals.filter((a) => a.status === "approved").length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm font-medium">Pengajuan Ditolak</span>
                <Badge variant="secondary" className="text-lg bg-destructive/10 text-destructive">
                  {approvals.filter((a) => a.status === "rejected").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Aktivitas Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {approvals.slice(0, 4).map((a: Approval, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">
                        {a.pegawai?.nama || a.pegawaiNama}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {a.type} • {a.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
