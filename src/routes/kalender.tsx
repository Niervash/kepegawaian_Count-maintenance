import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Pegawai, nextPangkat, nextKgb } from "@/lib/simpeg-data";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User as UserIcon,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";

export const Route = createFileRoute("/kalender")({ component: Page });

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function Page() {
  const [data, setData] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/pegawai");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data kalender:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const events = useMemo(() => {
    const items: { date: string; type: "pangkat" | "kgb"; p: Pegawai }[] = [];
    data.forEach((p) => {
      items.push({ date: nextPangkat(p), type: "pangkat", p });
      items.push({ date: nextKgb(p), type: "kgb", p });
    });
    return items;
  }, [data]);

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [events, currentDate]);

  const handleMonthChange = (monthIdx: string) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(monthIdx), 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentDate.getMonth(), 1));
  };

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const calendarDays = useMemo(() => {
    const total = daysInMonth(currentDate);
    const first = firstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [currentDate]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }, []);

  if (loading)
    return (
      <AppShell title="Kalender Monitoring">
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Memuat data kalender...
        </div>
      </AppShell>
    );

  return (
    <AppShell title="Kalender Monitoring">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-5">
        {/* Navigation Controls */}
        <Card className="lg:col-span-3 shadow-card border-none bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 pb-0">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Jadwal Monitoring</CardTitle>
                <p className="text-xs text-muted-foreground">Pangkat & KGB Terjadwal</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-muted/50 p-1 rounded-lg border w-full sm:w-auto">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  <Select
                    value={currentDate.getMonth().toString()}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[110px] text-xs font-bold focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentDate.getFullYear().toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[80px] text-xs font-bold focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-b border-border/50 pb-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Grid Days */}
            <div className="grid grid-cols-7 gap-px bg-border/40 mt-3 rounded-xl overflow-hidden border border-border/40">
              {calendarDays.map((day, i) => {
                const dayEvents = day
                  ? monthEvents.filter((e) => new Date(e.date).getDate() === day)
                  : [];
                const isToday =
                  day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[70px] sm:min-h-[110px] bg-card p-1.5 sm:p-2 transition-colors hover:bg-muted/30",
                      !day && "bg-muted/10",
                    )}
                  >
                    {day && (
                      <>
                        <div
                          className={cn(
                            "text-[10px] sm:text-xs font-bold size-6 flex items-center justify-center rounded-full mb-1",
                            isToday
                              ? "bg-primary text-primary-foreground shadow-glow"
                              : "text-muted-foreground",
                          )}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map((e, ei) => (
                            <div
                              key={ei}
                              className={cn(
                                "text-[8px] sm:text-[9px] p-1 rounded-md border-l-2 truncate shadow-sm font-medium",
                                e.type === "pangkat"
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-success/10 border-success text-success",
                              )}
                              title={`${e.p.nama} (${e.type})`}
                            >
                              <span className="hidden sm:inline">{e.p.nama.split(" ")[0]} </span>
                              <span className="uppercase">({e.type === "pangkat" ? "P" : "K"})</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Kenaikan Pangkat
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  KGB (Kenaikan Gaji Berkala)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Monthly Agenda */}
        <div className="space-y-5">
          <Card className="shadow-card border-none overflow-hidden">
            <CardHeader className="bg-primary/5 p-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Filter className="size-3.5" /> Agenda {MONTHS[currentDate.getMonth()]}
                </CardTitle>
                <Badge variant="outline" className="bg-white text-[10px]">
                  {monthEvents.length} Item
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
                {monthEvents.length === 0 && (
                  <div className="p-10 text-center">
                    <CalendarIcon className="size-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Tidak ada agenda bulan ini.</p>
                  </div>
                )}
                {monthEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((e, i) => (
                    <div
                      key={i}
                      className="p-4 flex gap-3 hover:bg-muted/30 transition-colors group cursor-default"
                    >
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center size-10 rounded-xl shrink-0 shadow-sm border transition-transform group-hover:scale-105",
                          e.type === "pangkat"
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-success/5 border-success/20 text-success",
                        )}
                      >
                        <span className="text-xs font-bold leading-none">
                          {new Date(e.date).getDate()}
                        </span>
                        <span className="text-[8px] uppercase font-bold mt-0.5">
                          {new Date(e.date).toLocaleDateString("id-ID", { month: "short" })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                          {e.p.nama}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {e.type === "pangkat" ? "Kenaikan Pangkat" : "Kenaikan Gaji Berkala"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
