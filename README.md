# EventSpace

Platform pencarian dan discovery event lokal di Samarinda dan sekitarnya.

## Status pengerjaan

Selesai: tahap 1-12 penuh, tahap 13 (favorit), tahap 15 (SEO: metadata, sitemap, robots.txt), dan rate limiting login dari tahap 16.
Juga selesai: seed data (`prisma/seed.ts`), yang sebelumnya ditunda bersama testing dan deployment.
Belum dikerjakan: automated testing dan deployment.

## Yang baru di checkpoint ini

- Tombol favorit (ikon hati) di tiap kartu event dan halaman detail. Klik tanpa login akan diarahkan ke halaman masuk.
- Halaman `/favorites`: daftar event yang sudah disimpan pengguna.
- Sorting "Event populer" di `/events` sekarang benar-benar menghitung jumlah favorit.
- `app/sitemap.ts` dan `app/robots.ts`: sitemap otomatis mencakup semua event published/finished, dibangkitkan ulang tiap diminta (bukan dibekukan saat build). robots.txt melarang crawler masuk ke `/admin`, `/api`, `/favorites`.
- Metadata Open Graph default di layout utama, lengkap dengan `metadataBase`.
- Rate limiting percobaan login: 5 kali gagal per kombinasi IP + email dalam 15 menit, berlaku di login user maupun admin. Disimpan di memori proses, jadi reset saat server di-restart dan tidak otomatis saling berbagi hitungan antar banyak instance server. Kalau nanti deploy ke platform serverless dengan banyak instance (Vercel, misalnya), ganti ke penyimpanan bersama seperti Redis/Upstash.

## Kebutuhan

- Node.js 20 atau lebih baru
- Laragon dengan PostgreSQL

## Setup

1. Jalankan Laragon, lalu nyalakan PostgreSQL (Start All).
2. Buat database bernama `eventspace` lewat Laragon (tombol Database), pgAdmin, atau DBeaver.
3. Buka `.env`, lalu sesuaikan `DATABASE_URL` dengan PostgreSQL Laragon kamu:

   ```
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/eventspace?schema=public"
   ```

   Ganti `PASSWORD` dan port bila berbeda. Karakter khusus di password harus di-encode, misalnya `@` menjadi `%40`.
4. Pasang dependency:

   ```
   npm install
   ```

5. Buat tabel di database:

   ```
   npx prisma migrate dev --name init
   ```

6. Isi data contoh (2 akun dan 10 event, opsional tapi disarankan):

   ```
   npx prisma db seed
   ```

   Akun yang dibuat:
   admin@eventspace.test / Admin123! (role ADMIN)
   user@eventspace.test / User123! (role USER)

   Aman dijalankan berkali-kali, data yang sama tidak akan dobel.

7. Jalankan project:

   ```
   npm run dev
   ```

   Buka http://localhost:3000

## Membuat akun admin tambahan

Seed data sudah membuatkan satu akun admin (lihat langkah 6 di atas). Untuk akun admin lain:

1. Daftar akun biasa di `/register`.
2. Jalankan `npx prisma studio`.
3. Buka tabel `users`, ubah kolom `role` akun itu menjadi `ADMIN`, lalu simpan.
4. Login di `/admin/login`.

## Cara menguji otorisasi

- Tanpa login, buka `/admin/dashboard`. Hasil: diarahkan ke `/admin/login`.
- Login sebagai USER, buka `/admin/dashboard`. Hasil: diarahkan ke `/`.
- Login sebagai ADMIN. Hasil: dashboard terbuka.
- Ubah role admin menjadi USER di Prisma Studio, lalu muat ulang `/admin/dashboard` tanpa logout. Hasil: ditolak, karena role dicek ulang ke database.

## Struktur folder

```
app/
  page.tsx                  halaman sementara (diganti landing page di tahap 6)
  login/  register/         login dan register USER
  admin/login/              login ADMIN
  admin/dashboard/          dashboard sementara (dilengkapi di tahap 11)
  api/auth/[...nextauth]/   route handler Auth.js
components/
  ui/                       Button, Input, Label
  auth/                     form login, form register, layout halaman auth
lib/
  actions/auth-actions.ts   server action register, login, logout
  auth/                     password (bcrypt), guards (otorisasi), redirect aman
  db/prisma.ts              Prisma Client
  validation/auth.ts        skema Zod
prisma/schema.prisma        model User, Event, Favorite
auth.config.ts              konfigurasi Auth.js yang aman untuk Edge
auth.ts                     provider Credentials (Prisma dan bcrypt)
middleware.ts               lapisan pertama proteksi route
```

