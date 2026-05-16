# SIKAPAS - Sistem Informasi Kepegawaian

SIKAPAS adalah platform manajemen administrasi kepegawaian modern yang dirancang untuk mengelola data pegawai, pengajuan kenaikan pangkat, dan Kenaikan Gaji Berkala (KGB) secara efisien dan terintegrasi.

---

## 🚀 Panduan Teknis & Konfigurasi API

### 1. Konfigurasi Endpoint API (Produksi)
Aplikasi ini dibangun menggunakan React + Vite. Komunikasi data dikelola secara terpusat melalui `src/services/api.ts`.

**Cara Mengganti API saat Backend sudah Deploy:**
Untuk mengubah alamat server backend tanpa menyentuh kode program, gunakan file `.env`:

1.  Cari atau buat file `.env` di direktori utama (root).
2.  Ubah/tambah variabel berikut:
    ```env
    VITE_API_URL=https://api.instansi-anda.go.id/api
    ```
3.  Simpan dan jalankan build ulang (`npm run build`).

*Catatan: Jika `.env` tidak ada, edit fallback URL di `src/services/api.ts` pada variabel `API_URL`.*

---

## 📁 Penjelasan Halaman Penting

Aplikasi ini menggunakan sistem **Role-Based Access Control (RBAC)** di mana tampilan fitur menyesuaikan level user (Admin, Pimpinan, Pegawai).

### 1. Dashboard (`/dashboard`)
*   **Fungsi:** Pusat informasi ringkas dan navigasi cepat.
*   **Detail:** 
    *   **Statistik Real-time:** Menampilkan jumlah pegawai aktif, pengajuan yang menunggu persetujuan, dan jadwal KGB terdekat.
    *   **Quick Upload:** Pegawai dapat langsung mengunggah dokumen persyaratan pangkat/KGB di sini.
    *   **Kelola Berkas:** (Admin) Mengatur template dokumen yang bisa diunduh oleh pegawai.

### 2. Manajemen Pegawai (`/pegawai`)
*   **Fungsi:** Database utama SDM.
*   **Detail:** 
    *   **Data Induk:** Nama, NIP, Golongan, Jabatan, dan Riwayat Pendidikan.
    *   **Penerbitan Akun:** Admin dapat membuatkan akses login untuk setiap pegawai secara individual melalui ikon kunci.
    *   **Filter Canggih:** Memungkinkan Admin mencari pegawai berdasarkan masa kerja atau kategori golongan.

### 3. Sistem Persetujuan (`/approval`)
*   **Fungsi:** Workflow verifikasi dokumen (Digital Signature Ready).
*   **Detail:** 
    *   **Status Tracking:** Tabulasi data berdasarkan status (Menunggu, Disetujui, Ditolak).
    *   **PDF Viewer:** Memungkinkan Admin/Pimpinan melihat isi dokumen langsung di browser tanpa perlu mengunduh terlebih dahulu.
    *   **Aksi Cepat:** Tombol "Approve" atau "Reject" dengan input alasan jika pengajuan ditolak.

### 4. Laporan & Kenaikan Pangkat (`/kenaikan-pangkat`, `/kgb`)
*   **Fungsi:** Monitoring jadwal otomatis.
*   **Detail:** Sistem secara otomatis menghitung kapan seorang pegawai berhak mendapatkan kenaikan pangkat atau KGB berikutnya berdasarkan TMT (Terhitung Mulai Tanggal) terakhir.

---

## 🔄 Workflow Fitur Utama

### A. Alur Pengajuan Dokumen (User/Pegawai)
1.  **Login:** Pegawai masuk menggunakan NIP/Username.
2.  **Upload:** Melalui Dashboard, pegawai mengklik "Ajukan Dokumen".
3.  **Submission:** Pegawai memilih jenis pengajuan (Pangkat/KGB) dan mengunggah file PDF.
4.  **Monitoring:** Pegawai memantau status di halaman Approval; jika status berubah menjadi "Approved", pegawai dapat mengunduh hasilnya.

### B. Alur Verifikasi & Persetujuan (Admin/Pimpinan)
1.  **Notifikasi:** Admin melihat indikator jumlah pending di sidebar menu Approval.
2.  **Review:** Admin masuk ke halaman Approval, membuka file PDF yang diunggah pegawai.
3.  **Keputusan:** 
    *   **Setuju:** Klik Approve -> Status berubah di sisi pegawai.
    *   **Tolak:** Klik Reject -> Masukkan alasan (misal: "Dokumen kurang jelas").
4.  **Update Data:** Jika pengajuan bersifat update jabatan/golongan, Admin memperbarui data induk di Manajemen Pegawai setelah dokumen disahkan.

---

## 🛠️ Tech Stack & Pengembangan
*   **Frontend:** React.js, TypeScript, TanStack Router.
*   **Styling:** Tailwind CSS, Shadcn UI (Radix UI).
*   **API Client:** Axios (dengan Interceptors untuk JWT).
*   **Icons:** Lucide React.
*   **Charts:** Recharts (untuk visualisasi data di dashboard).

---

## ⚙️ Cara Menjalankan Project

1.  **Install Dependensi:**
    ```bash
    npm install
    # atau
    bun install
    ```
2.  **Jalankan Mode Development:**
    ```bash
    npm run dev
    ```
3.  **Build untuk Produksi:**
    ```bash
    npm run build
    ```

---
*Dikembangkan untuk efisiensi birokrasi dan transparansi data kepegawaian.*
