# Panduan UI

Acuan tampilan untuk `index.html` (beranda), `race3d.html` (HP pemain dan layar arena), dan `monitor.html` (dashboard laptop). Token dan komponen bersama ada di `public/ui.css`, ikon di `public/icons.svg`. Skill desain di `.claude/skills/` memakai dokumen ini sebagai brief: jika skill dan dokumen ini berbeda, dokumen ini yang menang.

Referensi visual: tampilan arcade gaya Horizon Chase (kamera kejar, tombol besar), konsep "Lapangan" dari Cidi (status bar, peta mini, chat, kontrol, tombol skill), dan dashboard koneksi laptop. Versi aplikasi Flutter ada di repo krca, `docs/design/ui-guide.md`, dengan token yang sama.

## 1. Arah: Apple Human Interface Guidelines

Sejak 2026-10-26 Cidi meminta tampilan "seolah-olah aplikasi ini diluncurkan Apple". Artinya kita mengikuti tiga prinsip HIG:

- **Kejelasan:** teks terbaca di setiap ukuran, ikon tepat makna, satu fungsi per kontrol.
- **Mengalah pada isi (deference):** adegan 3D dan angka balap adalah isinya. Panel memakai bahan kaca (blur) tipis, bukan kotak tebal.
- **Kedalaman:** lapisan terlihat dari bahan dan bayangan halus, bukan dari garis tepi dan glow.

Karakter per layar tetap:

- **Layar balap (HP):** alat kontrol saat mobil bergerak. Pemain melirik, tidak membaca. Angka besar, tombol besar, sedikit teks.
- **Beranda dan dashboard (laptop):** gaya aplikasi Pengaturan dan Xcode Organizer. Judul besar, daftar inset grouped, rata kiri.
- Satu hal yang boleh menonjol per layar. Di HP itu posisi dan kecepatan; di dashboard itu mobil yang bermasalah.

## 2. Token warna

Satu sumber: `public/ui.css`. Halaman tidak menulis hex sendiri; JavaScript yang butuh warna nyata (three.js, canvas) membaca token lewat `getComputedStyle`. Warna mengikuti warna sistem Apple dan punya versi terang dan gelap. Beranda dan dashboard mengikuti `prefers-color-scheme`; layar balap selalu gelap (`data-theme="dark"`).

| Token | Terang | Gelap | Arti |
|---|---|---|---|
| `--bg` | `#f2f2f7` | `#000000` | Latar halaman |
| `--surface` | `#ffffff` | `#1c1c1e` | Kartu, baris daftar, sheet |
| `--surface-2` | `#e5e5ea` | `#2c2c2e` | Sel di dalam kartu |
| `--fill` | abu 16% | abu 32% | Tombol abu, input, badge |
| `--separator` | | | Garis pemisah 0,5 px |
| `--label`, `--label-2`, `--label-3` | | | Teks utama, sekunder, tersier |
| `--material` | | | Bahan kaca untuk panel di atas adegan 3D |
| `--accent` (biru) | `#007aff` | `#0a84ff` | Aksi biasa, input masuk |
| `--ok` (hijau) | `#34c759` | `#30d158` | GAS, gerbang berikutnya, status sehat |
| `--danger` (merah) | `#ff3b30` | `#ff453a` | REM, error, RTT buruk |
| `--warn` (oranye) | `#ff9500` | `#ff9f0a` | Menyambung ulang, output ke mobil |
| `--boost` (kuning) | `#ffcc00` | `#ffd60a` | Power-up boost |
| `--shield` (sian) | `#32ade6` | `#64d2ff` | Power-up shield |

Warna mobil: `--rc1` biru, `--rc2` hijau, `--rc3` oranye. Warna dunia 3D (lantai, dinding, rintangan, tiang gerbang) bukan token UI dan boleh tetap di kode adegan.

Aturan:

- Warna selalu membawa arti dari tabel di atas. Warna tidak boleh jadi satu-satunya penanda: tombol REM tetap bertulisan REM, RTT tetap berangka.
- Kontras teks minimal 4.5:1 terhadap latarnya, ikon dan tepi kontrol minimal 3:1. Teks di atas adegan 3D selalu di atas `.material`.

## 3. Tipografi

- Font sistem Apple: `-apple-system` (SF Pro) dengan cadangan `system-ui`, Roboto. Angka HUD memakai `ui-rounded` (SF Pro Rounded). Tanpa unduhan font.
- Skala mengikuti gaya teks iOS: 34 (judul besar), 28, 22, 20, 17 (isi dan tombol), 15, 13, 12. Pengecualian HUD: posisi 54, kecepatan 44, hitung mundur 120.
- Semua angka yang berubah memakai `font-variant-numeric: tabular-nums`.
- Bobot 400, 600, 700/800 (angka besar dan judul). Maksimal tiga per layar.
- Kalimat biasa. Huruf kapital hanya untuk GAS, REM, dan kode mobil (RC1). Judul bagian tidak memakai huruf kapital berjarak.

