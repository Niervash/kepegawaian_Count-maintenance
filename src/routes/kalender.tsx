import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Pegawai, nextPangkat, nextKgb } from "@/lib/simpeg-data";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";

export const Route = createFileRoute("/kalender")({ component: Page });

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

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const calendarDays = useMemo(() => {
    const total = daysInMonth(currentDate);
    const first = firstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [currentDate]);

  if (loading)
    return (
      <AppShell title="Kalender Monitoring">
        <div className="p-8 text-center">Memuat data...</div>
      </AppShell>
    );

  return (
    <AppShell title="Kalender Monitoring">
      <div className="grid lg:grid-cols-4 gap-5">
        <Card className="lg:col-span-3 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 border-b pb-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border mt-2">
              {calendarDays.map((day, i) => {
                const dayEvents = day
                  ? monthEvents.filter((e) => new Date(e.date).getDate() === day)
                  : [];
                return (
                  <div key={i} className={cn("min-h-[100px] bg-card p-2", !day && "bg-muted/20")}>
                    {day && (
                      <>
                        <div className="text-xs font-medium">{day}</div>
                        <div className="mt-1 space-y-1">
                          {dayEvents.map((e, ei) => (
                            <div
                              key={ei}
                              className={cn(
                                "text-[9px] p-1 rounded-sm border-l-2 truncate",
                                e.type === "pangkat"
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-success/10 border-success text-success",
                              )}
                            >
                              {e.p.nama.split(" ")[0]} ({e.type === "pangkat" ? "P" : "K"})
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Agenda Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {monthEvents.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground text-center">Tidak ada agenda.</p>
              )}
              {monthEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((e, i) => (
                  <div key={i} className="p-4 flex gap-3">
                    <div className="flex flex-col items-center justify-center size-10 rounded-lg bg-muted text-foreground shrink-0">
                      <span className="text-xs font-bold leading-none">
                        {new Date(e.date).getDate()}
                      </span>
                      <span className="text-[9px] uppercase">
                        {new Date(e.date).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{e.p.nama}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        Naik {e.type}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
