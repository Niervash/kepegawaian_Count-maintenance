import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/master/unit-kerja")({ component: MasterUnitKerja });

interface UnitKerja {
  id: number;
  nama: string;
  kode: string;
  lokasi: string;
}

function MasterUnitKerja() {
  const [list, setList] = useState<UnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitKerja | null>(null);
  const [formData, setFormData] = useState<Omit<UnitKerja, "id">>({
    nama: "",
    kode: "",
    lokasi: "",
  });

  const fetchUnitKerja = async () => {
    try {
      setLoading(true);
      const response = await api.get("/master/unit-kerja");
      if (response.data.success) {
        setList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching unit kerja:", error);
      toast.error("Gagal mengambil data unit kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitKerja();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ nama: "", kode: "", lokasi: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: UnitKerja) => {
    setEditingItem(item);
    setFormData({ nama: item.nama, kode: item.kode, lokasi: item.lokasi });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus unit kerja ini?")) {
      try {
        const response = await api.delete(`/master/unit-kerja/${id}`);
        if (response.data.success) {
          setList(list.filter((i) => i.id !== id));
          toast.success("Unit kerja berhasil dihapus");
        }
      } catch (error: any) {
        console.error("Error deleting unit kerja:", error);
        toast.error(error.response?.data?.message || "Gagal menghapus unit kerja");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const response = await api.put(`/master/unit-kerja/${editingItem.id}`, formData);
        if (response.data.success) {
          setList(list.map((i) => (i.id === editingItem.id ? response.data.data : i)));
          toast.success("Unit kerja berhasil diperbarui");
        }
      } else {
        const response = await api.post("/master/unit-kerja", formData);
        if (response.data.success) {
          setList([...list, response.data.data]);
          toast.success("Unit kerja berhasil ditambah");
        }
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving unit kerja:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan unit kerja");
    }
  };

  return (
    <AppShell title="Master Unit Kerja">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Daftar Unit Kerja</h2>
            <p className="text-sm text-muted-foreground">
              Kelola struktur organisasi dan unit kerja.
            </p>
          </div>
          <Button className="shadow-glow" onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" /> Tambah Unit Kerja
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p>Memuat data...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((u) => (
              <Card key={u.id} className="shadow-card group hover:shadow-elevated transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <MapPin className="size-5" />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-info hover:text-info hover:bg-info/10"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-bold text-base">{u.nama}</div>
                  <div className="text-xs text-primary font-semibold mt-1 uppercase tracking-wider">
                    {u.kode}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {u.lokasi}
                  </div>
                </CardContent>
              </Card>
            ))}
            {list.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Tidak ada data unit kerja ditemukan.
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Unit Kerja" : "Tambah Unit Kerja"}</DialogTitle>
            <DialogDescription>Masukkan detail data unit kerja di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Unit Kerja</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Biro Kepegawaian"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Unit</Label>
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                placeholder="Contoh: HRD-01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi / Ruangan</Label>
              <Input
                id="lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Gedung A, Lt. 2"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
