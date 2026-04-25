# Panduan Deployment GameTopup (Next.js + Midtrans + Firebase)

Aplikasi ini dibangun menggunakan tumpukan teknologi modern yang siap dipakai untuk bisnis (bukan sekedar prototype):
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore (Secure dengan Firebase Admin)
- **Payment Gateway**: Midtrans (QRIS, VA, E-Wallet)

## PENGATURAN ENVIRONMENT (Wajib dilakukan)

Sebelum bisa digunakan, Anda harus mengisi `.env` / env variables pada server Anda.

```env
# 1. Kunci Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-XXXXX" # Dari Dashboard Midtrans -> Settings -> Access Keys
MIDTRANS_SERVER_KEY="SB-Mid-server-XXXXX" # Pastikan dirahasiakan!

# 2. Firebase Admin (Untuk keamanan transaksi backend)
# Buka Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
# Copy seluruh JSON file yang di-download dan jadikan SATU BARIS string (minify), lalu paste di sini:
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

---

## CARA MEMULA DI LOKAL (Development)

1. Pastikan Node.js terinstall.
2. Clone/download kode sumber ini.
3. Buka terminal di folder project, jalankan:
   ```bash
   npm install
   ```
4. Copy file `.env.example` menjadi `.env` dan isi nilai-nilainya seperti di atas.
5. Jalankan server:
   ```bash
   npm run dev
   ```
6. Buka `http://localhost:3000`
7. Buka `http://localhost:3000/admin` lalu tekan tombol **Seed Games & Products Data** untuk mengisi database Firestore.

---

## CARA DEPLOY KE PRODUCTION (Vercel)

Vercel adalah platform terbaik untuk Next.js.

1. Buat akun di [Vercel](https://vercel.com).
2. Push kode ini ke **GitHub**.
3. Di Vercel, pilih **Add New Project** -> Import dari GitHub.
4. Pada bagian **Environment Variables**, masukkan semua variabel yang ada di atas:
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - `MIDTRANS_SERVER_KEY`
   - `FIREBASE_SERVICE_ACCOUNT`
5. Klik **Deploy**.
6. Setelah berhasil, Anda akan mendapatkan URL Vercel (misal: `agametopup.vercel.app`).

### Setel Webhook Payment Gateway (Midtrans)

Agar pesanan pengguna yang asalnya *Pending* berubah otomatis menjadi *Paid* saat mereka bayar:
1. Buka [Dashboard Midtrans](https://dashboard.midtrans.com).
2. Masuk ke menu **Settings** -> **Configuration**.
3. Isi kolom **Payment Notification URL** dengan:
   `https://[DOMAIN-ANDA]/api/webhooks/midtrans`
4. Simpan. Selesai!

### Menghubungkan Domain Sendiri (Custom Domain)
1. Di Dashboard Vercel project Anda, masuk ke **Settings** -> **Domains**.
2. Masukkan domain Anda (misal: `topupku.com`).
3. Vercel akan memberikan Name Server (NS) atau A record / CNAME.
4. Buka provider domain Anda (Niagahoster, Hostinger, Exabytes, dll).
5. Masuk ke pengaturan DNS, tambahkan CNAME / A record sesuai instruksi Vercel.
6. Tunggu propogasi +- 1-6 jam. Website Anda live!

---

## Catatan Penting

- **Mode Sandbox vs Production Midtrans**: Jika Anda sudah siap go-live dan menerima uang beneran, pastikan mengganti `isProduction: false` menjadi `true` di file `lib/midtrans.ts`, serta ganti Midtrans Key Anda ke mode Production.
- **Security Rules Firebase**: Kami telah menggunakan sistem Next.js Backend (server) untuk membuat transaksi. Artinya hacker di browser TIDAK BISA memalsukan / mengubah harga top-up di Firestore, karena Firebase Firestore Rules telah melindungi tabel `transactions` dari klien.
