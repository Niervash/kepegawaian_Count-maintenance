import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
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

export const Route = createFileRoute("/master/unit-kerja")({ component: MasterUnitKerja });

interface UnitKerja {
  id: number;
  nama: string;
  kode: string;
  lokasi: string;
}

const initialUnits: UnitKerja[] = [
  { id: 1, nama: "Sekretariat Utama", kode: "SEC-01", lokasi: "Gedung A, Lt. 1" },
  { id: 2, nama: "Biro Keuangan", kode: "FIN-02", lokasi: "Gedung A, Lt. 2" },
  { id: 3, nama: "Biro Kepegawaian", kode: "HRD-03", lokasi: "Gedung B, Lt. 1" },
  { id: 4, nama: "Pusat Data dan Informasi", kode: "IT-04", lokasi: "Gedung C, Lt. 3" },
  { id: 5, nama: "Inspektorat", kode: "INS-05", lokasi: "Gedung D, Lt. 1" },
];

function MasterUnitKerja() {
  const [list, setList] = useState<UnitKerja[]>(initialUnits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitKerja | null>(null);
  const [formData, setFormData] = useState<Omit<UnitKerja, "id">>({
    nama: "",
    kode: "",
    lokasi: "",
  });

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

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus unit kerja ini?")) {
      setList(list.filter((i) => i.id !== id));
      toast.success("Unit kerja berhasil dihapus");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setList(list.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i)));
      toast.success("Unit kerja berhasil diperbarui");
    } else {
      const newId = Math.max(...list.map((i) => i.id), 0) + 1;
      setList([...list, { id: newId, ...formData }]);
      toast.success("Unit kerja berhasil ditambah");
    }
    setIsDialogOpen(false);
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
        </div>
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
