import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Approval } from "@/lib/simpeg-data";
import { useAuth } from "@/lib/auth-context";
import { FileText, Check, X, Upload, Eye, Download, ExternalLink, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/services/api";

export const Route = createFileRoute("/approval")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [list, setList] = useState<Approval[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  const fetchApprovals = async () => {
    try {
      const response = await api.get("/approvals");
      if (response.data.success) {
        setList(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filtered = list.filter((a) => a.status === tab);
  const isPimpinan = user?.role === "pimpinan" || user?.role === "admin";
  const isPegawai = user?.role === "pegawai";

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await api.put(`/approvals/${id}`, { status });
      if (response.data.success) {
        toast.success(status === "approved" ? "Disetujui" : "Ditolak");
        fetchApprovals(); // Refresh list
        if (selectedApproval?.id === id) {
          setSelectedApproval(null);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses pengajuan");
    }
  };

  const handleDownload = () => {
    if (!selectedApproval) return;
    const url = `http://localhost:5000${(selectedApproval as any).dokumen_url}`;
    window.open(url, '_blank');
  };

  const toggleFullscreen = () => {
    if (!previewRef.current) return;

    if (!document.fullscreenElement) {
      previewRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          toast.error(`Gagal: ${err.message}`);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  if (loading) return <AppShell title="Approval Dokumen"><div className="p-8 text-center">Memuat data...</div></AppShell>;

  return (
    <AppShell title="Approval Dokumen">
      <div className="space-y-5">
        {isPegawai && (
          <Card className="shadow-card border-dashed border-2">
            <CardContent className="p-8 text-center">
              <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold">Upload Dokumen Pengajuan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pilih berkas pendukung (PDF/Gambar) untuk pengajuan
              </p>
              <Input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formData = new FormData();
                  formData.append('dokumen', file);
                  formData.append('type', 'Lainnya'); // Default type
                  formData.append('pegawai_id', (user as any).id);

                  try {
                    const res = await api.post('/approvals', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (res.data.success) {
                      toast.success("Dokumen berhasil diunggah");
                      fetchApprovals();
                    }
                  } catch (err) {
                    toast.error("Gagal mengunggah dokumen");
                  }
                }}
              />
              <Button className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>Pilih File</Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "outline"}
              onClick={() => setTab(t)}
              className="capitalize"
            >
              {t} ({list.filter((a) => a.status === t).length})
            </Button>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Daftar Pengajuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Tidak ada data.</p>
            )}
            {filtered.map((a: any) => (
              <div key={a.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="size-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{a.pegawai?.nama || 'Pegawai'}</span>
                      <Badge variant="outline">{a.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      📄 {a.dokumen_url?.split('/').pop()} • Diajukan{" "}
                      {new Date(a.submitted_at).toLocaleDateString("id-ID")}
                    </div>
                    {a.catatan && (
                      <div className="text-xs text-destructive mt-1.5">Catatan: {a.catatan}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedApproval(a)}>
                      <Eye className="size-4" />
                      Preview
                    </Button>
                    {isPimpinan && a.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => updateStatus(a.id, "approved")}
                        >
                          <Check className="size-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(a.id, "rejected")}
                        >
                          <X className="size-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedApproval}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApproval(null);
            if (document.fullscreenElement) document.exitFullscreen();
          }
        }}
      >
        <DialogContent
          className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden"
        >
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>{selectedApproval?.type}</DialogTitle>
                <DialogDescription>
                  {(selectedApproval as any)?.pegawai?.nama} • {(selectedApproval as any)?.dokumen_url?.split('/').pop()}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="size-4 mr-2" /> Download
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize2 className="size-4 mr-2" />
                  ) : (
                    <ExternalLink className="size-4 mr-2" />
                  )}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div
            ref={previewRef}
            className="flex-1 bg-muted/50 p-8 flex items-center justify-center overflow-auto scrollbar-hide"
          >
             <div className="w-full max-w-2xl bg-white shadow-lg p-12 min-h-[800px] flex flex-col items-center justify-center text-center">
                <FileText className="size-24 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">Pratinjau Dokumen</h3>
                <p className="text-muted-foreground mt-2">File: {(selectedApproval as any)?.dokumen_url?.split('/').pop()}</p>
                <Button className="mt-6" variant="outline" onClick={handleDownload}>Buka Dokumen di Tab Baru</Button>
             </div>
          </div>

          <DialogFooter className="p-4 border-t bg-background">
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                Tutup
              </Button>
              {isPimpinan && selectedApproval?.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selectedApproval!.id, "rejected")}
                  >
                    <X className="size-4 mr-2" /> Tolak
                  </Button>
                  <Button
                    className="bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => updateStatus(selectedApproval!.id, "approved")}
                  >
                    <Check className="size-4 mr-2" /> Setujui Dokumen
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
