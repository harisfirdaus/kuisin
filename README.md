
# Kuisin - Kuis Interaktif Real-Time

Platform kuis online interaktif berbasis web dengan dashboard admin, pengelolaan soal, sistem partisipan, leaderboard real-time, dan statistik hasil.

## Fitur Utama

### Fitur Admin
- **Sistem autentikasi admin:** Login menggunakan email & password (data admin dikelola di Supabase).
- **Manajemen Kuis:** Membuat, mengedit, dan menghapus kuis.
- **Manajemen Pertanyaan:** Input soal pilihan ganda, mengunggah gambar/media, menandai jawaban benar, dan atur bobot nilai.
- **Statistik & Monitoring:** Statistik peserta, leaderboard real-time, riwayat skor peserta, dan export data hasil.
- **Edge Functions:** Semua operasi CRUD penting pada data (kuis, pertanyaan, jawaban, partisipan) dijalankan lewat Edge Functions agar data penting tidak terekspos di frontend.

### Fitur Pengguna
- **Quick Join:** Ikut kuis tanpa registrasi, cukup input nama & kode kuis.
- **Antarmuka Kuis:** Timer per soal, animasi feedback jawaban.
- **Skor & Leaderboard:** Langsung tahu skor & ranking setelah selesai menjawab.
- **Hasil Akhir:** Total skor, posisi peringkat, review jawaban (benar/salah).

### Teknologi
- **Frontend:** React, TypeScript, TailwindCSS (Neo-Brutalism style), shadcn-ui, Vite.
- **Backend:** Supabase (database, Edge Functions, autentikasi admin), WebSocket untuk real-time updates.
- **Design:** Bold blue accent, high-contrast, thick black borders, hard shadows, intentionally "undesigned" look.

## Struktur Folder

- `src/pages`: Halaman utama (Landing, Join, Waitlist, Admin, Dashboard, dll).
- `src/components`: Komponen UI dan fungsional.
- `src/integrations/supabase`: Client Supabase JS.
- `supabase/functions`: Edge Functions untuk backend logic.
- `README.md`: Dokumentasi aplikasi dan pengembangan.

## Jalankan Lokal

1. **Clone repo:**  
   `git clone <YOUR_GIT_URL>`
2. **Install dependencies:**  
   `npm install`
3. **Jalankan aplikasi:**  
   `npm run dev`
4. **Preview:**  
   Aplikasi akan tersedia di `http://localhost:5173` (atau port Vite lainnya).

## Deployment & Domain

- Klik "Share" di dashboard lovable.dev untuk publish aplikasi.
- Hubungkan custom domain lewat menu Project > Settings > Domains.

## Catatan Keamanan

- Semua operasi sensitif (buat/edit hapus kuis/soal/jawaban) dilakukan via Edge Functions.
- Data penting tidak boleh diakses langsung dari frontend.

## Tim Pengembang

- Developed by [Haris Firdaus](https://www.threads.net/@harisfirda)

