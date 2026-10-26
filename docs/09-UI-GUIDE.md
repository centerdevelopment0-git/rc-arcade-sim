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
- Kontras teks minimal 4.5:1 terhadap latarnya, ikon dan tepi kontrol minimal 3:1. Teks di atas adegan 3D selalu di atas `.material`, kecuali angka kecepatan di bawah tengah yang memakai pelat gelap dan bayangan teks (bagian 5).

## 3. Tipografi

- Font sistem Apple: `-apple-system` (SF Pro) dengan cadangan `system-ui`, Roboto. Angka HUD memakai `ui-rounded` (SF Pro Rounded). Tanpa unduhan font.
- Skala mengikuti gaya teks iOS: 34 (judul besar), 28, 22, 20, 17 (isi dan tombol), 15, 13, 12. Pengecualian HUD: posisi 30, kecepatan `clamp(20px, 5.4vh, 32px)` (bagian 5), hitung mundur 120.
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

Prinsipnya: lintasan adalah isi utama. Kontrol menempel di sudut bawah, info di sudut atas, dan sepertiga tengah layar dibiarkan kosong supaya mobil dan jalan di depannya selalu terlihat.

```
+--------------------------------------------------------------+
| (2/3  Lap 1/2  0:37.22)                 (Boost 2.1 dtk)  (=) |
| (Skor 0) (Berikutnya G1)                                     |
| [peta mini]                                                  |
| (RC2 Cidi: siap)            (adegan 3D,        (Q)(E)(H)     |
|                              tengah kosong)          +-----+ |
| +----+ +----+                                  (REM) | GAS | |
| |  < | |  > |       D 11.5 km/j                      +-----+ |
|                     ==========-----                          |
+--------------------------------------------------------------+
(=) = tombol menu. Isinya: kamera, ganti RC, chat.
```

### Zona

- **Kiri atas:** posisi, lap, waktu dalam satu kapsul setinggi 44, lalu chip Skor dan Berikutnya, lalu peta mini 120 x 80. Pesan chat baru muncul di bawah peta mini selama 6 detik (maksimal 2 baris), tidak bisa disentuh.
- **Kanan atas:** tombol menu 44 x 44 di pojok. Sisa waktu power-up muncul di kirinya hanya saat aktif.
- **Bawah tengah:** kecepatan (digit gigi D/R, angka, km/j) dengan bar tipis di bawahnya, seperti game balap mobile. Tidak bisa disentuh. Ukuran dan transparansinya di tabel "Ukuran dari referensi game balap".
- **Kiri bawah:** belok kiri dan kanan. **Kanan bawah:** GAS (paling besar), REM di kirinya, skill di atas GAS.
- **Tengah:** tidak ada panel selain kecepatan di tepi bawah. Hitung mundur, toast, dan banner koneksi boleh muncul sebentar di atas tengah.

### Burger menu

Semua alat sekunder masuk ke satu menu di kanan atas, sesuai HIG ("secondary controls, like menus, at the top of the screen"). Isinya:

- HP: kode RC dan nama pemain di judul, kamera (Belakang / Kap mobil), Ganti RC, chat (riwayat dan kirim pesan).
- Laptop: tampilan (Arena / POV pemain), sakelar panel QR gabung, Traffic, Chat (pilihan disimpan di browser), Reset balapan. Tombol Mulai balapan tetap di luar karena itu aksi utama layar.

Menu dibuka sebagai sheet kaca di kanan dengan lapisan gelap di belakangnya. Saat menu terbuka, semua tombol yang sedang ditahan dilepas, jadi mobil tidak terus melaju. Escape atau ketuk di luar menutup menu. Enter di keyboard membuka menu dan langsung fokus ke kolom chat.

Yang tidak boleh masuk menu: GAS, REM, belok, skill, dan info balap. Itu dipakai tiap detik.

### Ukuran kontrol

Ukuran dihitung dari tinggi layar (`vh`) karena layar terkunci lanskap dan tinggi adalah sisi yang pendek. Setiap ukuran punya batas bawah dan atas (`clamp`). Token ada di `race3d.html` (`--steer`, `--gas-w`, `--gas-h`, `--brake`, `--skill`, `--gap`).

| Kontrol | Rumus | 360 tinggi (Android kecil) | 390 tinggi (iPhone 14) | 430 tinggi (iPhone Pro Max) |
|---|---|---|---|---|
| Belok kiri / kanan | `clamp(64px, 24vh, 96px)` | 86 | 94 | 96 |
| GAS (lebar x tinggi) | `clamp(72px, 22vh, 96px)` x `clamp(96px, 34vh, 136px)` | 79 x 122 | 86 x 133 | 95 x 136 |
| REM | `clamp(56px, 18vh, 72px)` | 65 | 70 | 72 |
| Skill (boost, shield, klakson) | `clamp(48px, 13vh, 52px)` | 48 | 51 | 52 |
| Menu, tutup, kirim chat | tetap | 44 | 44 | 44 |
| Jarak antar kontrol | tetap | 12 | 12 | 12 |
| Jarak dari tepi | `max(12px, safe-area)` | 12+ | 12+ | 12+ |

