# 06 — Backlog Fitur (Kustomisasi di sini) ✏️

**Tanggal:** 2026-10-20
Ini daftar fitur buat **kamu** utak-atik. Centang yang mau diambil, coret yang nggak,
tambahin ide sendiri di bagian bawah. Kolom "Butuh ubah protokol?" = apakah [03-PROTOCOL](03-PROTOCOL.md) perlu diupdate.

Legenda status: ✅ selesai · 🔨 sedang · ⬜ belum · ❌ dibuang

---

## Kontrol & kemudi
| Status | ID | Fitur | Fase | Butuh ubah protokol? |
|:--:|--|--|:--:|:--:|
| ✅ | F1 | Setir gas + belok dari HP (joystick, kini tombol ◀ ▶ + GAS) | 1 | — |
| ✅ | F4 | Failsafe berhenti saat sinyal putus | 1 | — |
| ✅ | F1a | Mode kontrol tombol (bukan joystick), multitouch | 1 | tidak |
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

## Arena 2D lama (Fase 1.5–1.6) — 🗑️ dihapus 2026-10-22
Arena 2D, relay `/`, `controller.html`, `keyboard.html`, `car.html`, `rc-state.js` dihapus; semua pindah ke balapan 3D.
Yang masih berguna sudah dibawa: pilih mobil (R10), 1 pengemudi per mobil, bot (`bot.js`, kini di `/race`),
dashboard koneksi (R11), heartbeat + clamp + uji otomatis, tes dari mana saja (Codespaces).
Belum dibawa (bisa dihidupkan lagi kalau perlu): kode LED per state RC, grafik beban historis, log aktivitas.

## Balapan 3D / digital twin (BARU — Fase 1.7)
| Status | ID | Fitur | File |
|:--:|--|--|--|
| ✅ | R1 | Arena 3D + kamera POV per HP | `public/race3d.html` |
| ✅ | R2 | Server authoritative + failsafe 1 dtk | `race-server.js` |
| ✅ | R3 | Gerbang berurutan, lap, skor, boost/shield (tombol skill), pemenang skor tertinggi | `shared/race.js` |
| ✅ | R7 | Tampilan HP gaya arcade: HUD posisi/LAP/waktu + km/j, peta mini, ◀ ▶ + GAS/REM, skill di atas gas, chat bar bawah, multitouch | `race3d.html` |
| ✅ | R8 | Laptop: traffic monitor + kisi POV RC1–RC3 | `race3d.html`, `race-server.js` |
| ⬜ | R9 | Lintasan oval berdinding dalam (seperti diagram) | `shared/arena.js` |
| ✅ | R4 | Jalur mobil fisik (`role:'device'`, `checkpointSeen`) | `race-server.js` |
| ⬜ | R5 | Simulasi baca QR dari frame POV (ADR-0012) | — |
| ⬜ | R6 | Prediksi sisi klien (setir lebih responsif) | `race3d.html` |
| ✅ | R10 | Pilih RC: QR per RC (`?drive&car=car1`) + tombol Ganti RC (`leave`) | `index.html`, `race3d.html`, `race-server.js` |
| ✅ | R11 | Dashboard koneksi: input vs output per mobil + diagnosis | `monitor.html`, `race-server.js` |

## 💡 Ide tambahanku (tulis di sini)
- [ ] ...
- [ ] ...

## Cara menambah 1 fitur (resep singkat)
1. Tambahkan barisnya di tabel atas, set status 🔨.
2. Kalau kolom protokol "ya" → update [03-PROTOCOL](03-PROTOCOL.md) dulu (tambah field/pesan).
3. Ubah kode: tampilan (`race3d.html`) dan/atau aturan (`shared/`) dan/atau `race-server.js`.
4. Uji sesuai [07-TEST-PLAN](07-TEST-PLAN.md). Set status ✅.