## 4. Spasi, sudut, dan sentuhan

- Spasi kelipatan 4: 4, 8, 12, 16, 20, 24, 32 px.
- Sudut: `--r-sm` 8 (ikon tile, QR, badge), `--r-md` 12 (input, baris, sel), `--r-lg` 20 (kartu, panel, sheet), dan kapsul penuh untuk tombol dan chip. Tidak ada nilai lain.
- Target sentuh minimal 44 x 44 pt (Apple). Kontrol balap jauh lebih besar.
- Bayangan dan bahan kaca hanya untuk lapisan di atas adegan 3D. Di halaman biasa, kartu dibedakan dari latar oleh warna, pemisah oleh garis 0,5 px.
- Ikon: satu sprite `public/icons.svg` bergaya SF Symbols (garis 2 px, ujung bulat), dipakai dengan `<svg class="i"><use href="/icons.svg#nama"/></svg>`. Isi hanya untuk keadaan aktif (`.on`). Ikon di elemen yang ditulis ulang tiap frame harus lewat `setText` agar tidak hilang.

## 5. Layar balap HP (lanskap)

```
+----------------------------------------------------------+
| 1/2  LAP 1/2  0:02.07          [RTT]        11.5 km/j    |
| [peta mini]                       [Kap mobil] [Ganti RC] |
|                                                          |
|                    (adegan 3D)            (skill)(skill)(skill)
|                                                  +-----+ |
| +----+ +----+   [ chat .................. ]  [REM] | GAS | |
| |  < | |  > |                                    +-----+ |
+----------------------------------------------------------+
```

- Ukuran sentuh minimal 44 x 44 px; GAS, REM, tombol belok jauh lebih besar dan tidak saling tumpang tindih. Jarak antar tombol minimal 8 px.
- Tombol di zona jempol: arah di kiri bawah, GAS dan REM di kanan bawah, skill di atas GAS.
- Hormati `env(safe-area-inset-*)` (dengan `viewport-fit=cover`) agar tidak tertutup notch dan bar navigasi.
- Layar balap terkunci lanskap: di portrait muncul lapisan "Putar HP ke lanskap". `maximum-scale=1` dipertahankan di layar ini saja agar cubit tidak memperbesar layar saat menyetir.
- Pemilih mobil berupa sheet: nama, tiga tile mobil (Tersedia atau Dipakai nama), dan cara main.
- Status koneksi (RTT, menyambung ulang, E-stop) selalu terlihat. Saat koneksi putus, tampilkan apa yang terjadi dan apa yang sedang dilakukan, misalnya "Koneksi putus. Menyambung ulang..."
- Tombol skill kosong tampak nonaktif (opasitas, tanpa angka), bukan hilang. Slot terisi menampilkan ikon power-up dan warnanya.
- Umpan balik tekan langsung (di bawah 100 ms): perubahan warna dan `scale(0.96)`. Toast berupa kapsul kaca di atas tengah, dengan ikon dan tanpa tanda seru. Getar (`navigator.vibrate`) hanya untuk skill aktif dan gerbang dilewati.
- Portrait: tampilkan ajakan memutar HP (sudah ada `#rotate`).

## 6. Dashboard laptop

- Judul besar, ringkasan di kartu, kartu per mobil berisi daftar label dan nilai, tabel klien. Rata kiri. Angka rata kanan dengan `tabular-nums`.
- Kartu ringkasan boleh, tetapi hanya untuk angka yang memang dipantau (fase, pengemudi, pesan/detik).
- Yang bermasalah harus menonjol: baris mobil tanpa input atau RTT tinggi diberi `--danger`, sisanya tenang.

## 7. Gerak

- Kurva `cubic-bezier(.2,.8,.2,1)` (`--ease`), mirip pegas tanpa pantulan.
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

Redesign Apple (2026-10-26) sudah membersihkan semua yang dulu ditandai *ada*. Jangan memasukkannya lagi.

1. **Emoji sebagai ikon** di tombol, judul, dan toast (⚡ 🛡️ 📣 🎥 🔄 📡). Pakai `icons.svg`.
2. **String meta dengan titik tengah dan panah**, misalnya "RC1 · Skor 0 · → G1". Pisahkan jadi elemen dengan label sendiri.
3. **Em dash di judul**, misalnya "Dashboard Koneksi — Balapan 3D". Pakai judul pendek.
4. **Label HURUF KAPITAL berjarak di atas setiap bagian** ("PETA KONEKSI", "STATUS PER MOBIL"). Judul bagian biasa sudah cukup.
5. **Sudut tumpul acak** (2, 3, 5, 7, 8, 9, 10, 12, 14 px). Pakai token sudut di bagian 4.
6. **Glow neon** sebagai hiasan (`box-shadow` bercahaya di skill aktif). Keadaan aktif cukup dengan warna isi dan ikon terisi.
7. **Hex di luar token** dan lebih dari satu warna aksen untuk arti yang sama.
8. **Tanda seru di toast** ("aktif!", "klakson!").
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
