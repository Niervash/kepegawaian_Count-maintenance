import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/master/jabatan")({ component: MasterJabatan });

interface Jabatan {
  id: number;
  nama: string;
  tipe: string;
  eselon: string;
}

const initialJabatan: Jabatan[] = [
  { id: 1, nama: "Kepala Bagian Umum", tipe: "Struktural", eselon: "II.b" },
  { id: 2, nama: "Analis Kepegawaian Ahli Muda", tipe: "Fungsional", eselon: "-" },
  { id: 3, nama: "Pranata Komputer Ahli Pertama", tipe: "Fungsional", eselon: "-" },
  { id: 4, nama: "Bendahara Pengeluaran", tipe: "Pelaksana", eselon: "-" },
  { id: 5, nama: "Sekretaris Dinas", tipe: "Struktural", eselon: "II.a" },
];

function MasterJabatan() {
  const [list, setList] = useState<Jabatan[]>(initialJabatan);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jabatan | null>(null);
  const [formData, setFormData] = useState<Omit<Jabatan, "id">>({
    nama: "",
    tipe: "Fungsional",
    eselon: "-",
  });

  const filtered = list.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.tipe.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ nama: "", tipe: "Fungsional", eselon: "-" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Jabatan) => {
    setEditingItem(item);
    setFormData({ nama: item.nama, tipe: item.tipe, eselon: item.eselon });
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
    <AppShell title="Master Jabatan">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Daftar Jabatan</h2>
            <p className="text-sm text-muted-foreground">
              Kelola data jabatan struktural dan fungsional.
            </p>
          </div>
          <Button className="shadow-glow" onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" /> Tambah Jabatan
          </Button>
        </div>

        <Card className="shadow-card">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari jabatan..."
                className="pl-9 bg-muted/50 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jabatan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Eselon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{j.nama}</TableCell>
                    <TableCell>{j.tipe}</TableCell>
                    <TableCell>{j.eselon}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-info hover:text-info hover:bg-info/10"
                          onClick={() => handleOpenEdit(j)}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(j.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Jabatan" : "Tambah Jabatan"}</DialogTitle>
            <DialogDescription>Masukkan detail data jabatan di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Jabatan</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Analis Kepegawaian"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipe">Tipe Jabatan</Label>
                <Select
                  value={formData.tipe}
                  onValueChange={(val) => setFormData({ ...formData, tipe: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Struktural">Struktural</SelectItem>
                    <SelectItem value="Fungsional">Fungsional</SelectItem>
                    <SelectItem value="Pelaksana">Pelaksana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eselon">Eselon</Label>
                <Input
                  id="eselon"
                  value={formData.eselon}
                  onChange={(e) => setFormData({ ...formData, eselon: e.target.value })}
                  placeholder="Contoh: II.a atau -"
                  required
                />
              </div>
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