## Cara menguji halaman publik

1. Publish minimal satu event lewat admin (kalau belum ada).
2. Buka `/`. Event yang statusnya PUBLISHED akan muncul di salah satu section, tergantung tanggalnya.
3. Buka `/events`, coba kombinasi filter kategori/kota/tanggal/harga/status, lalu klik "Terapkan filter".
4. Klik salah satu event, cek halaman detailnya: peta, tombol bagikan, dan link tiket (kalau diisi).
5. Coba akses `/events/slug-event-draft` untuk event berstatus DRAFT. Hasil: halaman 404.
6. Ubah status sebuah event jadi CANCELLED dari admin, buka halaman detailnya. Hasil: muncul banner "telah dibatalkan".

## Cara menguji favorit

1. Login sebagai USER biasa.
2. Di `/events` atau `/`, klik ikon hati pada sebuah event. Hasil: ikon terisi, dan event muncul di `/favorites`.
3. Klik ikon hati lagi untuk membatalkan. Hasil: event hilang dari `/favorites`.
4. Logout, lalu klik ikon hati pada event mana pun. Hasil: diarahkan ke `/login`.

## Cara menguji rate limiting

1. Di `/login`, masukkan email terdaftar dengan password salah 5 kali berturut-turut.
2. Percobaan ke-6: hasilnya pesan "Terlalu banyak percobaan", bukan "Email atau password salah", walau passwordnya benar sekalipun.
3. Tunggu 15 menit, atau restart `npm run dev`, untuk mencoba lagi.

## Cara menguji CRUD event

1. Login admin di `/admin/login`.
2. Buka `/admin/events/create`, isi form, simpan. Event baru muncul di `/admin/events` dengan status sesuai pilihan.
3. Coba buat event kedua dengan slug yang sama persis. Hasil: ditolak dengan pesan "Slug sudah dipakai".
4. Di tabel, buka menu titik tiga pada event: coba Publish, Unpublish, Batalkan, lalu Hapus. Setiap aksi menampilkan toast dan tabel langsung ter-update.
5. Edit sebuah event dan ubah judul atau tanggalnya. Hasil: perubahan tersimpan dan tampil di tabel.

## Catatan validasi

Kode ini sudah lolos type-check (`tsc`), lint (`eslint`), dan `next build`, serta memakai pola yang sama persis dengan modul autentikasi di checkpoint sebelumnya (yang sudah diuji end-to-end dengan PostgreSQL sungguhan). Modul event di checkpoint ini belum sempat diuji ulang dengan database sungguhan karena kendala jaringan di lingkungan kerja saya, jadi jalankan langkah "Cara menguji CRUD event" di atas begitu `npm run dev` jalan di laptop kamu, dan kabari kalau ada yang tidak sesuai.

## Keputusan keamanan

- Password di-hash dengan bcrypt (cost 12). Panjang maksimal 72 karakter, sesuai batas bcrypt.
- Role tidak pernah dibaca dari input form. Akun baru selalu USER.
- Middleware hanya lapisan pertama. Next.js versi lama bisa dilewati lewat header palsu (CVE-2025-29927, diperbaiki mulai 15.2.3). Karena itu setiap halaman dan aksi admin memanggil `requireAdmin` atau `requireAdminOrRedirect` di `lib/auth/guards.ts`, yang mengecek role langsung ke database.
- Pesan gagal login sama untuk email salah, password salah, dan akun non-admin di login admin. Waktu respons juga disamakan.
- `callbackUrl` hanya menerima path internal, untuk mencegah open redirect.
- Session memakai JWT selama 7 hari. Cookie otomatis `Secure` saat memakai HTTPS.
- Belum ada: rate limiting login (tahap 16).

## Catatan

- Auth.js v5 masih berlabel beta di npm. Versi dikunci ke `5.0.0-beta.32`.
- Sebelum deploy: buat `AUTH_SECRET` baru (`openssl rand -base64 32`), isi `AUTH_URL` dengan domain HTTPS, dan set `AUTH_TRUST_HOST=true` bila tidak memakai Vercel.
