# Backfill Kegiatan Utama

Skrip ini tidak menebak pemetaan dari teks lama. Jalankan audit terlebih dahulu pada database target, lalu siapkan mapping yang ditinjau pemilik data.

## Audit

Jalankan dari direktori `sapa-mitra-backend`:

```sh
bun run src/scripts/backfill-main-activities.ts
```

Audit melaporkan jumlah Kegiatan yang sudah terhubung, jumlah yang belum, dan nilai teks lama per tahun/tim. Perintah audit tidak mengubah database, tetapi menyimpan `main-activity-audit.json` di direktori kerja saat ini. File tersebut berisi satu objek untuk setiap Activity yang belum terhubung: ID, nama Kegiatan, tim, tahun, nilai teks lama, dan placeholder `mainActivityName` untuk diisi.

Lokasi file dapat diubah dengan `--audit-output /path/to/file.json`. File output berbentuk array JSON sehingga dapat langsung dipakai sebagai mapping setelah semua nilai `mainActivityName` ditinjau dan dilengkapi. File mapping yang sedang dipakai melalui `--mapping` tidak akan ditimpa.

## Mapping eksplisit

Edit file audit JSON yang dihasilkan (jangan commit bila memuat data internal) dan isi `mainActivityName` untuk setiap Activity yang belum terhubung:

```json
[
  { "activityId": "<MongoDB Activity _id>", "activityName": "Pencacahan Survei A", "year": 2026, "legacyMain": "Survei A", "mainActivityName": "Survei A" },
  { "activityId": "<MongoDB Activity _id>", "activityName": "Pengolahan Survei A", "year": 2026, "legacyMain": "Survei A", "mainActivityName": "Survei A" }
]
```

Activity kosong atau bernilai ambigu harus dipetakan secara eksplisit oleh pemilik data. Master dapat dipakai beberapa tim. Nama yang sama setelah trim/spasi dan normalisasi huruf kecil hanya dapat dipakai pada tim dan tahun yang sama oleh satu master; untuk memakai master lintas tim, daftarkan seluruh tim pada master tersebut.

Simulasikan dan pastikan seluruh Activity lama terpetakan:

```sh
bun run src/scripts/backfill-main-activities.ts --mapping /path/to/main-activity-mapping.json
```

Setelah hasil simulasi dan mapping disetujui, jalankan. Mode `--apply` juga mengganti indeks unik lama (tahun + nama atau team + tahun + nama) menjadi indeks multikey team + tahun + nama, mengonversi nilai team tunggal menjadi array, menggabungkan tim dari Activity yang terhubung, serta menyatukan master duplikat dengan nama dan tahun yang sama. Satu Kegiatan Utama dapat dimiliki oleh beberapa tim:

```sh
bun run src/scripts/backfill-main-activities.ts --mapping /path/to/main-activity-mapping.json --apply
```

Skrip aman diulang untuk Activity yang telah berhasil ditautkan. Setelah apply, audit ulang dan pastikan `awaitingMapping` bernilai nol sebelum menganggap cutover selesai. Skrip tidak mengubah Activity yang sudah memiliki `mainActivityId`.