Semua dalam px CSS (= pt di iOS, kurang lebih = dp di Android).

### Dari mana angkanya

| Sumber | Yang kami ambil |
|---|---|
| Apple HIG, *Game controls* | Kontrol yang sering dipakai minimal 44 x 44 pt, kontrol jarang (menu) minimal 28 x 28 pt. Tombol penting dekat jempol, menu di atas. Jangan menutupi Home indicator dan Dynamic Island. Gerak di kiri. Sembunyikan kontrol yang sedang tidak relevan. Tanda tekan harus terlihat walau tertutup jari. |
| Material Design | Target sentuh minimal 48 x 48 dp (sekitar 9 mm), jarak antar target minimal 8 dp. Batas bawah kontrol kami (64 / 56 / 48) memenuhi ini. |
| Mobile Legends | Pola tata letak: joystick kiri bawah, cincin skill kanan bawah mengelilingi tombol serang yang paling besar, peta mini kiri atas, pengaturan dan chat jauh dari skill. Pemain bisa menskala tombol 100 sampai 150 persen; panduan pemain menyarankan skill 110 sampai 125 persen dan 135 sampai 150 persen di tablet. Artinya ukuran default tidak boleh lebih kecil dari yang kami pakai. |
| Game balap mobile (Asphalt, Mario Kart Tour, Horizon Chase) | Belok di kiri, gas atau nitro di kanan, info balap di dua sudut atas, tengah layar bebas untuk mobil. Mario Kart Tour dan Asphalt mode otomatis memakai area sentuh lebar, bukan tombol kecil. |

Perbandingan relatif yang kami pakai, diukur terhadap tinggi layar: tombol utama (GAS, belok) 24 sampai 35 persen, tombol sekunder (REM) sekitar 18 persen, skill sekitar 13 persen, menu sekitar 11 persen. Angka game komersial di atas adalah pola dari tangkapan layar dan panduan pemain, bukan spesifikasi resmi dari pembuatnya.

### Ukuran dari referensi game balap (diukur 2026-10-26)

Cidi memberi dua tangkapan layar game balap mobile komersial (lanskap). A: 1920 x 1080 dengan bar hitam atas-bawah, area game 1920 x 889 (rasio 2,16:1). B: 1333 x 600 (rasio 2,22:1). Angka di bawah diukur dari piksel, sebagai persen lebar (W) atau tinggi (H) area game. Alfa dihitung dari kecerahan elemen dibanding latar di sebelahnya, jadi perkiraan, bukan nilai resmi. Yang kita tiru hanya rasio, penempatan, dan transparansi; gambar dan ikon game itu tidak dipakai.

**Kecepatan dan bar (yang diimplementasikan):**

| Ukuran | A | B | Dipakai di sim |
|---|---|---|---|
| Posisi | bawah tengah, tengah bar di 50% W | sama | bawah tengah |
| Lebar bar | 26,0% W (500 px) | 25,7% W (342 px) | `min(26vw, 360px)` |
| Tinggi bar | 1,5% H | 1,7% H | `clamp(4px, 1.6vh, 8px)` |
| Jarak bar ke tepi bawah | 3,2% H | 3,2% H | `--sb` (12 px = 3,1% dari 390) |
| Tinggi angka (cap height) | 3,7% H | 3,7% H | font `clamp(20px, 5.4vh, 32px)` (cap sekitar 3,8% H) |
| Jarak angka ke bar | 1,5% H | 1,3% H | `clamp(4px, 1.4vh, 8px)` |
| Digit gigi di kiri angka | sekitar 0,75x tinggi angka, alfa sekitar 60% | sama | D atau R, `--label-2` |
| Isi bar | biru solid, alfa 100% | biru muda solid | `--accent`, berubah `--boost` saat boost aktif |
| Lintasan bar | hitam alfa sekitar 20% | hitam alfa sekitar 28% | `rgba(0,0,0,.28)` |
| Pelat di belakang angka | gelap, memudar ke samping, alfa sekitar 35 sampai 45% | sama | gradasi radial hitam 40% ke transparan |
| Bayangan teks | tipis gelap | tipis gelap | `0 1px 3px rgba(0,0,0,.6)` |

Isi bar = kecepatan / kecepatan maksimum mobil. Tanpa boost mobil dibatasi 80%, jadi bar penuh hanya saat boost. Satuan km/j tetap tampil kecil di kanan angka (bagian 8).

**Elemen lain (dicatat, belum diubah):**

