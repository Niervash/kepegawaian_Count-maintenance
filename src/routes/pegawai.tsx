import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  type Pegawai,
  nextPangkat,
  nextKgb,
  lastPangkat,
  lastKgb,
  type User,
} from "@/lib/simpeg-data";
import { useAuth } from "@/lib/auth-context";
import api from "@/services/api";
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Award,
  Calendar,
  Wallet,
  UserPlus,
  Key,
  ShieldCheck as ShieldCheckIcon,
  Clock,
  Briefcase,
  Camera,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/pegawai")({ component: PegawaiPage });

function PegawaiPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master Data States
  const [masterGolongan, setMasterGolongan] = useState<any[]>([]);
  const [masterJabatan, setMasterJabatan] = useState<any[]>([]);

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [viewingPegawai, setViewingPegawai] = useState<Pegawai | null>(null);
  const [targetPegawai, setTargetPegawai] = useState<Pegawai | null>(null);

  const [filters, setFilters] = useState({
    golongan: "all",
    status: "all",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      const [pegawaiRes, golRes, jabRes] = await Promise.all([
        api.get("/pegawai"),
        api.get("/master/golongan"),
        api.get("/master/jabatan"),
      ]);

      if (pegawaiRes.data.success) setData(pegawaiRes.data.data);
      if (golRes.data.success) setMasterGolongan(golRes.data.data);
      if (jabRes.data.success) setMasterJabatan(golRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil data pegawai:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccountCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!targetPegawai) return;

    try {
      const response = await api.post(`/pegawai/${targetPegawai.id}/create-account`, {
        role: "pegawai",
        email: targetPegawai.email,
      });

      if (response.data.success) {
        toast.success(`Akun berhasil dibuat untuk ${targetPegawai.nama}`);
        setAccountOpen(false);
        fetchData(); // Refresh to show active status
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat akun");
    }
  };

  const openAccountModal = (p: Pegawai) => {
    setTargetPegawai(p);
    setAccountOpen(true);
  };

  const filtered = data.filter((p) => {
    const matchSearch = [p.nama, p.nip, p.jabatan].some((s) =>
      s?.toLowerCase().includes(q.toLowerCase()),
    );
    const matchGolongan = filters.golongan === "all" || p.golongan === filters.golongan;
    const matchStatus = filters.status === "all" || p.status === filters.status;
    return matchSearch && matchGolongan && matchStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const entryDate = f.get("tanggalMasuk") as string;
    const tmtP = (f.get("tmtPangkat") as string) || lastPangkat(entryDate);
    const tmtK = (f.get("tmtKgb") as string) || lastKgb(entryDate);

    const formData = new FormData();
    formData.append("nip", f.get("nip") as string);
    formData.append("nama", f.get("nama") as string);
    formData.append("jabatan_id", f.get("jabatan_id") as string);
    formData.append("golongan_id", f.get("golongan_id") as string);
    formData.append("email", f.get("email") as string);
    formData.append("phone", f.get("phone") as string);
    formData.append("tanggalMasuk", entryDate);
    formData.append("tmtPangkat", tmtP);
    formData.append("tmtKgb", tmtK);
    formData.append("status", "aktif");

    const avatarFile = fileInputRef.current?.files?.[0];
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/pegawai", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setData((d) => [response.data.data, ...d]);
        setAddOpen(false);
        setPreviewImage(null);
        toast.success("Pegawai berhasil ditambahkan");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambah pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPegawai) return;
    const f = new FormData(e.currentTarget);
    const entryDate = f.get("tanggalMasuk") as string;

    const formData = new FormData();
    formData.append("nip", f.get("nip") as string);
    formData.append("nama", f.get("nama") as string);
    formData.append("jabatan_id", f.get("jabatan_id") as string);
    formData.append("golongan_id", f.get("golongan_id") as string);
    formData.append("email", f.get("email") as string);
    formData.append("phone", f.get("phone") as string);
    formData.append("tanggalMasuk", entryDate);
    formData.append("tmtPangkat", (f.get("tmtPangkat") as string) || editingPegawai.tmtPangkat);
    formData.append("tmtKgb", (f.get("tmtKgb") as string) || editingPegawai.tmtKgb);

    const avatarFile = fileInputRef.current?.files?.[0];
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    setIsSubmitting(true);
    try {
      const response = await api.put(`/pegawai/${editingPegawai.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setData((d) => d.map((p) => (p.id === editingPegawai.id ? response.data.data : p)));
        setEditOpen(false);
        setEditingPegawai(null);
        setPreviewImage(null);
        toast.success("Data pegawai berhasil diperbarui");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (p: Pegawai) => {
    setEditingPegawai(p);
    setPreviewImage(p.avatar ? `http://localhost:5000${p.avatar}` : null);
    setEditOpen(true);
  };

  const openAddModal = () => {
    setPreviewImage(null);
    setAddOpen(true);
  };

  const openViewModal = (p: Pegawai) => {
    setViewingPegawai(p);
    setViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) {
      try {
        const response = await api.delete(`/pegawai/${id}`);
        if (response.data.success) {
          setData((d) => d.filter((x) => x.id !== id));
          toast.success("Pegawai dihapus dari sistem");
        }
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

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

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  if (loading)
    return (
      <AppShell title="Data Pegawai">
        <div className="p-8 text-center">Memuat data...</div>
      </AppShell>
    );

  return (
    <AppShell title="Data Pegawai">
      <div className="space-y-5">
        {/* Top Actions */}
        <Card className="shadow-card">
          <CardContent className="p-4 lg:p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama, NIP, jabatan..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Filter className="size-4 mr-2" /> Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] sm:w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold">Filter Data</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilters({ golongan: "all", status: "all" })}
                          className="h-7 text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Golongan
                        </Label>
                        <Select
                          value={filters.golongan}
                          onValueChange={(v) => setFilters({ ...filters, golongan: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Golongan</SelectItem>
                            {masterGolongan.map((g) => (
                              <SelectItem key={g.id} value={g.kode}>
                                {g.kode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {isAdmin && (
                  <Button
                    className="shadow-glow flex-1 sm:flex-none w-full sm:w-auto"
                    onClick={openAddModal}
                  >
                    <Plus className="size-4 mr-2" />{" "}
                    <span className="sm:inline">Tambah Pegawai</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List Table */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
            <table className="w-full text-sm min-w-[700px] lg:min-w-0">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Pegawai</th>
                  <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">NIP</th>
                  <th className="text-left px-5 py-3 font-semibold whitespace-nowrap hidden sm:table-cell">
                    Masa Kerja
                  </th>
                  <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Golongan</th>
                  <th className="text-right px-5 py-3 font-semibold whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold overflow-hidden">
                          {p.avatar ? (
                            <img
                              src={`http://localhost:5000${p.avatar}`}
                              alt={p.nama}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full bg-gradient-primary flex items-center justify-center text-white">
                              {p.nama.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-xs">{p.nama}</div>
                          <div className="text-[10px] text-muted-foreground">{p.jabatan}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.nip}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{getTenure(p.tanggalMasuk)}</span>
                        <span className="text-[9px] text-muted-foreground">
                          Sejak {p.tanggalMasuk ? new Date(p.tanggalMasuk).getFullYear() : "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {p.golongan}
                        </Badge>
                        {p.hasAccount && (
                          <Badge className="bg-success/10 text-success border-0 text-[8px] h-3 w-fit">
                            Akun Aktif
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openViewModal(p)}>
                          <Eye className="size-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            {!p.hasAccount && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:bg-primary/10"
                                title="Buat Akun"
                                onClick={() => openAccountModal(p)}
                              >
                                <UserPlus className="size-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openEditModal(p)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Modal */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="w-[90vw] sm:max-w-[450px] p-6 gap-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Profil Pegawai</DialogTitle>
            </DialogHeader>
            {viewingPegawai && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="size-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-elevated overflow-hidden border-4 border-background">
                    {viewingPegawai.avatar ? (
                      <img
                        src={`http://localhost:5000${viewingPegawai.avatar}`}
                        alt={viewingPegawai.nama}
                        className="size-full object-cover"
                      />
                    ) : (
                      viewingPegawai.nama.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{viewingPegawai.nama}</h3>
                    <p className="text-xs text-muted-foreground">{viewingPegawai.jabatan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">NIP</p>
                    <p className="text-sm font-mono">{viewingPegawai.nip}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Golongan</p>
                    <p className="text-sm font-medium">{viewingPegawai.golongan}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Telepon</p>
                    <p className="text-sm text-muted-foreground">{viewingPegawai.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                    <p className="text-sm text-muted-foreground break-all">{viewingPegawai.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Masa Kerja</p>
                    <p className="text-sm text-primary font-semibold">{getTenure(viewingPegawai.tanggalMasuk)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                    <Badge variant="outline" className="capitalize">{viewingPegawai.status}</Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Modal */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="w-[90vw] sm:max-w-[450px] p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Tambah Pegawai</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="size-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} className="size-full object-cover" />
                    ) : (
                      <Camera className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 size-8 rounded-full shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Input name="nama" placeholder="Nama Lengkap & Gelar" required />
                <Input name="nip" placeholder="NIP" required />
                <Select name="golongan_id" required>
                  <SelectTrigger><SelectValue placeholder="Pilih Golongan" /></SelectTrigger>
                  <SelectContent>
                    {masterGolongan.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.kode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="tanggalMasuk" type="date" required />
                <Select name="jabatan_id" required>
                  <SelectTrigger><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
                  <SelectContent>
                    {masterJabatan.map((j) => (
                      <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="phone" placeholder="No. Telepon" required />
                <Input name="email" type="email" placeholder="Email" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[90vw] sm:max-w-[450px] p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Data Pegawai</DialogTitle>
            </DialogHeader>
            {editingPegawai && (
              <form onSubmit={handleEdit} className="space-y-4 mt-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="size-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                      {previewImage ? (
                        <img src={previewImage} className="size-full object-cover" />
                      ) : (
                        <Camera className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 size-8 rounded-full shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Input name="nama" defaultValue={editingPegawai.nama} required />
                  <Input name="nip" defaultValue={editingPegawai.nip} required />
                  <Select name="golongan_id" defaultValue={masterGolongan.find(g => g.kode === editingPegawai.golongan)?.id?.toString()} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterGolongan.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>{g.kode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input name="tanggalMasuk" type="date" defaultValue={editingPegawai.tanggalMasuk?.split("T")[0]} required />
                  <Select name="jabatan_id" defaultValue={masterJabatan.find(j => j.nama === editingPegawai.jabatan)?.id?.toString()} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterJabatan.map((j) => (
                        <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input name="phone" defaultValue={editingPegawai.phone} required />
                  <Input name="email" type="email" defaultValue={editingPegawai.email} required />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
        {/* Account Modal */}
        <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md p-6 rounded-2xl">
            <DialogHeader>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <ShieldCheckIcon className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Buat Akun Pegawai</DialogTitle>
              <DialogDescription className="text-xs text-center">
                Buat akun akses sistem untuk <strong>{targetPegawai?.nama}</strong>. NIP akan
                digunakan sebagai username default.
              </DialogDescription>
            </DialogHeader>
            {targetPegawai && (
              <form onSubmit={handleAccountCreate} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>NIP / Username</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input value={targetPegawai.nip} disabled className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Password Default</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input value="password" disabled className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Buat Akun
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
