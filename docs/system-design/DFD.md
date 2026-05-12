# Data Flow Diagram (DFD) - SIMPEG

Sistem Informasi Kepegawaian menggunakan diagram alir data untuk menggambarkan bagaimana informasi bergerak melalui sistem.

## Level 0: Context Diagram

Menggambarkan interaksi antara entitas luar dengan sistem SIMPEG secara keseluruhan.

```mermaid
graph LR
    P[Pegawai] -- Data Pribadi & Dokumen --> S((SIMPEG))
    A[Admin] -- Data Pegawai & Konfigurasi --> S
    L[Pimpinan] -- Keputusan Approval --> S

    S -- Notifikasi & Progres --> P
    S -- Laporan & Reminder --> A
    S -- Statistik & Daftar Approval --> L
```

## Level 1: Process Diagram

Detail proses utama dalam sistem.

```mermaid
graph TD
    User((User)) --> P1[Proses 1: Login & Autentikasi]
    P1 --> DB[(User Storage)]

    subgraph "Dashboard & Monitoring"
        P2[Proses 2: Tracking Pangkat & KGB]
        P3[Proses 3: Notifikasi Reminder]
    end

    subgraph "Administrasi"
        P4[Proses 4: Pengelolaan Data Pegawai]
        P5[Proses 5: Workflow Approval]
    end

    DB_P[(Pegawai Storage)]
    DB_A[(Approval Storage)]

    P4 <--> DB_P
    P2 <-- Data Pegawai --> DB_P
    P5 <--> DB_A
    P3 <-- Cek Deadline --> DB_P
```
