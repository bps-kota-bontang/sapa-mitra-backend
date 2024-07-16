# SAPAMITRA

SAPAMITRA adalah aplikasi yang dirancang untuk membantu dalam manajemen dokumen Surat Perjanjian Kerja (SPK), Berita Acara Serah Terima (BAST) serta pemantauan honorarium. Aplikasi ini menyediakan solusi yang efisien dan efektif untuk pembuatan dokumen dan identifikasi mitra yang melampaui batas penerimaan honor.

## Fitur

### 1. Generate dokumen Surat Perjanjian Kerja para Mitra

> Aplikasi ini memungkinkan pengguna untuk membuat dan mengelola dokumen Surat Perjanjian Kerja dengan mudah dan cepat. Pengguna hanya perlu memasukkan data yang diperlukan, dan dokumen akan dihasilkan secara otomatis dalam format yang sudah ditentukan.

### 2. Generate dokumen Berita Acara Serah Terima

> Dengan fitur ini, pengguna dapat membuat dokumen Berita Acara Serah Terima dengan cepat. Fitur ini membantu dalam memastikan semua proses serah terima dicatat dengan baik dan dapat diakses kapan saja.

### 3. Mengidentifikasi mitra yang melebihi batas terima honor dalam satu periode

> Aplikasi ini dilengkapi dengan sistem monitoring yang dapat mengidentifikasi mitra yang menerima honorarium melebihi batas yang ditentukan dalam satu periode (satu bulan).

## Teknologi yang Digunakan

1. TypeScript: Bahasa pemrograman yang digunakan untuk mengembangkan fitur-fitur aplikasi.
2. Bun: JavaScript runtime yang digunakan untuk menjalankan server-side aplikasi ini.
3. Hono.js: Framework web yang digunakan untuk mengelola server-side operasi.
4. Vue.js: Framework JavaScript yang digunakan untuk membangun antarmuka pengguna.
5. MongoDB: Database yang digunakan untuk menyimpan data aplikasi.
6. Puppeteer: Library yang digunakan untuk otomatisasi proses pembuatan dokumen.
7. Docker: Platform untuk mengemas aplikasi ke dalam kontainer sehingga mudah untuk dijalankan di berbagai lingkungan.

## Cara Instalasi

1. _Clone repository_ ke komputer Anda:

```sh
git clone http://git.bps.go.id/sapa-mitra/sapa-mitra-backend.git
```

2. Masuk ke direktori proyek:

```sh
cd sapa-mitra-backend
```

3. _Install dependencies_:

```sh
bun install
```

4. Konfigurasi .env :

Ubah _file_ .env.example menjadi .env, silahkan ubah file .env sesuai kebutuhan anda.

```sh
APP_NAME=SAPAMITRA
APP_ENV=development
APP_HOST=http://localhost:4000
APP_REGION="Kota Bontang"
APP_REGION_CODE="6474"
JWT_SECRET=password
JWT_DURATION=3600
MONGO_URI=mongodb://sapa-mitra-mongo:27017/sapa_mitra_db
```

Default Mongo URI menggunakan Docker, jika anda tidak menggunakan Docker silahkan ubah Mongo URI, contoh: `mongodb://localhost:27017/sapa_mitra_db`

5. Melakukan _seed_ untuk menambahkan pengguna bawaan:

Seeding database cukup dilakukan satu kali saja.

```sh
bun run seed
```

6. Menjalankan di lingkungan _local_:

- Tanpa menggunakan Docker

```sh
bun run dev
```

- Menggunakan Docker

```sh
docker compose up
```

6. Menjalankan di lingkungan _production_:

- Tanpa menggunakan Docker

```sh
bun run start
```

- Menggunakan Docker

Untuk menjalankan di lingkungan _production_ menggunakan Docker pastikan anda telah melakukan _Build Image_ lalu menyimpan ke Registry. Pada sisi _Server_ melakukan _Pull Image_ dari Registry yang digunakan.

## Pengguna

| Email            | Password | Tim | Posisi  |
| ---------------- | -------- | --- | ------- |
| ketua@mail.com   | 123456   | TU  | Ketua   |
| anggota@mail.com | 123456   | TU  | Anggota |

## Kontribusi

Kami sangat terbuka terhadap kontribusi dari siapa saja. Jika Anda ingin berkontribusi, silakan _fork repository_ ini dan kirimkan _pull request_ dengan perubahan yang Anda buat.

## Lisensi

Aplikasi ini dilisensikan di bawah [MIT License](http://git.bps.go.id/sapa-mitra/sapa-mitra-backend/blob/main/LICENSE).

## Kontak

Jika Anda memiliki pertanyaan atau masukan, silakan hubungi kami di arif.hakim@bps.go.id.
