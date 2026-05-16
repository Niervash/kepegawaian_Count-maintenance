# Dokumen Teknis SIKAPAS (Sistem Informasi Kepegawaian)

Dokumen ini menjelaskan arsitektur teknis, fitur utama, workflow, dan panduan konfigurasi API untuk pengembang.

## 1. Konfigurasi API

Aplikasi ini menggunakan **Axios** untuk komunikasi data dengan Backend. Konfigurasi utama API berada di file `src/services/api.ts`.

### Cara Mengganti URL API (Deployment)

Jika Backend sudah dideploy ke server produksi, Anda perlu memperbarui URL API dengan cara berikut:

1.  **Melalui File `.env` (Direkomendasikan):**
    Buka file `.env` di root project dan ubah nilai `VITE_API_URL`:
    ```env
    VITE_API_URL=https://api.domain-anda.com/api
    ```
    Pastikan untuk melakukan restart pada server development atau melakukan rebuild aplikasi setelah mengubah file ini.

2.  **Melalui Konfigurasi Default:**
    Jika file `.env` tidak ditemukan, aplikasi akan menggunakan fallback URL di `src/services/api.ts`:
    ```typescript
    const API_URL = import.meta.env.VITE_API_URL || "https://url-fallback-anda.com/api";
    ```

### Interceptor & Autentikasi
Aplikasi secara otomatis menyisipkan token JWT ke setiap request header jika pengguna sudah login:
- Token disimpan di `localStorage` dengan key `sikapas_token`.
- Header yang dikirim: `Authorization: Bearer <token>`.

---

## 2. Penjelasan Halaman Penting

### A. Dashboard (`/dashboard`)
Halaman utama yang memberikan ringkasan data bagi Admin dan akses cepat bagi Pegawai.
- **Statistik Utama:** Menampilkan jumlah total pegawai, kenaikan pangkat mendatang, dan KGB (Kenaikan Gaji Berkala).
- **Kelola Berkas:** Fitur untuk mengunggah dan mengelola dokumen template atau dokumen penting instansi.
- **Shortcut Pengajuan:** Pegawai dapat langsung mengunggah dokumen pengajuan (Kenaikan Pangkat/KGB) dari sini.

### B. Manajemen Pegawai (`/pegawai`)
Pusat pengelolaan data SDM.
- **CRUD Pegawai:** Menambah, melihat, mengedit, dan menghapus data pegawai.
- **Filter & Search:** Mencari pegawai berdasarkan NIP/Nama dan filter berdasarkan Golongan atau Status.
- **Manajemen Akun:** Admin dapat membuatkan akun login (User) untuk pegawai yang baru didaftarkan.

### C. Sistem Approval (`/approval`)
Halaman workflow untuk proses verifikasi dokumen.
- **Status Tab:** Memisahkan dokumen berdasarkan status: *Pending*, *Approved*, dan *Rejected*.
- **Preview Dokumen:** Integrasi PDF viewer untuk memeriksa dokumen sebelum diputuskan.
- **Role-based Action:**
    - **Pegawai:** Hanya dapat melihat status pengajuannya sendiri.
    - **Admin/Pimpinan:** Memiliki tombol untuk menyetujui atau menolak pengajuan.

### D. Master Data (`/master/golongan` & `/master/jabatan`)
Halaman konfigurasi untuk referensi data yang digunakan di seluruh aplikasi.
- Memastikan konsistensi data golongan dan nama jabatan.

---

## 3. Workflow Fitur Utama

### Workflow Pengajuan Kenaikan Pangkat/KGB
1.  **Pegawai** masuk ke halaman **Dashboard** atau **Approval**.
2.  Pegawai memilih jenis dokumen dan mengunggah file (format PDF/Gambar).
3.  Sistem menyimpan data ke tabel `approvals` dengan status `pending`.
4.  **Admin/Pimpinan** mendapatkan notifikasi (atau melihat list di halaman Approval).
5.  Admin membuka detail pengajuan, memeriksa dokumen, dan memilih **Approve** atau **Reject**.
6.  Jika **Approve**, sistem akan memperbarui status dan pegawai dapat melihat hasilnya.

### Workflow Manajemen Pegawai Baru
1.  **Admin** mengisi form data pegawai di menu **Pegawai**.
2.  Setelah data tersimpan, Admin mengklik ikon **Kunci/User** pada list pegawai.
3.  Admin membuatkan username dan password untuk pegawai tersebut.
4.  Pegawai kini dapat login menggunakan kredensial yang diberikan.

---

## 4. Struktur Folder Penting
- `src/routes/`: Definisi routing dan logika halaman.
- `src/components/ui/`: Komponen UI reusable (shadcn/ui).
- `src/services/api.ts`: Konfigurasi Axios dan API endpoint.
- `src/lib/auth-context.tsx`: State management untuk sesi user dan login.
- `src/lib/simpeg-data.ts`: Definisi interface (Typescript) dan helper fungsi data.

---
*Dokumen ini diperbarui secara berkala sesuai dengan perkembangan fitur aplikasi.*
