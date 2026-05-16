import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Approval, type ImportantDoc } from "@/lib/simpeg-data";
import { useAuth } from "@/lib/auth-context";
import {
  FileText,
  Check,
  X,
  Upload,
  Eye,
  Download,
  ExternalLink,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api, { BASE_URL } from "@/services/api";

export const Route = createFileRoute("/approval")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [list, setList] = useState<Approval[]>([]);
  const [templates, setTemplates] = useState<ImportantDoc[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [approvalRes, templateRes] = await Promise.all([
        api.get("/approvals"),
        api.get("/dokumen"), // Mengambil dari menu Kelola Berkas di Dashboard
      ]);
      if (approvalRes.data.success) setList(approvalRes.data.data);
      if (templateRes.data.success) setTemplates(templateRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = list.filter((a) => a.status === tab);
  const isPimpinan = user?.role === "pimpinan" || user?.role === "admin";
  const isPegawai = user?.role === "pegawai";

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await api.put(`/approvals/${id}`, { status });
      if (response.data.success) {
        toast.success(status === "approved" ? "Disetujui" : "Ditolak");
        fetchData();
        if (selectedApproval?.id === id) setSelectedApproval(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses pengajuan");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, template: ImportantDoc) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dokumen", file);
    formData.append("type", template.name);
    formData.append("pegawai_id", (user as any).id);

    setIsUploading(true);
    try {
      const res = await api.post("/approvals", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success(`Berhasil mengunggah ${template.name}`);
        fetchData();
      }
    } catch (err) {
      toast.error("Gagal mengunggah dokumen");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDownload = () => {
    if (!selectedApproval) return;
    const url = `${BASE_URL}${(selectedApproval as any).dokumen_url}`;
    window.open(url, "_blank");
  };

  const toggleFullscreen = () => {
    if (!previewRef.current) return;
    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading)
    return (
      <AppShell title="Approval Dokumen">
        <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
      </AppShell>
    );

  return (
    <AppShell title="Approval Dokumen">
      <div className="space-y-6">
        {isPegawai && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Upload className="size-5" />
              <h3 className="font-bold">Ajukan Dokumen Berdasarkan Format Lembaga</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <Card key={t.id} className="shadow-sm border-dashed hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileText className="size-5" />
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-primary"
                        onClick={() => window.open(`${BASE_URL}${t.file_url}`, "_blank")}
                        title="Download Format Template"
                      >
                        <Download className="size-4" />
                      </Button>
                    </div>
                    <h4 className="font-bold text-xs mb-1 truncate">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground mb-4">Download format lalu upload file yang sudah diisi.</p>
                    
                    <Input
                      type="file"
                      id={`upload-${t.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, t)}
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full h-8 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                      onClick={() => document.getElementById(`upload-${t.id}`)?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Mengunggah..." : "Pilih & Kirim Berkas"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {templates.length === 0 && (
                <div className="col-span-full py-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground italic">Belum ada format berkas yang tersedia di Dashboard.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "outline"}
              onClick={() => setTab(t)}
              className="capitalize whitespace-nowrap"
              size="sm"
            >
              {t} ({list.filter((a) => a.status === t).length})
            </Button>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">Daftar Pengajuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="size-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Tidak ada data {tab}.</p>
              </div>
            )}
            {filtered.map((a: any) => (
              <div key={a.id} className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="size-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">
                        {a.pegawai?.nama || "Pegawai"}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-white">
                        {a.type}
                      </Badge>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                      📄 {a.dokumen_url?.split("/").pop()}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      Diajukan {new Date(a.submitted_at).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApproval(a)}
                      className="flex-1 sm:w-full h-8 text-[11px]"
                    >
                      <Eye className="size-3 mr-1.5" />
                      Preview
                    </Button>
                    {isPimpinan && a.status === "pending" && (
                      <div className="flex flex-1 sm:flex-col gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-success hover:bg-success/90 text-success-foreground h-8 text-[11px]"
                          onClick={() => updateStatus(a.id, "approved")}
                        >
                          <Check className="size-3 mr-1.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-8 text-[11px]"
                          onClick={() => updateStatus(a.id, "rejected")}
                        >
                          <X className="size-3 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedApproval} onOpenChange={(open) => !open && setSelectedApproval(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
              <div className="min-w-0">
                <DialogTitle className="truncate">{selectedApproval?.type}</DialogTitle>
                <DialogDescription className="truncate">
                  {(selectedApproval as any)?.pegawai?.nama}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 px-2">
                  <Download className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 px-2">
                  {isFullscreen ? <Minimize2 className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div ref={previewRef} className="flex-1 bg-muted/50 p-4 sm:p-8 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-2xl bg-white shadow-lg p-6 sm:p-12 min-h-[400px] sm:min-h-[800px] flex flex-col items-center justify-center text-center">
              <FileText className="size-16 sm:size-24 text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-bold">Pratinjau Dokumen</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 break-all">
                File: {(selectedApproval as any)?.dokumen_url?.split("/").pop()}
              </p>
              <Button className="mt-6" variant="outline" onClick={handleDownload} size="sm">
                Buka Dokumen di Tab Baru
              </Button>
            </div>
          </div>

          <DialogFooter className="p-3 sm:p-4 border-t bg-background">
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setSelectedApproval(null)} className="w-full sm:w-auto h-9 text-xs">
                Tutup
              </Button>
              {isPimpinan && selectedApproval?.status === "pending" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="destructive" onClick={() => updateStatus(selectedApproval!.id, "rejected")} className="flex-1 sm:w-auto h-9 text-xs">
                    <X className="size-3.5 mr-1.5" /> Tolak
                  </Button>
                  <Button className="flex-1 sm:w-auto bg-success hover:bg-success/90 text-success-foreground h-9 text-xs" onClick={() => updateStatus(selectedApproval!.id, "approved")}>
                    <Check className="size-3.5 mr-1.5" /> Setujui
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
