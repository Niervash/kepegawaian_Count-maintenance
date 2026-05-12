# Spesifikasi Backend & Database (Node.js + MySQL)

Dokumen ini merupakan panduan bagi pengembang untuk membangun Backend terpisah yang kompatibel dengan sistem SIMPEG.

---

## 1. Struktur Folder (Node.js + Express)

Rekomendasi struktur folder menggunakan pola **MVC (Model-View-Controller)** atau **Layered Architecture** agar kode bersih dan mudah dikelola:

```text
simpeg-backend/
├── src/
│   ├── config/             # Koneksi Database (Sequelize/Knex/Pool)
│   ├── controllers/        # Logika penanganan request (HTTP)
│   ├── models/             # Definisi skema tabel MySQL
│   ├── routes/             # Definisi endpoint API
│   ├── middlewares/        # Auth (JWT) & Validasi data
│   ├── services/           # Logika bisnis (hitung pangkat/KGB)
│   ├── utils/              # Helper (format tanggal, dll)
│   └── app.js              # Entry point Express
├── uploads/                # Folder penyimpanan file SK/Dokumen
├── .env                    # Konfigurasi DB_HOST, DB_USER, JWT_SECRET
├── package.json
└── README.md
```

---

## 2. Skema Database (MySQL)

Berikut adalah desain tabel yang dibutuhkan agar sesuai dengan data di Frontend:

### Tabel `users` (Autentikasi)

| Field      | Type         | Constraint                     | Keterangan                 |
| :--------- | :----------- | :----------------------------- | :------------------------- |
| id         | INT          | PK, Auto Increment             |                            |
| name       | VARCHAR(100) | NOT NULL                       |                            |
| nip        | VARCHAR(20)  | UNIQUE, NOT NULL               | Digunakan sebagai Username |
| email      | VARCHAR(100) | UNIQUE, NOT NULL               |                            |
| password   | VARCHAR(255) | NOT NULL                       | Hashed (Bcrypt)            |
| role       | ENUM         | 'admin', 'pegawai', 'pimpinan' |                            |
| jabatan    | VARCHAR(100) |                                |                            |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP      |                            |

### Tabel `pegawai` (Data Master)

| Field       | Type         | Constraint                 | Keterangan                    |
| :---------- | :----------- | :------------------------- | :---------------------------- |
| id          | INT          | PK, Auto Increment         |                               |
| nip         | VARCHAR(20)  | UNIQUE, NOT NULL           |                               |
| nama        | VARCHAR(100) | NOT NULL                   |                               |
| jabatan     | VARCHAR(100) |                            |                               |
| golongan    | VARCHAR(10)  |                            |                               |
| unit_kerja  | VARCHAR(100) |                            |                               |
| email       | VARCHAR(100) |                            |                               |
| phone       | VARCHAR(20)  |                            |                               |
| tmt_pangkat | DATE         |                            | Tanggal terakhir naik pangkat |
| tmt_kgb     | DATE         |                            | Tanggal terakhir KGB          |
| status      | ENUM         | 'aktif', 'cuti', 'pensiun' |                               |

### Tabel `approvals` (Workflow)

| Field        | Type         | Constraint                        | Keterangan              |
| :----------- | :----------- | :-------------------------------- | :---------------------- |
| id           | INT          | PK, Auto Increment                |                         |
| pegawai_id   | INT          | FK (pegawai.id)                   |                         |
| type         | ENUM         | 'Pangkat', 'KGB', 'Lainnya'       |                         |
| submitted_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP         |                         |
| status       | ENUM         | 'pending', 'approved', 'rejected' |                         |
| dokumen_url  | VARCHAR(255) |                                   | Path ke folder uploads/ |
| catatan      | TEXT         |                                   | Alasan jika ditolak     |

---

## 3. Daftar Endpoint API Utama (Requirements)

Backend Anda minimal harus menyediakan endpoint berikut:

### Auth

- `POST /api/auth/login`: Mengembalikan Token JWT dan data User.
- `PUT /api/auth/update-password`: Mengubah password user yang sedang login.

### Pegawai

- `GET /api/pegawai`: List semua pegawai (dengan filter search & pagination).
- `POST /api/pegawai`: Tambah pegawai baru (Admin only).
- `GET /api/pegawai/:id`: Detail satu pegawai.
- `PUT /api/pegawai/:id`: Update data pegawai.
- `DELETE /api/pegawai/:id`: Hapus pegawai.

### Approval

- `GET /api/approvals`: List pengajuan (Admin/Pimpinan).
- `POST /api/approvals`: Upload dokumen pengajuan (Pegawai only).
- `PUT /api/approvals/:id`: Proses keputusan (Approve/Reject).

---

## 4. Tips Implementasi

1.  **Keamanan**: Gunakan `cors` agar FE (React) bisa mengakses BE. Gunakan `helmet` untuk proteksi header.
2.  **Validasi**: Gunakan library `joi` atau `express-validator` untuk memastikan data NIP dan Email benar sebelum masuk ke MySQL.
3.  **File Upload**: Gunakan library `multer` untuk menangani upload file PDF/Gambar dokumen pegawai.
4.  **Logging**: Gunakan `morgan` untuk melihat log request di terminal selama pengembangan.
