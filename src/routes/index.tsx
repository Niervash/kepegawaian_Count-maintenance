import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  Wallet,
  Bell,
  FileCheck,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  UserCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { nextPangkat, daysUntil, type Pegawai } from "@/lib/simpeg-data";
import { useMemo, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import api from "@/services/api";

const carouselImages = [
  "/carousel/SIKAPAS_01.png",
  "/carousel/SIKAPAS_02.png",
  "/carousel/SIKAPAS_03.png",
  "/carousel/SIKAPAS_04.png",
  "/carousel/SIKAPAS_05.png",
  "/carousel/SIKAPAS_06.png",
  "/carousel/SIKAPAS_07.png",
];

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const [allPegawai, setAllPegawai] = useState<Pegawai[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await api.get("/pegawai");
        if (response.data.success) setAllPegawai(response.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user]);

  const upcomingPangkat = useMemo(() => {
    if (!user) return [];

    return allPegawai
      .map((p) => ({
        id: p.id,
        nama: p.nama,
        nip: p.nip,
        tglNext: nextPangkat(p),
        sisaHari: daysUntil(nextPangkat(p)),
      }))
      .filter((p) => p.sisaHari > 0)
      .sort((a, b) => a.sisaHari - b.sisaHari)
      .slice(0, 5);
  }, [allPegawai, user]);

  const [carouselApi, setCarouselApi] = useState<any>();

  useEffect(() => {
    if (!carouselApi) return;
    const intervalId = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [carouselApi]);

  const features = [
    {
      icon: TrendingUp,
      title: "Kenaikan Pangkat Otomatis",
      desc: "Sistem menghitung jadwal naik pangkat setiap 4 tahun secara otomatis.",
    },
    {
      icon: Wallet,
      title: "KGB Otomatis",
      desc: "Kenaikan Gaji Berkala dijadwalkan otomatis tiap 2 tahun, lengkap dengan pengingat.",
    },
    {
      icon: Bell,
      title: "Reminder H-30/14/7",
      desc: "Notifikasi dashboard, email, dan WhatsApp sebelum deadline administrasi.",
    },
    {
      icon: FileCheck,
      title: "Approval Workflow",
      desc: "Alur approval dokumen yang transparan dari pegawai → admin → pimpinan.",
    },
    {
      icon: Calendar,
      title: "Kalender Monitoring",
      desc: "Visualisasi jadwal pangkat, KGB, dan deadline dokumen dalam satu kalender.",
    },
    {
      icon: ShieldCheck,
      title: "Riwayat & Audit",
      desc: "Tracking lengkap riwayat pangkat, KGB, dan dokumen tiap pegawai.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="size-10 shrink-0">
              <img
                src="/kementrian_imigrasi_sikapas.png"
                alt="SIKAPAS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold leading-tight">SIKAPAS</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sistem Kepegawaian
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#fitur" className="hover:text-foreground">
              Fitur
            </a>
            <a href="#workflow" className="hover:text-foreground">
              Workflow
            </a>
            <a href="#role" className="hover:text-foreground">
              Role
            </a>
          </nav>
          {user ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>
                Masuk Sistem <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden pt-16 lg:pt-24 pb-20 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.98]" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-10">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-8">
                <Sparkles className="size-3.5 text-yellow-400" /> Modern HRIS untuk Instansi
                Pemerintah
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                Otomatisasi Kepegawaian <br />{" "}
                <span className="opacity-60">tanpa terlewat sehari pun.</span>
              </h1>
              <p className="mt-8 text-xl text-white/80 leading-relaxed max-w-2xl">
                SIKAPAS memantau jadwal kenaikan pangkat tiap 4 tahun, KGB tiap 2 tahun, dan
                mengingatkan sebelum deadline.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to={user ? "/dashboard" : "/login"}>
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-base shadow-elevated"
                  >
                    {user ? "Masuk Dashboard" : "Mulai Sekarang"} <ArrowRight className="size-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative w-full lg:w-1/2 group">
              <div className="relative rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-2xl p-3 shadow-2xl overflow-hidden">
                <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="w-full">
                  <CarouselContent>
                    {carouselImages.map((src, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-background/95 p-4 flex items-center justify-center">
                          <img
                            src={src}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {user && (
        <section className="py-16 border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-10">Monitoring Transparan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {upcomingPangkat.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {p.nama.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{p.nama}</div>
                      <div className="text-[10px] text-muted-foreground">{p.nip}</div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold ${p.sisaHari <= 30 ? "text-destructive" : "text-primary"}`}
                  >
                    {p.sisaHari} Hari
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="fitur" className="py-24 lg:py-32">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-3xl bg-card border border-border shadow-card"
              >
                <div className="size-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
                  <f.icon className="size-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SIKAPAS.
      </footer>
    </div>
  );
}
