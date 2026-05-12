# Metode Pengembangan: Waterfall

Sistem SIMPEG dikembangkan menggunakan model **Waterfall** (Air Terjun) karena kebutuhan sistem yang terstruktur dan alur kerja administrasi pemerintahan yang linear.

## Tahapan Pengembangan

### 1. Requirements Analysis (Analisis Kebutuhan)

Mendefinisikan fitur utama:

- Otomatisasi hitung masa kerja (4 tahun pangkat, 2 tahun KGB).
- Role-based access (Admin, Pegawai, Pimpinan).
- Notifikasi H-30/14/7.

### 2. System Design (Desain Sistem)

Pembuatan dokumen teknis:

- **DFD** untuk alur data.
- **Flowchart** untuk alur logika aplikasi.
- Desain UI/UX menggunakan Tailwind CSS dan Shadcn UI.

### 3. Implementation (Implementasi/Coding)

Pengembangan menggunakan tech stack:

- **Frontend**: React 19 + Vite.
- **Routing**: TanStack Router (Type-safe).
- **State**: TanStack Query & React Context.

### 4. Integration & Testing (Pengujian)

Melakukan verifikasi pada:

- Fungsi login dan RBAC.
- Akurasi perhitungan tanggal naik pangkat.
- Pengujian responsivitas (Mobile-friendly).

### 5. Deployment (Penyebaran)

Aplikasi di-deploy sebagai Single Page Application (SPA) agar performa cepat dan navigasi mulus bagi pengguna.

### 6. Maintenance (Pemeliharaan)

Pembaruan berkala untuk database pegawai dan penyesuaian format laporan jika ada regulasi baru.
