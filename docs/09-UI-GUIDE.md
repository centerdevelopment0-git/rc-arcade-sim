# Panduan UI

Acuan tampilan untuk `race3d.html` (HP pemain dan layar arena) dan `monitor.html` (dashboard laptop). Skill desain di `.claude/skills/` memakai dokumen ini sebagai brief: jika skill dan dokumen ini berbeda, dokumen ini yang menang.

Referensi visual: tampilan arcade gaya Horizon Chase (kamera kejar, tombol besar), konsep "Lapangan" dari Cidi (status bar, peta mini, chat, kontrol, tombol skill), dan dashboard koneksi laptop. Versi aplikasi Flutter ada di repo krca, `docs/design/ui-guide.md`, dengan token yang sama.

## 1. Karakter

- **Layar balap (HP):** alat kontrol saat mobil bergerak. Pemain melirik, tidak membaca. Angka besar, tombol besar, sedikit teks.
- **Dashboard (laptop):** alat kerja operator. Padat, rata kiri, mudah dipindai. Tidak perlu hiasan.
- Satu hal yang boleh menonjol per layar. Di HP itu posisi dan kecepatan; di dashboard itu status mobil yang bermasalah.

## 2. Token warna

Semua hex di bawah sudah dipakai di `race3d.html` dan `monitor.html`, tetapi baru sebagian yang punya variabel di `:root`, dan namanya belum seragam (`monitor.html` memakai `--in`, `--out`, `--bad`, dan `--panel` untuk `#1a1d24`). Saat menyentuh sebuah bagian, ganti hex di bagian itu dengan variabel dari tabel ini. Jangan menulis hex baru.

| Token | Hex | Arti |
|---|---|---|
| `--bg` | `#0f1115` | Latar halaman |
| `--surface` | `#1a1d24` | Kartu, panel pilih mobil |
| `--surface-2` | `#20242e` | Tombol, input, baris tabel |
| `--panel` | `rgba(20,23,30,.82)` | Panel HUD di atas adegan 3D |
| `--edge` | `#2a2e37` | Garis pemisah, tepi input |
| `--text` | `#e8eaed` | Teks utama |
| `--muted` | `#9aa0b0` | Teks sekunder, label |
| `--accent` | `#3f84d6` | Aksi biasa, input masuk (LED biru) |
| `--ok` | `#2ee98b` | GAS, gerbang berikutnya, status sehat |
| `--danger` | `#ff6b6b` | REM, error, RTT buruk |
| `--rank` | `#ffd23f` | Posisi, lap, pengumuman penting |
| `--warn` | `#ffb454` | Peringatan, output ke mobil (LED oranye) |
| `--boost` | `#ffb020` | Power-up boost |
| `--shield` | `#4fc3ff` | Power-up shield |

Warna mobil: RC1 `#3f84d6`, RC2 `#2ee98b`, RC3 `#ff8a3d`.

Aturan:

- Warna selalu membawa arti dari tabel di atas. Warna yang sama tidak boleh berarti dua hal di satu layar.
- Warna tidak boleh jadi satu-satunya penanda. Tombol REM tetap bertulisan REM, status RTT tetap menampilkan angka.
- Kontras teks minimal 4.5:1 terhadap latarnya, ikon dan tepi tombol minimal 3:1. Teks di atas adegan 3D selalu di atas `--panel` atau memakai bayangan teks.

## 3. Tipografi

- Font: `system-ui` (sudah dipakai). Tanpa unduhan font di M1.
- Skala: 12, 14, 16, 20, 28, 54 px. Angka 54 hanya untuk posisi di HUD.
- Semua angka yang berubah (kecepatan, waktu lap, skor, RTT, pesan/detik) memakai `font-variant-numeric: tabular-nums` agar tidak bergeser.
- Bobot: 400 untuk teks, 600 untuk label tombol, 800 untuk angka HUD. Maksimal tiga bobot.
- Kalimat biasa (sentence case). Huruf kapital hanya untuk label tombol pendek (GAS, REM) dan kode mobil (RC1).

## 4. Spasi dan sudut

- Spasi kelipatan 4: 4, 8, 12, 16, 24, 32 px.
- Sudut tiga tingkat: 8 px (input, chip), 12 px (tombol), 16 px (panel, kartu). Elemen di dalam panel memakai `radius luar = radius dalam + padding`.
- Bayangan hanya untuk elevasi di atas adegan 3D. Di dashboard, pemisah memakai garis `--edge`.

## 5. Layar balap HP (lanskap)

```
+----------------------------------------------------------+
| 1/2  LAP 1/2  0:02.07          [RTT]        11.5 km/j    |
| [peta mini]                       [Kap mobil] [Ganti RC] |
|                                                          |
|                    (adegan 3D)            (skill)(skill)(skill)
|                                                  +-----+ |
| +----+ +----+   [ chat .................. ]  [REM] | GAS | |
| | ◀  | | ▶  |                                    +-----+ |
+----------------------------------------------------------+
```