| Elemen | A | B | Sim sekarang (tinggi 390) |
|---|---|---|---|
| Tombol belok (lingkaran) | diameter 30% H, jarak antar tepi 7,9% H, tepi kiri 5,3% W, tepi bawah 7,9% H | diameter 29,5% H, jarak 8,3% H, tepi kiri 4,4% W, tepi bawah 8% H | 94 px = 24% H, jarak 12 px |
| Cincin tombol belok | putih alfa 13 sampai 16%, tebal sekitar 0,5% H, isi hampir transparan (0 sampai 5%) | sama | bahan kaca `--material` |
| Panah di tombol belok | putih alfa sekitar 50%, tinggi sekitar 26% diameter | sama | putih 100%, 40% diameter |
| Tombol gas atau drift (kanan bawah) | diameter 26% H, cincin pudar alfa sekitar 15% | diameter 32% H, cincin putih alfa sekitar 95%, tebal 0,8% H, tepi kanan 3,6% W, tepi bawah 3,8% H | GAS 86 x 133 = 22 x 34% H |
| Skill utama (nitro) | diameter 18,6% H, cincin ganda putih alfa sekitar 85%, kiri atas tombol gas | diameter 15% H, isi biru gelap alfa sekitar 50% dengan cincin terang, diagonal kiri atas gas | 51 px = 13% H, berderet di atas GAS |
| Tombol kecil di bawah skill | diameter 11,8% H | tidak ada | REM 70 px = 18% H |
| Rasio skill : gas | 0,72 | 0,47 | 0,59 (terhadap lebar GAS) |
| Rasio belok : gas | 1,15 | 0,92 | 1,09 (terhadap lebar GAS) |
| Waktu (kiri atas) | tinggi angka 4,8% H, peringkat di bawahnya | tidak ada | kapsul 44 px, angka posisi 30 px |
| Peta mini | lingkaran kanan atas, diameter 37% H, cincin tipis alfa sekitar 15%, tanpa isi | tidak ada | kotak 120 x 80 kiri atas |
| Pengaturan dan kamera | ikon sekitar 6% H di pojok kanan atas, bertumpuk | tidak ada | satu tombol menu 44 px (PR #9) |
| Ping | teks sekitar 2,8% H, kiri bawah di bawah tombol belok | tidak ada | belum ada |

Pola transparansi di kedua referensi: kontrol yang ditahan terus (belok) paling pudar, cincin sekitar 15% dan panah sekitar 50%, supaya jalan di bawahnya tetap terlihat. Tombol aksi sesaat (nitro, gas di B) memakai cincin hampir putih penuh supaya mudah ditemukan. Angka kecepatan putih penuh di atas pelat gelap, bar memakai isi solid tanpa gradasi.

Yang sengaja tidak ditiru: tombol di bawah 44 pt (Apple) atau 48 dp (Material); tombol terkecil A (11,8% H) masih 46 px pada tinggi 390, jadi batas bawah `clamp` kita tetap berlaku. Pengaturan dan kamera tetap di satu burger menu.

### Aturan lain

- Hormati `env(safe-area-inset-*)` (dengan `viewport-fit=cover`).
- Layar balap terkunci lanskap: di portrait muncul lapisan "Putar HP ke lanskap". `maximum-scale=1` dipertahankan di layar ini saja agar cubit tidak memperbesar layar saat menyetir.
- Pemilih mobil berupa sheet: nama, tiga tile mobil (Tersedia atau Dipakai nama), dan cara main.
- Status koneksi selalu terlihat. Saat putus: "Koneksi putus. Menyambung ulang..."
- Tombol skill kosong tampak nonaktif (opasitas, angka 0), bukan hilang.
- Umpan balik tekan langsung (di bawah 100 ms): warna dan `scale(0.96)`. Toast berupa kapsul kaca di atas tengah, tanpa tanda seru. Getar hanya untuk skill aktif dan gerbang dilewati.

## 6. Dashboard laptop

Layar arena (`race3d.html` tanpa `?drive`): status kiri atas, tombol menu kanan atas, papan skor di bawah tombol menu, Mulai balapan kiri bawah, QR gabung kanan bawah. Traffic dan chat mati secara bawaan dan dinyalakan dari menu.

Dashboard koneksi (`monitor.html`):


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
9. Gradasi warna sebagai hiasan. Bar kecepatan berisi warna solid; pelat gelap di belakang angka kecepatan boleh bergradasi karena fungsinya menjaga kontras di atas adegan 3D.
10. Kartu identik dengan radius dan bayangan sama untuk semua isi, termasuk yang bukan ringkasan.
11. Animasi fade-dan-naik di setiap panel atau hover di setiap kartu.
12. Teks pengisi ("Selamat datang di pengalaman balap terbaik!"), data palsu, atau lorem ipsum yang tertinggal.
13. Semua isi rata tengah.

## 10. Cek sebelum push

1. Buka di HP lanskap (atau Playwright 844 x 390) dan laptop 1280 x 800, lihat setiap keadaan: memilih mobil, menunggu, hitung mundur, balapan, skill aktif, koneksi putus, finis.
2. Jalankan `/make-interfaces-feel-better quick` dan `/web-interface-guidelines` pada file yang berubah; perbaiki temuan HIGH.
3. Cocokkan dengan daftar di bagian 9.
4. `npm test`, lalu `/ponytail-review`.
