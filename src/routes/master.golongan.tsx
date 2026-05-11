import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Plus, Edit2, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/master/golongan")({ component: MasterGolongan });

interface Golongan {
  id: number;
  kode: string;
  nama: string;
  ruang: string;
}

const initialGolongan: Golongan[] = [
  { id: 1, kode: "IV/e", nama: "Pembina Utama", ruang: "e" },
  { id: 2, kode: "IV/d", nama: "Pembina Utama Madya", ruang: "d" },
  { id: 3, kode: "IV/c", nama: "Pembina Utama Muda", ruang: "c" },
  { id: 4, kode: "IV/b", nama: "Pembina Tingkat I", ruang: "b" },
  { id: 5, kode: "IV/a", nama: "Pembina", ruang: "a" },
  { id: 6, kode: "III/d", nama: "Penata Tingkat I", ruang: "d" },
  { id: 7, kode: "III/c", nama: "Penata", ruang: "c" },
];

function MasterGolongan() {
  const [list, setList] = useState<Golongan[]>(initialGolongan);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Golongan | null>(null);
  const [formData, setFormData] = useState<Omit<Golongan, "id">>({ kode: "", nama: "", ruang: "" });

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

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setList(list.filter((i) => i.id !== id));
      toast.success("Data berhasil dihapus");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setList(list.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i)));
      toast.success("Data berhasil diperbarui");
    } else {
      const newId = Math.max(...list.map((i) => i.id), 0) + 1;
      setList([...list, { id: newId, ...formData }]);
      toast.success("Data berhasil ditambah");
    }
    setIsDialogOpen(false);
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
              </TableBody>
            </Table>
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
