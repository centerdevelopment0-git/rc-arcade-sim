# 🕹️ RC Arcade Sim

Simulasi cloud untuk arcade mobil RC. Alur yang dibuktikan:
**HP (kontroler) → server (cloud) → mobil bergerak**, lengkap dengan telemetry balik.
Karya **orisinal** (terinspirasi konsep, bukan clone app mana pun).

> Mobilnya sekarang **simulasi di layar**. Nanti tinggal diganti RC car fisik
> tanpa mengubah server/kontroler — lihat [docs/05-ROADMAP.md](docs/05-ROADMAP.md).

---

## 🚀 Cara menjalankan (3 langkah)

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
1. **Di laptop**: buka link **car.html** → ini layar mobilnya.
2. **Di HP** (WiFi yang sama): buka link **controller.html** → ini stir-nya.
3. **Geser joystick di HP** → mobil di laptop bergerak. 🎉

Tidak punya 2 perangkat? Buka `car.html` dan `controller.html` di dua tab browser yang sama — tetap jalan.

---

## 📂 Isi
```
server.js           Relay "cloud" (WebSocket) + penyaji halaman
public/
  controller.html   Kontroler HP (joystick gas + belok)
  car.html          Mobil simulasi (fisika + visual)
  index.html        Halaman pembuka
docs/               Dokumen proyek (PRD, arsitektur, protokol, dll) — baca docs/README.md
```

## 📚 Dokumentasi
Semua dokumen ada di **[docs/](docs/README.md)** — mulai dari situ:
PRD, Arsitektur, Protokol pesan, analisis RE app acuan, Roadmap, Backlog fitur, Test plan.

## 🔌 Langkah berikutnya
- Deploy ke cloud + akun/sesi → [docs/05-ROADMAP.md](docs/05-ROADMAP.md) Fase 2.
- Hubungkan RC car fisik (ESP32) + video live → Fase 3.
- Tambah/buang fitur → [docs/06-BACKLOG.md](docs/06-BACKLOG.md).
