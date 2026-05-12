export type Role = "admin" | "pegawai" | "pimpinan";

export interface User {
  id: string;
  name: string;
  nip: string;
  role: Role;
  email: string;
  avatar?: string;
  jabatan: string;
  password?: string;
}

export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  unitKerja: string;
  email: string;
  phone: string;
  tmtPangkat: string; // ISO date
  tmtKgb: string;
  tanggalMasuk: string; // Tanggal pertama kali masuk/CPNS
  status: "aktif" | "cuti" | "pensiun";
  avatar?: string;
  hasAccount?: boolean;
}

export interface RiwayatItem {
  id: string;
  pegawaiId: string;
  type: "pangkat" | "kgb" | "dokumen" | "approval";
  title: string;
  description: string;
  date: string;
  status?: "approved" | "pending" | "rejected";
}

export interface Approval {
  id: string;
  pegawaiId: string;
  pegawaiNama: string;
  type: "Kenaikan Pangkat" | "KGB" | "Cuti" | "Mutasi";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  dokumen: string;
  catatan?: string;
  pegawai_id?: string;
}

const addYears = (date: Date | string, y: number) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + y);
  return d.toISOString();
};

// Helper to calculate the most recent (last) TMT based on cycle
export function lastPangkat(entryDate: string) {
  if (!entryDate) return new Date().toISOString().split("T")[0];
  const start = new Date(entryDate);
  const now = new Date();
  let last = new Date(start);
  while (true) {
    const next = new Date(last);
    next.setFullYear(next.getFullYear() + 4);
    if (next > now) break;
    last = next;
  }
  return last.toISOString().split("T")[0];
}

export function lastKgb(entryDate: string) {
  if (!entryDate) return new Date().toISOString().split("T")[0];
  const start = new Date(entryDate);
  const now = new Date();
  let last = new Date(start);
  while (true) {
    const next = new Date(last);
    next.setFullYear(next.getFullYear() + 2);
    if (next > now) break;
    last = next;
  }
  return last.toISOString().split("T")[0];
}

// Compute next dates (Siklus 4 tahun pangkat, 2 tahun KGB)
export function nextPangkat(p: Pegawai) {
  const baseDate = p.tmtPangkat || p.tanggalMasuk;
  if (!baseDate) return new Date().toISOString();

  const start = new Date(baseDate);
  const now = new Date();
  const next = new Date(start);

  // If the provided TMT is already in the past or today, find the first future anniversary
  // using the 4-year cycle from that base.
  while (next <= now) {
    next.setFullYear(next.getFullYear() + 4);
  }
  return next.toISOString();
}

export function nextKgb(p: Pegawai) {
  const baseDate = p.tmtKgb || p.tanggalMasuk;
  if (!baseDate) return new Date().toISOString();

  const start = new Date(baseDate);
  const now = new Date();
  const next = new Date(start);

  while (next <= now) {
    next.setFullYear(next.getFullYear() + 2);
  }
  return next.toISOString();
}

export function daysUntil(iso: string) {
  if (!iso) return 0;
  const d = new Date(iso).getTime() - Date.now();
  return Math.ceil(d / (1000 * 60 * 60 * 24));
}

export interface ImportantDoc {
  id: number;
  name: string;
  type: string;
  size: string;
  file_url?: string;
}

// Minimal placeholder for legacy code if any
export const getStoredPegawai = () => [];
export const getStoredUsers = (): Record<string, User> => ({
  admin: {
    id: "admin",
    name: "Administrator Utama",
    nip: "198801012010011001",
    role: "admin",
    email: "admin@sikapas.go.id",
    jabatan: "Kepala Bagian Kepegawaian",
    password: "password",
  },
  pegawai: {
    id: "pegawai",
    name: "Ahmad Rivai",
    nip: "199205152015031002",
    role: "pegawai",
    email: "ahmad.rivai@sikapas.go.id",
    jabatan: "Analis Kepegawaian Ahli Pertama",
    password: "password",
  },
});
export const getStoredDocs = () => [];
