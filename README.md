# 🕹️ RC Arcade Sim

Simulasi cloud untuk arcade mobil RC. Alur yang dibuktikan:
**HP (setir) → server (cloud) → mobil bergerak**, dalam balapan 3D multiplayer
(3 mobil = 3 mobil RC fisik pilot).
Karya **orisinal** (terinspirasi konsep, bukan clone app mana pun).

> Mobilnya sekarang **simulasi 3D**. Nanti tinggal diganti RC car fisik
> tanpa mengubah server/HP — lihat [docs/05-ROADMAP.md](docs/05-ROADMAP.md).

---

## 🌍 Tes dari kantor & rumah (cara paling mudah: GitHub Codespaces)

Gratis, **tanpa kartu kredit**, cukup akun GitHub. Jalan dari browser mana pun —
laptop kantor atau rumah — dan HP bisa ikut lewat QR. Kuota gratis ±60 jam/bulan
(mesin 2-core); Codespace otomatis berhenti setelah 30 menit tidak dipakai.

**Tiap kali mau tes:**
1. Buka repo di GitHub → tombol hijau **Code** → tab **Codespaces** →
   **Create codespace on main** (kali berikutnya: pilih codespace yang sudah ada).
2. Tunggu ±1–2 menit. Server menyala sendiri dan tab browser baru terbuka ke
   halaman depan (alamatnya mirip `https://<nama>-3000.app.github.dev/`).
   Kalau tab tidak terbuka: tab **PORTS** di bawah → klik ikon 🌐 di port 3000.
3. Laptop: klik **Layar arena**. HP: scan **QR RC1/RC2/RC3** di halaman depan → langsung menyetir mobil itu.
4. Selesai tes: tutup tab saja (atau **Stop codespace** biar kuota hemat).

**Kode terbaru otomatis:** tiap Codespace menyala, ia menjalankan `git pull` dari GitHub lalu
menyalakan server. Kalau Codespace sedang jalan dan ada PR baru yang di-merge, cukup ketik di terminal:
```bash
npm run update     # git pull + npm ci (kalau perlu) + restart server
```
lalu refresh halaman di browser dengan **Ctrl+Shift+R**.

> Kalau HP diminta login GitHub, port belum publik: di tab **PORTS** klik kanan
> port 3000 → **Port Visibility → Public**. Log server: `cat /tmp/rc-server.log`.

### Alternatif: Render (server selalu online, butuh akun Render)

Deploy sekali ke **Render (gratis)**, lalu cukup buka satu URL dari browser mana pun —
laptop kantor, laptop rumah, atau HP pakai data seluler. Tidak perlu install apa-apa.

