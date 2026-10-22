# 02 — Arsitektur & Desain Teknis

**Versi:** 0.3 (balapan 3D, relay lama dihapus) · **Tanggal:** 2026-10-22

---

## 1. Gambaran besar
Semua klien tersambung ke satu WebSocket `/race`. Server memegang "kebenaran" (authoritative):

```
   ┌─────────────┐   input 20 Hz          ┌──────────────────┐   fisika 30 Hz   ┌──────────────┐
   │ HP (driver) │ ─────────────────────▶ │  race-server.js  │ ───────────────▶ │ mobil sim 3D │
   │ ◀ ▶  GAS    │ ◀───────────────────── │  (server, cloud) │                  └──────────────┘
   └─────────────┘   snapshot 20 Hz       │  shared/race.js  │   control 30 Hz  ┌──────────────┐
   ┌─────────────┐ ◀──────────────────────│  skor, power-up  │ ───────────────▶ │ RC fisik     │
   │ laptop /    │   snapshot + net/io    └──────────────────┘ ◀─────────────── │ (role device)│
   │ dashboard   │                                              QR gerbang       └──────────────┘
   └─────────────┘
```

- **HP** kirim `input {throttle, steer}`; menampilkan 3D dari `snapshot`.
- **Server** menerapkan input ke mobil (fisika sim, atau `control` ke perangkat RC fisik), menghitung gerbang/skor.
- **Laptop** = layar arena + admin; **dashboard** = input vs output per mobil.

> Seam penting ada di **server**. Selama format pesan ([03-PROTOCOL](03-PROTOCOL.md)) tetap,
> mobil virtual bisa ditukar mobil fisik tanpa mengubah HP. Detail: [08-SIM-3D](08-SIM-3D.md).

## 2. Komponen & teknologi
| Komponen | File | Teknologi | Alasan |
|----------|------|-----------|--------|
| Server | `server.js` + `race-server.js` | Node.js + `ws` | Ringan, latensi rendah, mudah deploy |
| Aturan bersama | `shared/` | ES module, dipakai server & browser | Satu sumber aturan untuk sim & fisik |
| Layar & HP | `public/race3d.html` | Three.js (disajikan lokal) + Pointer Events multitouch | Jalan di HP tanpa instalasi |
| Dashboard | `public/monitor.html` | HTML/SVG | Bukti jalur input → output |
| Halaman depan | `public/index.html` | HTML + QR per RC | Pintu masuk |

## 3. Kenapa WebSocket untuk kontrol?
Perintah kontrol butuh **sering & cepat** (20×/detik), paket kecil. WebSocket pas:
satu koneksi tetap, dua arah, overhead rendah. (App acuan memakai **Firebase Realtime
Database** untuk peran serupa — lihat [04-RE](04-REVERSE-ENGINEERING.md) §Pola kontrol.)

## 4. Satu room, tiga mobil
Satu room tetap dengan `car1..car3` (= 3 mobil fisik pilot). HP `join {role:'driver', car}`;
mobil yang sudah dipegang → `denied`. `join` lagi = ganti mobil, `leave` = lepas mobil.

## 5. Keamanan (desain)
Fase 1 sederhana; berikut arah pengerasannya:
- **Failsafe** (sudah): input lebih tua dari 1 dtk diabaikan → mobil berhenti. **Wajib** untuk hardware.
- **Satu pengemudi** per mobil (sudah).
- **Token sesi**: kontroler harus bawa token sah untuk masuk room (Fase 2/3).
- **Validasi input**: `throttle`/`steer` di-*clamp* ke rentang aman di sisi mobil.
- **TLS/WSS**: pakai `wss://` saat di cloud (bukan `ws://`).

## 6. Rencana penskalaan (Fase 3+)
- **Kontrol**: WebSocket relay atau Firebase RTDB (realtime, murah untuk payload kecil).
- **Video**: **WebRTC** peer-to-peer (kamera mobil → HP), server hanya untuk "signaling".
  App acuan memakai WebRTC (`libjingle_peerconnection`) — pola standar & benar.
- **Hardware mobil**: mikrokontroler (ESP32) jalankan klien WebSocket → kendalikan
  driver motor (PWM) sesuai `control {throttle, steer, cap}` dari `/race` (role `device`).

## 7. Deploy ke cloud (ringkas)
Server ini satu proses Node, jadi gampang:
- **Render / Railway / Fly.io**: hubungkan repo, start command `npm start`, set `PORT` dari env (sudah didukung).
- Setelah online, ganti `ws://` → `wss://` di halaman (pakai `location` otomatis sudah aman bila diakses via https).
- Taruh server di region dekat pengguna/mobil untuk latensi rendah.

## 8. Struktur folder
```
rc-arcade-sim/
├─ server.js            # penyaji halaman + WebSocket /race
├─ race-server.js       # room balapan (authoritative)
├─ shared/              # arena, fisika, aturan balapan
├─ bot.js               # pengemudi otomatis untuk RC kosong
├─ public/
│  ├─ index.html        # halaman depan + QR per RC
│  ├─ race3d.html       # layar arena & mode setir HP
│  └─ monitor.html      # dashboard koneksi
├─ test/                # npm test
└─ docs/                # dokumen ini
```
