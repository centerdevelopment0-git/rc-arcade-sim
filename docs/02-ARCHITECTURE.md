# 02 — Arsitektur & Desain Teknis

**Versi:** 0.1 · **Tanggal:** 2026-10-20

---

## 1. Gambaran besar
Tiga bagian yang saling ngobrol lewat satu "message bus" realtime:

```
   ┌─────────────┐   perintah kontrol    ┌─────────────┐   perintah    ┌──────────────┐
   │  KONTROLER  │ ───────────────────▶  │   RELAY     │ ───────────▶  │    MOBIL     │
   │   (HP/web)  │                        │  (server /  │               │ simulasi →   │
   │  joystick   │ ◀───────────────────   │   "cloud")  │ ◀───────────  │ RC car fisik │
   └─────────────┘      telemetry         └─────────────┘   telemetry   └──────────────┘
        F1                                      F2                            F3/F9
```

- **Kontroler** = HP pemain. Kirim `control {throttle, steer}`.
- **Relay** = server (peran "internet/cloud"). Meneruskan pesan antar dua sisi dalam satu *room*.
- **Mobil** = sekarang simulasi di browser; nanti RC car fisik (ESP32/Raspberry Pi) yang menjalankan motor.

> Seam penting ada di **Relay**. Selama format pesan ([03-PROTOCOL](03-PROTOCOL.md)) tetap,
> tiap bagian bisa diganti tanpa menyentuh yang lain. Inilah kenapa "mobil virtual"
> nanti bisa ditukar "mobil fisik" tanpa ubah kontroler.

## 2. Komponen & teknologi (Fase 1, yang sudah dibuat)
| Komponen | File | Teknologi | Alasan |
|----------|------|-----------|--------|
| Relay server | `server.js` | Node.js + `ws` (WebSocket) | Ringan, latensi rendah, mudah deploy |
| Kontroler | `public/controller.html` | HTML/JS + Pointer Events | Jalan di HP tanpa instalasi |
| Mobil (sim) | `public/car.html` | HTML/Canvas + fisika sederhana | Visual pergerakan tanpa hardware |
| Landing | `public/index.html` | HTML | Pintu masuk |

## 3. Kenapa WebSocket untuk kontrol?
Perintah kontrol butuh **sering & cepat** (20×/detik), paket kecil. WebSocket pas:
satu koneksi tetap, dua arah, overhead rendah. (App acuan memakai **Firebase Realtime
Database** untuk peran serupa — lihat [04-RE](04-REVERSE-ENGINEERING.md) §Pola kontrol.)

## 4. Konsep "room"
Satu *room* = satu pasangan kontroler↔mobil (mis. `demo1`).
- Mobil `hello {role:'car', room:'demo1'}` → server catat.
- Kontroler `hello {role:'controller', room:'demo1'}` → server pasangkan.
- Server hanya meneruskan `control` ke mobil di room yang sama, dan `telemetry` sebaliknya.
- Efeknya: **1 pemain per mobil** (syarat keamanan dasar).

## 5. Keamanan (desain)
Fase 1 sederhana; berikut arah pengerasannya:
- **Failsafe** (sudah): mobil berhenti bila tak ada perintah > 0,4 dtk. **Wajib** untuk hardware.
- **Satu kontroler aktif** per room (tolak kontroler kedua) — Fase 2.
- **Token sesi**: kontroler harus bawa token sah untuk masuk room (Fase 2/3).
- **Validasi input**: `throttle`/`steer` di-*clamp* ke rentang aman di sisi mobil.
- **TLS/WSS**: pakai `wss://` saat di cloud (bukan `ws://`).

## 6. Rencana penskalaan (Fase 3+)
- **Kontrol**: WebSocket relay atau Firebase RTDB (realtime, murah untuk payload kecil).
- **Video**: **WebRTC** peer-to-peer (kamera mobil → HP), server hanya untuk "signaling".
  App acuan memakai WebRTC (`libjingle_peerconnection`) — pola standar & benar.
- **Hardware mobil**: mikrokontroler (ESP32) jalankan klien WebSocket → kendalikan
  driver motor (PWM) sesuai `throttle`/`steer`. Logika di `car.html` jadi acuan perilaku.

## 7. Deploy ke cloud (ringkas)
Server ini satu proses Node, jadi gampang:
- **Render / Railway / Fly.io**: hubungkan repo, start command `npm start`, set `PORT` dari env (sudah didukung).
- Setelah online, ganti `ws://` → `wss://` di halaman (pakai `location` otomatis sudah aman bila diakses via https).
- Taruh server di region dekat pengguna/mobil untuk latensi rendah.

## 8. Struktur folder
```
rc-arcade-sim/
├─ server.js            # relay + server file statis
├─ package.json
├─ public/
│  ├─ index.html        # landing
│  ├─ controller.html   # kontroler HP (F1)
│  └─ car.html          # mobil simulasi (F3)
└─ docs/                # dokumen ini
```
