import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Pegawai, nextPangkat, nextKgb, Approval } from "./simpeg-data";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface MonthlyStat {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export const generateMonthlyPDF = (pegawai: Pegawai[]) => {
  const doc = new jsPDF();
  const date = new Date();
  const monthName = format(date, "MMMM yyyy", { locale: id });

  doc.setFontSize(18);
  doc.text("Laporan Bulanan Kepegawaian", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Periode: ${monthName}`, 14, 30);

  // Kenaikan Pangkat Table
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Rencana Kenaikan Pangkat", 14, 45);

  const pangkatData = pegawai.map((p) => ({
    nama: p.nama,
    nip: p.nip,
    golongan: p.golongan,
    tmtLalu: format(new Date(p.tmtPangkat), "dd/MM/yyyy"),
    tmtNext: format(new Date(nextPangkat(p)), "dd/MM/yyyy"),
  }));

  autoTable(doc, {
    startY: 50,
    head: [["Nama", "NIP", "Gol", "TMT Terakhir", "TMT Berikutnya"]],
    body: pangkatData.map((p) => [p.nama, p.nip, p.golongan, p.tmtLalu, p.tmtNext]),
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });

  // KGB Table
  const finalY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 150;
  doc.setFontSize(14);
  doc.text("Rencana Kenaikan Gaji Berkala (KGB)", 14, finalY + 15);

  const kgbData = pegawai.map((p) => ({
    nama: p.nama,
    nip: p.nip,
    unit: p.unitKerja,
    tmtLalu: format(new Date(p.tmtKgb), "dd/MM/yyyy"),
    tmtNext: format(new Date(nextKgb(p)), "dd/MM/yyyy"),
  }));

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Nama", "NIP", "Unit Kerja", "TMT Terakhir", "TMT Berikutnya"]],
    body: kgbData.map((p) => [p.nama, p.nip, p.unit, p.tmtLalu, p.tmtNext]),
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(`Laporan_Bulanan_${monthName.replace(" ", "_")}.pdf`);
};

export const exportToExcel = (pegawai: Pegawai[]) => {
  const data = pegawai.map((p) => ({
    "Nama Lengkap": p.nama,
    NIP: p.nip,
    Jabatan: p.jabatan,
    Golongan: p.golongan,
    "Unit Kerja": p.unitKerja,
    Email: p.email,
    Telepon: p.phone,
    "TMT Pangkat": format(new Date(p.tmtPangkat), "dd/MM/yyyy"),
    "TMT KGB": format(new Date(p.tmtKgb), "dd/MM/yyyy"),
    Status: p.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai");

  XLSX.writeFile(workbook, "Data_Pegawai_Export.xlsx");
};

export const generateYearlyAnalysisPDF = (approvals: Approval[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Analisis Tahunan Pengajuan", 14, 22);

  const stats = approvals.reduce((acc: Record<string, MonthlyStat>, curr) => {
    const month = format(new Date(curr.submittedAt), "MMMM", { locale: id });
    if (!acc[month]) acc[month] = { total: 0, approved: 0, rejected: 0, pending: 0 };
    acc[month].total++;
    acc[month][curr.status]++;
    return acc;
  }, {});

  const tableData = Object.entries(stats).map(([month, s]) => [
    month,
    s.total,
    s.approved,
    s.rejected,
    s.pending,
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Bulan", "Total Pengajuan", "Disetujui", "Ditolak", "Pending"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save("Analisis_Tahunan_Kepegawaian.pdf");
};