**Setup sekali (±5 menit):**
1. Login ke [render.com](https://render.com) pakai akun GitHub.
2. **New → Blueprint** → pilih repo `rc-arcade-sim`, branch `main` → **Apply**.
   Render membaca [`render.yaml`](render.yaml) otomatis (plan free, health check `/healthz`).
3. Tunggu build selesai → dapat URL, mis. `https://rc-arcade-sim.onrender.com`.

**Tiap kali mau tes (kantor atau rumah, sama saja):**
1. Laptop: buka `https://<url-kamu>/race3d.html` (layar arena).
2. HP: scan **QR RC1/RC2/RC3** di halaman depan `https://<url-kamu>/`.
3. Tekan GAS + ◀ ▶ di HP → mobil 3D bergerak.
4. Opsional, isi RC yang kosong dengan bot dari laptop mana pun:
   `node bot.js 1 wss://<url-kamu>/race`

> Catatan plan free: server **tidur** setelah ±15 menit tanpa pengunjung.
> Pembukaan pertama sesudahnya butuh ±30–60 detik (halaman akan menyambung sendiri).
> Setiap `git push` ke `main` → otomatis deploy ulang.

---

## 🏁 Balapan 3D (simulasi sebelum mobil fisik)

Arena 3D skala RC sungguhan (12 × 8 m, 3 mobil = 3 mobil fisik pilot). HP melihat dari
**kamera di belakang mobil** (gaya game arcade); tombol 🎥 ganti ke **kamera kap mobil**,
persis seperti kamera mobil fisik nanti.

1. Laptop: buka halaman depan → **Layar arena** (arena dari atas, papan skor, traffic monitor, chat, QR).
   Tombol **🎥 Lihat POV 3 pemain** = kisi 2×2: arena + kamera POV RC1, RC2, RC3 sekaligus
   (langsung: `…/race3d.html?view=pov`).
2. HP 1 & HP 2 (landscape): scan QR **RC1** dan **RC2** di halaman depan → langsung masuk mobil itu.
   Atau buka `…/race3d.html?drive` → isi nama → pilih RC. Tombol **🔄 Ganti RC** = pindah mobil kapan saja.
   Mobil ke-3 bisa disetir dari tab laptop lain (W/S gas, A/D belok, Q/E skill, H klakson, Enter chat).
3. Tampilan HP: posisi, LAP & waktu besar di kiri atas + peta mini, kecepatan + bar di kanan atas,
   **◀ ▶** kiri bawah, pedal **GAS** (dan REM/mundur) kanan bawah, tombol skill (⚡ boost, 🛡️ shield,
   📣 klakson) di atas gas, chat di bar bawah. Multitouch: belok + gas + skill boleh ditekan bersamaan.
4. **📡 Dashboard koneksi** (`/monitor.html`): per mobil terlihat INPUT dari HP dan OUTPUT yang
   benar-benar diterapkan ke mobil, plus diagnosis kalau input masuk tapi mobil tidak bergerak.
5. Sebelum mulai = latihan bebas. Klik **▶ Mulai balapan** di laptop → hitung mundur → 2 lap.
6. Lewati gerbang berurutan (gerbang berikutnya **hijau**): +10 per gerbang, +50 per lap,
   bonus finish 100/60/30. Gerbang ⚡/🛡️ mengisi slot power-up; tekan tombol skill untuk memakainya.
   Pemenang = **skor tertinggi** (bonus finish ikut dihitung). Balapan selesai saat semua mobil finish atau 5 menit.

Detail rancangan & cara mobil fisik memakai logika yang sama: [docs/08-SIM-3D.md](docs/08-SIM-3D.md).

## 🚀 Cara menjalankan lokal (3 langkah)

```bash
cd rc-arcade-sim
npm install     # sekali saja
npm start
```

Server akan mencetak alamatnya, contoh:
```
Layar laptop  : http://localhost:3000/race3d.html
Dashboard     : http://localhost:3000/monitor.html
HP (WiFi sama): http://10.61.190.8:3000/race3d.html?drive
```

Lalu:
1. **Di laptop**: buka `http://localhost:3000/` → klik **Layar arena**.
2. **Di HP** (WiFi yang sama): scan QR RC1/RC2/RC3 di halaman depan.
3. **Tekan GAS + ◀ ▶ di HP** → mobil 3D bergerak. 🎉

Tidak punya 2 perangkat? Buka `race3d.html` dan `race3d.html?drive` di dua tab — setir pakai WASD.
Jaringan kantor sering memblokir akses antar perangkat di WiFi; kalau HP tidak bisa
membuka alamat laptop, pakai cara **Render** di atas.

## ✅ Uji otomatis
```bash
npm test     # aturan balapan + server asli: input HP → output ke mobil, ganti RC, mobil fisik, chat, dll
```
Tes yang sama jalan otomatis di GitHub Actions tiap push / PR.

---

## 📂 Isi
```
server.js           Penyaji halaman + WebSocket /race (satu-satunya jalur)
race-server.js      Room balapan 3D (server authoritative): input HP → mobil sim / RC fisik
shared/             Logika balapan bersama (arena, fisika, skor) — dipakai sim & mobil fisik
public/
  index.html        Halaman depan + QR per RC
  race3d.html       Balapan 3D: layar arena (laptop) & mode setir HP (?drive, ?drive&car=car1)
  monitor.html      Dashboard koneksi: input & output per mobil, RTT, beban
bot.js              Pengemudi otomatis untuk RC yang kosong (node bot.js 2)
test/               Uji otomatis (npm test)
render.yaml         Blueprint deploy Render (gratis)
docs/               Dokumen proyek (PRD, arsitektur, protokol, dll) — baca docs/README.md
```

## 📚 Dokumentasi
Semua dokumen ada di **[docs/](docs/README.md)** — mulai dari situ:
PRD, Arsitektur, Protokol pesan, analisis RE app acuan, Roadmap, Backlog fitur, Test plan.

## 🔌 Langkah berikutnya
- Akun/login, antrian & waktu sesi → [docs/05-ROADMAP.md](docs/05-ROADMAP.md) Fase 2.
- Hubungkan RC car fisik (ESP32) + video live → Fase 3.
- Tambah/buang fitur → [docs/06-BACKLOG.md](docs/06-BACKLOG.md).
