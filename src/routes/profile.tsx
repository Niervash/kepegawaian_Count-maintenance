import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Key,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";
import api, { BASE_URL } from "@/services/api";

export const Route = createFileRoute("/profile")({ component: Page });

function Page() {
  const { user, updateUser } = useAuth();
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar! Maksimal 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("name", user.name);
    formData.append("email", user.email);

    setUploading(true);
    try {
      const response = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        updateUser(response.data.data);
        toast.success("Foto profil berhasil diperbarui");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put("/auth/update-password", {
        oldPassword: passData.old,
        newPassword: passData.new,
      });

      if (response.data.success) {
        toast.success("Password berhasil diperbarui");
        setPassData({ old: "", new: "", confirm: "" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui password");
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = user.avatar
    ? `${BASE_URL}${user.avatar}`
    : null;

  return (
    <AppShell title="Profile">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="shadow-card lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative mx-auto size-32">
              <div className="size-full rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-elevated">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="size-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 size-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-muted transition-colors border-2 border-primary/20"
                title="Ganti Foto"
              >
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Camera className="size-5" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>

            <h2 className="mt-6 font-bold text-xl">{user.name}</h2>
            <Badge className="mt-2 bg-primary/10 text-primary border-0 capitalize px-3 py-1">
              {user.role}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">{user.jabatan}</p>

            <div className="mt-8 pt-6 border-t text-left space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
                <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <UserIcon className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">NIP</div>
                  <div className="font-medium text-foreground">{user.nip}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
                <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Mail className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Email</div>
                  <div className="font-medium text-foreground">{user.email}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input defaultValue={user.name} readOnly className="bg-muted/30" />
            </div>
            <div>
              <Label>NIP</Label>
              <Input defaultValue={user.nip} readOnly className="bg-muted/30" />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input defaultValue={user.email} readOnly className="bg-muted/30" />
            </div>
            <div className="sm:col-span-2">
              <Label>Jabatan</Label>
              <Input defaultValue={user.jabatan} readOnly className="bg-muted/30" />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground italic">
                * Untuk mengubah informasi profil, silakan hubungi Admin Kepegawaian.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-start-2 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <CardTitle className="text-base">Keamanan & Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      type={showPass.old ? "text" : "password"}
                      placeholder="••••••••"
                      value={passData.old}
                      onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, old: !showPass.old })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass.old ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Password Baru</Label>
                  <div className="relative">
                    <Input
                      type={showPass.new ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={passData.new}
                      onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass.new ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Input
                      type={showPass.confirm ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={passData.confirm}
                      onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass.confirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" className="shadow-glow" disabled={loading}>
                {loading ? "Memperbarui..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
