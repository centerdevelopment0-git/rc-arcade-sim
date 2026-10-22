# 08 — Simulasi Balapan 3D (digital twin)

**Tanggal:** 2026-10-22 · Status: versi terkecil, siap dites lewat Codespaces.
Acuan keputusan di repo `krca`: ADR-0007 (digital twin), ADR-0009 (open track),
ADR-0010 (power-up & skor, masih *Proposed*), ADR-0011 (POV), ADR-0012 (checkpoint QR).

## Apa yang ada
| Bagian | File | Isi |
|---|---|---|
| Arena & aturan | `shared/arena.js` | Arena 12 × 8 m, 4 gerbang (G1 ⚡ boost, G3 🛡️ shield), 3 rintangan, 2 lap, angka skor |
| Fisika | `shared/physics.js` | Model "bicycle", tabrakan dinding/rintangan/mobil, deteksi lintas gerbang |
| Aturan balapan | `shared/race.js` | Urutan gerbang, lap, skor, power-up, pemenang (finish pertama) |
| Room | `race-server.js` | Server authoritative: tick 30 Hz, snapshot 20 Hz, failsafe input basi 1 dtk |
| Tampilan | `public/race3d.html` | Three.js: layar penonton (laptop) & mode setir POV (HP, `?drive`) |

## Kenapa logika yang sama dipakai mobil fisik
`Race` tidak tahu apakah mobilnya virtual atau fisik. Ia hanya menerima "gerbang N terlewati":

```
mobil virtual : fisika server -> checkCrossing(prev, cur) -> gatePassed()
mobil fisik   : kamera di mobil baca QR gerbang -> checkpointSeen{gate} -> gatePassed()
```

Perangkat di mobil (Pi/HP onboard) tersambung ke `/race` sebagai `role:'device'` untuk `car1..car3`.
Server lalu **tidak** menjalankan fisika untuk mobil itu, melainkan:
- meneruskan `control {throttle, steer, cap}` — throttle sudah dikali batas 80% (100% saat boost);
- menerima `telemetry {x,y,heading,speed}` (opsional) dan `checkpointSeen {gate}`.

Jadi skor, power-up, dan pemenang identik di dua dunia. Ini sudah diuji di `test/smoke.test.js`.

## Protokol `/race` (versi 1)
| Arah | Pesan |
|---|---|
| klien → server | `join {role:'driver'\|'spectator'\|'device', car, name}`, `input {throttle, steer, t}`, `admin {action:'start'\|'reset'}` |
| server → klien | `welcome {arena, rules}`, `joined`, `denied`, `snapshot` (20 Hz), `checkpointPassed`, `raceResult` |
| server → device | `control {throttle, steer, cap}` (30 Hz, juga berfungsi sebagai heartbeat) |

Input -1..1 (ADR-0007 krca memakai -100..100; konversi cukup di satu tempat saat digabung).

## Batasan versi ini
- **Satu room**, 3 mobil tetap. Siapa pun di layar penonton bisa Mulai/Reset (belum ada login).
- Kamera POV adalah render 3D, **bukan** video. Pembacaan QR dari gambar (simulasi ADR-0012)
  belum ada: di sim, gerbang dideteksi dari posisi.
- Mobil sendiri diekstrapolasi dari snapshot (tanpa prediksi penuh). Di Codespaces latensi
  ~100–200 ms, masih terasa sedikit delay saat belok tajam.
- Fisika sederhana (tidak ada drift/suspensi). Angka kecepatan (maks 4 m/s ≈ 14 km/j) perlu
  dicocokkan dengan mobil RC yang dibeli.
- Aturan ADR-0010 masih *Proposed* — angka di `RULES` mudah diubah.

## Langkah berikutnya (usulan)
1. Simulasi kamera membaca QR: render QR di gerbang 3D lalu decode dari frame POV, supaya
   pipeline ADR-0012 bisa diuji sebelum ada hardware.
2. Prediksi sisi klien untuk mobil sendiri (rasa setir lebih responsif).
3. Firmware/aplikasi `device` untuk satu mobil fisik prototipe.
