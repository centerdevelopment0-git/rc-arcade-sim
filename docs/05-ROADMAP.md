# 05 — Roadmap (Tahapan)

**Tanggal:** 2026-10-20 · Urutan fase, bukan tanggal pasti. Kerjakan satu per satu.

---

## Fase 1 — Simulasi cloud ✅ (SELESAI)
**Tujuan:** buktikan alur HP → server → mobil bergerak, tanpa hardware.
- [x] Relay server (WebSocket) — `server.js`
- [x] Setir dari HP — kini `race3d.html?drive` (◀ ▶ + GAS, multitouch)
- [x] Mobil simulasi — kini balapan 3D authoritative (`race-server.js`, `shared/`)
- [x] Failsafe kehilangan sinyal
- **Done when:** tekan gas di HP → mobil di layar laptop bergerak sesuai, lewat server.
- Catatan: arena 2D & relay pertama (`controller.html`, `car.html`, `arena.html`) dihapus 2026-10-22.

## Fase 2 — Akun, sesi & deploy cloud 🔨
**Tujuan:** siap banyak pengguna & online beneran.
- [x] Bisa dites dari mana saja: GitHub Codespaces (`.devcontainer/`) atau Render free (`render.yaml`) + `wss://` otomatis + health check `/healthz`
- [ ] Akun & login (mulai sederhana: kode/nama; lalu Firebase Auth/Google)
- [x] Pilih mobil: QR per RC + tombol Ganti RC
- [x] 1 pengemudi aktif per mobil (tolak yang kedua)
- [x] Heartbeat: koneksi mati diputus otomatis (mobil tidak terkunci kontroler hantu)
- [x] Clamp input kontrol di server + uji otomatis (`npm test`, GitHub Actions)
- [ ] Token sesi
- [ ] Antrian & batas waktu sesi
- **Done when:** 2 orang dari jaringan berbeda bisa pakai 2 mobil berbeda tanpa bentrok.

## Fase 3 — RC car fisik ⬜ (target besarmu)
**Tujuan:** ganti mobil simulasi dengan RC car beneran.
- [ ] Mikrokontroler (mis. **ESP32**) jalankan klien WebSocket ke relay yang sama
- [ ] Terjemahkan `control {throttle, steer}` → sinyal motor (PWM) + servo kemudi
- [ ] Failsafe di firmware (motor mati bila perintah putus) — **wajib**
- [ ] Kamera di mobil → **video live via WebRTC** ke HP (tambah signaling di relay)
- [ ] Kalibrasi (trim kemudi, batas kecepatan)
- **Done when:** nyetir RC car fisik dari HP lewat internet, sambil lihat videonya.

## Fase 4 — Produk (opsional) ⬜
- [ ] Kredit / beli waktu (in-app purchase)
- [ ] Papan skor / lap time / lintasan
- [ ] Panel operator (kelola banyak mobil)

---

### Catatan transisi Fase 1 → 3 (kenapa ini mulus)
Mobil simulasi dan RC car fisik memakai **aturan dan protokol yang sama**
([03-PROTOCOL](03-PROTOCOL.md), [08-SIM-3D](08-SIM-3D.md)). Jadi perangkat di mobil tinggal:
1. connect `wss://…/race` → kirim `join {role:'device', car:'car1'}`,
2. terima `control {throttle, steer, cap}`, ubah jadi PWM motor + servo,
3. kirim `checkpointSeen {gate}` saat kamera membaca QR gerbang (dan opsional `telemetry`).
HP & server **tidak perlu diubah**.