- Ukuran sentuh minimal 48 x 48 px; GAS, REM, ◀ ▶ jauh lebih besar dan tidak saling tumpang tindih. Jarak antar tombol minimal 8 px.
- Tombol di zona jempol: arah di kiri bawah, GAS dan REM di kanan bawah, skill di atas GAS.
- Hormati `env(safe-area-inset-*)` agar tidak tertutup notch dan bar navigasi.
- Status koneksi (RTT, menyambung ulang, E-stop) selalu terlihat. Saat koneksi putus, tampilkan apa yang terjadi dan apa yang sedang dilakukan, misalnya "Koneksi putus. Menyambung ulang..."
- Tombol skill kosong tampak nonaktif (opasitas, tanpa angka), bukan hilang. Slot terisi menampilkan ikon power-up dan warnanya.
- Umpan balik tekan langsung (di bawah 100 ms): perubahan warna dan `scale(0.96)`. Getar (`navigator.vibrate`) hanya untuk skill aktif dan gerbang dilewati.
- Portrait: tampilkan ajakan memutar HP (sudah ada `#rotate`).

## 6. Dashboard laptop

- Rata kiri, tabel untuk data per mobil dan per klien. Angka rata kanan dengan `tabular-nums`.
- Kartu ringkasan boleh, tetapi hanya untuk angka yang memang dipantau (fase, pengemudi, pesan/detik).
- Yang bermasalah harus menonjol: baris mobil tanpa input atau RTT tinggi diberi `--danger`, sisanya tenang.

## 7. Gerak

- Gerak hanya untuk menjawab aksi pemain (tekan, skill aktif, gerbang dilewati) dan untuk satu momen besar: lampu start dan finis.
- Tanpa animasi masuk di setiap panel, tanpa animasi berulang yang dekoratif.
- `transition` menyebut properti yang dianimasikan, tidak pernah `all`. Durasi 100 sampai 200 ms, `ease-out`.
- Hormati `prefers-reduced-motion`: matikan goyang kamera dan animasi skala.

## 8. Teks antarmuka

- Bahasa Indonesia, kalimat pendek, kata kerja di tombol ("Ganti RC", "Kirim").
- Satu nama untuk satu hal di seluruh aplikasi: pemain melihat "RC1", bukan "car1".
- Satuan: km/j, ms, detik.
- Pesan error menyebut apa yang terjadi dan apa yang bisa dilakukan, tanpa minta maaf dan tanpa tanda seru.
- Periksa teks baru dengan skill `humanizer`.

## 9. Tanda AI slop yang harus dihindari

Beberapa sudah ada di UI sekarang (ditandai *ada*). Perbaiki saat menyentuh bagian itu, bukan dengan merombak semuanya sekaligus.

1. **Emoji sebagai ikon** di tombol, judul, dan toast (⚡ 🛡️ 📣 🎥 🔄 📡). *Ada.* Ganti dengan satu set ikon SVG yang konsisten (garis, bukan isi; isi hanya untuk keadaan aktif).
2. **String meta dengan titik tengah dan panah**, misalnya "RC1 · Skor 0 · → G1". *Ada.* Pisahkan jadi elemen dengan label sendiri.
3. **Em dash di judul**, misalnya "Dashboard Koneksi — Balapan 3D". *Ada.* Pakai judul pendek.
4. **Label HURUF KAPITAL berjarak di atas setiap bagian** ("PETA KONEKSI", "STATUS PER MOBIL"). *Ada.* Judul bagian biasa sudah cukup.
5. **Sudut tumpul acak** (2, 3, 5, 7, 8, 9, 10, 12, 14 px). *Ada.* Pakai tiga tingkat di bagian 4.
6. **Glow neon** sebagai hiasan (`box-shadow` bercahaya di skill aktif). *Ada.* Keadaan aktif cukup dengan warna isi dan ikon terisi.
7. **Hex di luar token** dan lebih dari satu warna aksen untuk arti yang sama.
8. **Tanda seru di toast** ("aktif!", "klakson!"). *Ada.*
9. Gradasi warna sebagai hiasan. Gradasi di bar kecepatan boleh karena membawa arti (aman ke bahaya).
10. Kartu identik dengan radius dan bayangan sama untuk semua isi, termasuk yang bukan ringkasan.
11. Animasi fade-dan-naik di setiap panel atau hover di setiap kartu.
12. Teks pengisi ("Selamat datang di pengalaman balap terbaik!"), data palsu, atau lorem ipsum yang tertinggal.
13. Semua isi rata tengah.

## 10. Cek sebelum push

1. Buka di HP lanskap (atau Playwright 844 x 390) dan laptop 1280 x 800, lihat setiap keadaan: memilih mobil, menunggu, hitung mundur, balapan, skill aktif, koneksi putus, finis.
2. Jalankan `/make-interfaces-feel-better quick` dan `/web-interface-guidelines` pada file yang berubah; perbaiki temuan HIGH.
3. Cocokkan dengan daftar di bagian 9.
4. `npm test`, lalu `/ponytail-review`.
