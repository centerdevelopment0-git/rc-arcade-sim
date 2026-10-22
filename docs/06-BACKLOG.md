# 06 — Backlog Fitur (Kustomisasi di sini) ✏️

**Tanggal:** 2026-10-20
Ini daftar fitur buat **kamu** utak-atik. Centang yang mau diambil, coret yang nggak,
tambahin ide sendiri di bagian bawah. Kolom "Butuh ubah protokol?" = apakah [03-PROTOCOL](03-PROTOCOL.md) perlu diupdate.

Legenda status: ✅ selesai · 🔨 sedang · ⬜ belum · ❌ dibuang

---

## Kontrol & kemudi
| Status | ID | Fitur | Fase | Butuh ubah protokol? |
|:--:|--|--|:--:|:--:|
| ✅ | F1 | Joystick gas + belok | 1 | — |
| ✅ | F4 | Failsafe berhenti saat sinyal putus | 1 | — |
| ⬜ | F1a | Mode kontrol tombol (bukan joystick) | 1 | tidak |
| ⬜ | F1b | Gas pakai tilt/giroskop HP | 2 | tidak |
| ⬜ | F1c | Lampu / klakson | 2/3 | ya (tambah field) |
| ⬜ | F1d | Batas kecepatan (mode pemula) | 1 | tidak |

## Mobil / perangkat
| Status | ID | Fitur | Fase | Protokol? |
|:--:|--|--|:--:|:--:|
| ✅ | F3 | Mobil simulasi + fisika | 1 | — |
| ⬜ | F3a | Lintasan/rintangan di simulasi | 1 | tidak |
| ⬜ | F9 | RC car fisik (ESP32) | 3 | tidak (protokol sama) |
| ⬜ | F9a | Telemetry baterai & sinyal | 3 | ya (tambah field) |

## Video
| Status | ID | Fitur | Fase | Protokol? |
|:--:|--|--|:--:|:--:|
| ⬜ | F8 | Video live dari mobil (WebRTC) | 3 | ya (pesan signaling) |
| ⬜ | F8a | Rekam / snapshot | 4 | tidak |

## Akun, sesi, sosial
| Status | ID | Fitur | Fase | Protokol? |
|:--:|--|--|:--:|:--:|
| ⬜ | F5 | Login (nama/kode → lalu Google) | 2 | tidak |
| ⬜ | F6 | Pilih mobil (room) dari daftar | 2 | tidak |
| ⬜ | F7 | Antrian & waktu sesi | 2 | ya (pesan `session`) |
| ⬜ | F11 | Papan skor / lap time | 4 | ya |

## Monetisasi (opsional)
| Status | ID | Fitur | Fase | Protokol? |
|:--:|--|--|:--:|:--:|
| ⬜ | F10 | Kredit / beli waktu main | 4 | tidak |

---

## Multiplayer & monitoring (BARU — Fase 1.5)
| Status | ID | Fitur | File |
|:--:|--|--|--|
| ✅ | M1 | Multi-mobil (RC1..RCn) di satu arena | `public/arena.html` |
| ✅ | M2 | Pilih mobil per kontroler (RC1/RC2/…) | `public/controller.html` |
| ✅ | M3 | Server multi-mobil + routing per-car | `server.js` |
| ✅ | M4 | Bot (HP palsu) buat beban & otomatis | `bot.js` |
| ✅ | M5 | Dashboard monitor (jalur koneksi, beban, user) | `public/monitor.html` |
| ✅ | M6 | LED status per RC (online / data in / data out) | arena + monitor |
| ✅ | M7 | 1 kontroler aktif per mobil (tolak yg kedua) | `server.js` |
| ✅ | M10 | Tes dari mana saja: Codespaces (gratis) / Render + QR kontroler | `.devcontainer/`, `render.yaml`, `index.html` |
| ✅ | M11 | Heartbeat ping/pong + clamp input + uji otomatis | `server.js`, `test/` |
| ⬜ | M8 | Token sesi / nama pemain | semua |
| ⬜ | M9 | Grafik beban historis (bukan cuma angka live) | `monitor.html` |

## State, LED, Skill & Visual (BARU — Fase 1.6)
| Status | ID | Fitur | File |
|:--:|--|--|--|
| ✅ | S1 | State RC (MATI/MENYAMBUNG/STANDBY/SIAP/TERIMA/SINYAL HILANG) | `public/rc-state.js` |
| ✅ | S2 | Kode LED (pola kedip beda per state) di arena & monitor | arena + monitor |
| ✅ | S3 | Isi input terbaca + log aktivitas | `public/monitor.html` |
| ✅ | S4 | Sistem skill scalable (default Turbo) + cooldown/fuel | `server.js` + semua kontroler |
| ✅ | S5 | Status skill per mobil (standby/aktif/cooldown) | monitor + kontroler |
| ✅ | S6 | Mobil gaya F1 + lampu sorot + asap + api turbo | `public/arena.html` |
| ✅ | S7 | Kecepatan default 70%, turbo → 100% | `server.js` + `arena.html` |
| ⬜ | S8 | Skill tambahan (Nitro, Rem, dsb) | edit array `SKILLS` di `server.js` |

> Nambah skill: cukup tambah satu baris di array `SKILLS` dalam `server.js` — UI icon,
> cooldown, dan status ikut otomatis (scalable).

## Balapan 3D / digital twin (BARU — Fase 1.7)
| Status | ID | Fitur | File |
|:--:|--|--|--|
| ✅ | R1 | Arena 3D + kamera POV per HP | `public/race3d.html` |
| ✅ | R2 | Server authoritative + failsafe 1 dtk | `race-server.js` |
| ✅ | R3 | Gerbang berurutan, lap, skor, boost/shield (tombol skill), pemenang skor tertinggi | `shared/race.js` |
| ✅ | R7 | Tampilan HP konsep "Lapangan": status bar, peta mini, chat, joystick, tombol skill | `race3d.html` |
| ✅ | R8 | Laptop: traffic monitor + kisi POV RC1–RC3 | `race3d.html`, `race-server.js` |
| ⬜ | R9 | Lintasan oval berdinding dalam (seperti diagram) | `shared/arena.js` |
| ✅ | R4 | Jalur mobil fisik (`role:'device'`, `checkpointSeen`) | `race-server.js` |
| ⬜ | R5 | Simulasi baca QR dari frame POV (ADR-0012) | — |
| ⬜ | R6 | Prediksi sisi klien (setir lebih responsif) | `race3d.html` |

## 💡 Ide tambahanku (tulis di sini)
- [ ] ...
- [ ] ...

## Cara menambah 1 fitur (resep singkat)
1. Tambahkan barisnya di tabel atas, set status 🔨.
2. Kalau kolom protokol "ya" → update [03-PROTOCOL](03-PROTOCOL.md) dulu (tambah field/pesan).
3. Ubah kode: kontroler (`controller.html`) dan/atau mobil (`car.html`) dan/atau `server.js`.
4. Uji sesuai [07-TEST-PLAN](07-TEST-PLAN.md). Set status ✅.
