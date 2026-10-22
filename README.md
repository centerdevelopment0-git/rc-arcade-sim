# 🕹️ RC Arcade Sim

Simulasi cloud untuk arcade mobil RC. Alur yang dibuktikan:
**HP (kontroler) → server (cloud) → mobil bergerak**, lengkap dengan telemetry balik.
Karya **orisinal** (terinspirasi konsep, bukan clone app mana pun).

> Mobilnya sekarang **simulasi di layar**. Nanti tinggal diganti RC car fisik
> tanpa mengubah server/kontroler — lihat [docs/05-ROADMAP.md](docs/05-ROADMAP.md).

---

## 🌍 Tes dari kantor & rumah (cara paling mudah)

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
  car.html          Satu mobil simulasi (?car=car1)
  index.html        Halaman pembuka + QR untuk HP
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
