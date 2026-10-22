# 08 — Simulasi Balapan 3D (digital twin)

**Tanggal:** 2026-10-22 · Status: versi terkecil, siap dites lewat Codespaces.
Acuan keputusan di repo `krca`: ADR-0007 (digital twin), ADR-0009 (open track),
ADR-0010 (power-up & skor; Cidi 2026-10-22: langsung dipakai, pemenang = skor tertinggi), ADR-0011 (POV), ADR-0012 (checkpoint QR).

## Apa yang ada
| Bagian | File | Isi |
|---|---|---|
| Arena & aturan | `shared/arena.js` | Arena 12 × 8 m, 4 gerbang (G1 ⚡ boost, G3 🛡️ shield), 3 rintangan, 2 lap, angka skor |
| Fisika | `shared/physics.js` | Model "bicycle", tabrakan dinding/rintangan/mobil, deteksi lintas gerbang |
| Aturan balapan | `shared/race.js` | Urutan gerbang, lap, skor, power-up, pemenang (skor tertinggi; seri → finish lebih dulu) |
| Room | `race-server.js` | Server authoritative: tick 30 Hz, snapshot 20 Hz, failsafe input basi 1 dtk |
| Tampilan | `public/race3d.html` | Three.js: layar penonton (laptop) & mode setir (HP, `?drive`, `?drive&car=car1`) |
| Dashboard | `public/monitor.html` | Input dari HP vs output ke mobil per RC, RTT, beban, diagnosis |

> Arena 2D lama (`arena.html`, `controller.html`, `keyboard.html`, `car.html`) dan relay WebSocket `/`
> dihapus 2026-10-22. Semua lewat `/race`.

## Dicocokkan dengan diagram konsep "Lapangan"
| Konsep | Di sim | Catatan |
|---|---|---|
| Mobil RC di lintasan | ✅ 3 mobil, arena 12 × 8 m | Bentuk lintasan masih arena terbuka + gerbang (ADR-0009), belum oval berdinding dalam |
| Router Wi-Fi di tengah | — | Hanya relevan di lapangan fisik |
| Server | ✅ `race-server.js` | Server authoritative |
| Client 1–3 via HP | ✅ `race3d.html?drive` | Satu pengemudi per mobil |
| Traffic monitor via web | ✅ panel 📡 Traffic di layar laptop + `monitor.html` | Pesan masuk/keluar, kB/s, RTT per klien, input→output per mobil |
| Map overlay | ✅ peta mini kiri atas | Posisi semua mobil + gerbang berikutnya |
| Status bar | ✅ HUD gaya arcade | Kiri atas: posisi besar, LAP, waktu, skor, gerbang berikutnya. Kanan atas: km/j besar + bar, power-up aktif |
| Chat box | ✅ bar bawah (HP), panel kanan (laptop) | Maks 80 karakter, jeda 0,8 dtk, riwayat 20 pesan untuk yang baru masuk |
| Kontrol | ✅ ◀ ▶ kiri bawah, GAS + REM kanan bawah | Multitouch: tiap jari dilacak sendiri; jari bisa digeser ◀↔▶ tanpa diangkat |
| Skill buttons | ✅ ⚡ boost, 🛡️ shield, 📣 klakson di atas GAS | Power-up dari gerbang masuk slot, dipakai dengan tombol |
| Pilih RC | ✅ QR per RC + tombol 🔄 Ganti RC | `join` ulang = pindah mobil, `leave` = lepas mobil |
| (tambahan) POV semua pemain di laptop | ✅ kisi 2×2 (`?view=pov`) | Render ulang 3D, bukan video dari HP |

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

## Protokol `/race`
Lengkapnya di [03-PROTOCOL](03-PROTOCOL.md). Input -1..1 (ADR-0007 krca memakai -100..100; konversi cukup di satu tempat saat digabung).

## Batasan versi ini
- **Satu room**, 3 mobil tetap. Siapa pun di layar penonton bisa Mulai/Reset (belum ada login).
- Kamera POV adalah render 3D, **bukan** video. Pembacaan QR dari gambar (simulasi ADR-0012)
  belum ada: di sim, gerbang dideteksi dari posisi.
- Mobil sendiri diekstrapolasi dari snapshot (tanpa prediksi penuh). Di Codespaces latensi
  ~100–200 ms, masih terasa sedikit delay saat belok tajam.
- Fisika sederhana (tidak ada drift/suspensi). Angka kecepatan (maks 4 m/s ≈ 14 km/j) perlu
  dicocokkan dengan mobil RC yang dibeli.
- Angka skor & power-up ada di `RULES` (`shared/arena.js`) dan mudah diubah. `RULES.powerUpActivation`
  = `'button'` (pakai tombol skill, default) atau `'auto'` (langsung aktif saat lewat gerbang).
- Chat belum ada filter kata kasar; siapa pun yang membuka layar penonton bisa ikut chat sebagai "Layar".

## Langkah berikutnya (usulan)
1. Simulasi kamera membaca QR: render QR di gerbang 3D lalu decode dari frame POV, supaya
   pipeline ADR-0012 bisa diuji sebelum ada hardware.
2. Prediksi sisi klien untuk mobil sendiri (rasa setir lebih responsif).
3. Firmware/aplikasi `device` untuk satu mobil fisik prototipe.
