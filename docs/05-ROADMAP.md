# 05 — Roadmap (Tahapan)

**Tanggal:** 2026-10-20 · Urutan fase, bukan tanggal pasti. Kerjakan satu per satu.

---

## Fase 1 — Simulasi cloud ✅ (SELESAI)
**Tujuan:** buktikan alur HP → server → mobil bergerak, tanpa hardware.
- [x] Relay server (WebSocket) — `server.js`
- [x] Kontroler HP (joystick) — `controller.html`
- [x] Mobil simulasi + telemetry — `car.html`
- [x] Failsafe kehilangan sinyal
- **Done when:** geser joystick di HP → mobil di layar laptop bergerak sesuai, lewat server.

## Fase 2 — Akun, sesi & deploy cloud 🔨
**Tujuan:** siap banyak pengguna & online beneran.
- [x] Bisa dites dari mana saja: GitHub Codespaces (`.devcontainer/`) atau Render free (`render.yaml`) + `wss://` otomatis + health check `/healthz`
- [ ] Akun & login (mulai sederhana: kode/nama; lalu Firebase Auth/Google)
- [ ] Pilih/daftar mobil = pilih `room`
- [x] 1 kontroler aktif per mobil (tolak yang kedua)
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
Mobil simulasi (`car.html`) dan RC car fisik **berbicara protokol yang sama**
([03-PROTOCOL](03-PROTOCOL.md)). Jadi firmware ESP32 tinggal:
1. connect WebSocket → kirim `hello {role:'car'}`,
2. terima `control`, ubah jadi PWM motor,
3. kirim `telemetry` (mis. baterai, kecepatan).
Kontroler & server **tidak perlu diubah**.
