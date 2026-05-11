import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
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

export const Route = createFileRoute("/master/golongan")({ component: MasterGolongan });

interface Golongan {
  id: number;
  kode: string;
  nama: string;
  ruang: string;
}

function MasterGolongan() {
  const [list, setList] = useState<Golongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Golongan | null>(null);
  const [formData, setFormData] = useState<Omit<Golongan, "id">>({ kode: "", nama: "", ruang: "" });

  const fetchGolongan = async () => {
    try {
      setLoading(true);
      const response = await api.get("/master/golongan");
      if (response.data.success) {
        setList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching golongan:", error);
      toast.error("Gagal mengambil data golongan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGolongan();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ kode: "", nama: "", ruang: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Golongan) => {
    setEditingItem(item);
    setFormData({ kode: item.kode, nama: item.nama, ruang: item.ruang });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await api.delete(`/master/golongan/${id}`);
        if (response.data.success) {
          setList(list.filter((i) => i.id !== id));
          toast.success("Data berhasil dihapus");
        }
      } catch (error: any) {
        console.error("Error deleting golongan:", error);
        toast.error(error.response?.data?.message || "Gagal menghapus data");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const response = await api.put(`/master/golongan/${editingItem.id}`, formData);
        if (response.data.success) {
          setList(list.map((i) => (i.id === editingItem.id ? response.data.data : i)));
          toast.success("Data berhasil diperbarui");
        }
      } else {
        const response = await api.post("/master/golongan", formData);
        if (response.data.success) {
          setList([...list, response.data.data]);
          toast.success("Data berhasil ditambah");
        }
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving golongan:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    }
  };

  return (
    <AppShell title="Master Golongan">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Daftar Golongan</h2>
            <p className="text-sm text-muted-foreground">Kelola data pangkat dan golongan ASN.</p>
          </div>
          <Button className="shadow-glow" onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" /> Tambah Golongan
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Memuat data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Kode</TableHead>
                    <TableHead>Nama Pangkat</TableHead>
                    <TableHead>Ruang</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-bold">{g.kode}</TableCell>
                      <TableCell>{g.nama}</TableCell>
                      <TableCell className="uppercase">{g.ruang}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-info hover:text-info hover:bg-info/10"
                            onClick={() => handleOpenEdit(g)}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(g.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Tidak ada data ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Golongan" : "Tambah Golongan"}</DialogTitle>
            <DialogDescription>Masukkan detail data golongan di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Golongan</Label>
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                placeholder="Contoh: IV/a"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Pangkat</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Pembina"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruang">Ruang</Label>
              <Input
                id="ruang"
                value={formData.ruang}
                onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                placeholder="Contoh: a"
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
