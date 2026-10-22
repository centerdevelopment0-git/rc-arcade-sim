# 🕹️ RC Arcade Sim

Simulasi cloud untuk arcade mobil RC. Alur yang dibuktikan:
**HP (kontroler) → server (cloud) → mobil bergerak**, lengkap dengan telemetry balik.
Karya **orisinal** (terinspirasi konsep, bukan clone app mana pun).

> Mobilnya sekarang **simulasi di layar**. Nanti tinggal diganti RC car fisik
> tanpa mengubah server/kontroler — lihat [docs/05-ROADMAP.md](docs/05-ROADMAP.md).

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
3. Laptop: klik **Arena**. HP: scan **QR** di halaman depan → kontroler terbuka.
4. Selesai tes: tutup tab saja (atau **Stop codespace** biar kuota hemat).

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
1. Laptop: buka `https://<url-kamu>/arena.html?n=5` (layar mobil).
2. HP: scan **QR** di halaman depan `https://<url-kamu>/` → kontroler terbuka.
3. Geser gas/belok di HP → mobil di arena bergerak.
4. Opsional, isi arena dengan mobil otomatis dari laptop mana pun:
   `node bot.js 3 wss://<url-kamu>`

> Catatan plan free: server **tidur** setelah ±15 menit tanpa pengunjung.
> Pembukaan pertama sesudahnya butuh ±30–60 detik (halaman akan menyambung sendiri).
> Setiap `git push` ke `main` → otomatis deploy ulang.

---

## 🏁 Balapan 3D (simulasi sebelum mobil fisik)

Arena 3D skala RC sungguhan (12 × 8 m, 3 mobil = 3 mobil fisik pilot). Tiap HP melihat
dari **kamera POV di kap mobil**, persis seperti kamera mobil fisik nanti.

1. Laptop: buka halaman depan → **Balapan 3D** (layar penonton + papan skor + QR).
2. HP 1 & HP 2 (landscape): scan QR → isi nama → pilih RC1/RC2. Mobil ke-3 bisa
   disetir dari tab laptop lain: `…/race3d.html?drive` (W/S gas, A/D belok).
3. Sebelum mulai = latihan bebas. Klik **▶ Mulai balapan** di laptop → hitung mundur → 2 lap.
4. Lewati gerbang berurutan (gerbang berikutnya **hijau** di layar HP): +10 per gerbang,
   +50 per lap, bonus finish 100/60/30. Gerbang ⚡ = boost 3 dtk, 🛡️ = shield 5 dtk.
   Pemenang = yang finish pertama.

Detail rancangan & cara mobil fisik memakai logika yang sama: [docs/08-SIM-3D.md](docs/08-SIM-3D.md).

## 🚀 Cara menjalankan lokal (3 langkah)

```bash
cd rc-arcade-sim
npm install     # sekali saja
npm start
```

Server akan mencetak alamatnya, contoh:
```
Di komputer ini : http://localhost:3000/car.html          (layar MOBIL)
Dari HP (WiFi)  : http://10.61.190.8:3000/controller.html  (kontroler HP)
```

Lalu:
1. **Di laptop**: buka `http://localhost:3000/` → klik **Arena**.
2. **Di HP** (WiFi yang sama): scan QR di halaman depan → kontroler terbuka.
3. **Geser gas/belok di HP** → mobil di laptop bergerak. 🎉

Tidak punya 2 perangkat? Buka arena dan `keyboard.html` di dua tab — setir pakai WASD.
Jaringan kantor sering memblokir akses antar perangkat di WiFi; kalau HP tidak bisa
membuka alamat laptop, pakai cara **Render** di atas.

## ✅ Uji otomatis
```bash
npm test     # jalankan server, cek alur HP → server → mobil, tolak kontroler kedua, dll
```
Tes yang sama jalan otomatis di GitHub Actions tiap push / PR.

---

## 📂 Isi
```
server.js           Relay "cloud" (WebSocket) + penyaji halaman
public/
  controller.html   Kontroler HP (joystick gas + belok)
  arena.html        Arena multi-mobil (RC1..RCn)
  keyboard.html     Kontroler keyboard (laptop)
  monitor.html      Dashboard monitor (beban, LED, log)
  race3d.html       Balapan 3D: layar penonton & mode setir HP (?drive)
  car.html          Satu mobil simulasi (?car=car1)
  index.html        Halaman pembuka + QR untuk HP
shared/             Logika balapan bersama (arena, fisika, skor) — dipakai sim & mobil fisik
race-server.js      Room balapan 3D (server authoritative) di WebSocket /race
bot.js              HP palsu otomatis (uji beban)
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
