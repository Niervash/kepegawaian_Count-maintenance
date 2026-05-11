import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { toast } from "sonner";
import { getStoredUsers, type Role } from "@/lib/simpeg-data";
import api from "@/services/api";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        nip: formData.username,
        password: formData.password
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        login(userData, token);
        toast.success(`Selamat datang, ${userData.name}`);
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login gagal. Periksa kembali NIP dan Password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-gradient-hero relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <Link
          to="/"
          className="relative flex items-center gap-2.5 hover:opacity-90 transition-opacity w-fit"
        >
          <div className="size-10 shrink-0">
            <img 
              src="/kementrian_imigrasi_sikapas.png" 
              alt="SIKAPAS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-white">SIKAPAS</div>
            <div className="text-[10px] uppercase tracking-wider text-white/70">
              Kepegawaian Modern
            </div>
          </div>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs mb-6">
            <ShieldCheck className="size-3.5" /> Sistem Terpusat & Terenkripsi
          </div>
          <h1 className="text-5xl font-bold leading-tight">
            Kelola Karir ASN <br /> Dengan Lebih Pintar.
          </h1>
          <p className="mt-6 text-white/75 text-lg max-w-md leading-relaxed">
            Akses dashboard monitoring kenaikan pangkat, KGB, dan layanan kepegawaian mandiri dalam
            satu pintu.
          </p>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm opacity-60">Digital Workflow</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <div className="text-3xl font-bold">Real-time</div>
              <div className="text-sm opacity-60">Notifications</div>
            </div>
          </div>
        </div>

        <div className="relative text-xs opacity-60 flex justify-between items-center">
          <span>© {new Date().getFullYear()} SIKAPAS Enterprise</span>
          <div className="flex gap-4">
            <span>Bantuan</span>
            <span>Panduan</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2.5 mb-10 hover:opacity-90 transition-opacity w-fit"
          >
            <div className="size-11 shrink-0">
              <img 
                src="/kementrian_imigrasi_sikapas.png" 
                alt="SIKAPAS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-xl">SIKAPAS</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sistem Kepegawaian
              </div>
            </div>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Login</h2>
            <p className="mt-2 text-muted-foreground">
              Masukkan NIP atau Username Anda untuk mengakses sistem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                NIP / Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Contoh: 19880620..."
                  className="pl-10 h-11"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-xs text-primary hover:underline font-medium">
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Masuk Ke Sistem <ArrowRight className="size-4" />
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
