import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/pengaturan")({ component: Page });

function Page() {
  const settings = [
    { l: "Email Notification", d: "Kirim reminder ke email pegawai" },
    { l: "WhatsApp Notification", d: "Reminder via WhatsApp Business API" },
    { l: "Reminder H-30", d: "Aktifkan pengingat 30 hari sebelum" },
    { l: "Reminder H-14", d: "Aktifkan pengingat 14 hari sebelum" },
    { l: "Reminder H-7 (Urgent)", d: "Pengingat urgent 7 hari sebelum" },
    { l: "Auto Generate Surat", d: "Generate PDF/DOCX otomatis setelah approval" },
    { l: "Dark Mode", d: "Tampilan gelap untuk dashboard" },
  ];
  return (
    <AppShell title="Pengaturan">
      <Card className="shadow-card max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Preferensi Sistem</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div>
                <Label className="text-sm font-medium">{s.l}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{s.d}</p>
              </div>
              <Switch defaultChecked={i < 5} />
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
