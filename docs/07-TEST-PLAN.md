# 07 — Rencana Uji (Test Plan)

**Tanggal:** 2026-10-22 · Fokus: balapan 3D di `/race` (arena 2D lama sudah dihapus).

---

## 1. Uji manual (laptop + 2 HP)
| # | Langkah | Hasil diharapkan |
|---|---------|------------------|
| T1 | `npm start` (atau Codespaces) | Server cetak alamat layar, dashboard, HP |
| T2 | Laptop: buka halaman depan → **Layar arena** | Arena 3D, papan skor RC1–RC3 "kosong" |
| T3 | HP 1 scan QR **RC1**, HP 2 scan QR **RC2** (landscape) | Langsung masuk mobil itu, HUD tampil |
| T4 | Tahan **GAS** + **◀** sekaligus, lalu tekan skill 📣 dengan jari ketiga | Mobil maju sambil belok, klakson bunyi — semua jari terbaca |
| T5 | Geser jari dari ◀ ke ▶ tanpa diangkat | Arah belok ikut pindah |
| T6 | Lepas semua jari | Mobil melambat lalu berhenti |
| T7 | Buka **📡 Dashboard koneksi** sambil HP menyetir | LED INPUT (biru) & OUTPUT (oranye) RC itu menyala, diagnosis "Input → mobil sim 3D bergerak ✔" |
| T8 | **Failsafe**: matikan WiFi HP / tutup tab | Dalam ~1 dtk mobil berhenti; dashboard: "Tidak ada input dari HP > 1 dtk" |
| T9 | HP 1 tekan **🔄 Ganti RC** → pilih RC3 | RC1 kosong lagi, HP 1 sekarang menyetir RC3 |
| T10 | Laptop: **▶ Mulai balapan** | Hitung mundur (input ditahan), lalu 2 lap; pemenang = skor tertinggi |
| T11 | Ketik chat di bar bawah HP | Pesan muncul di layar laptop & HP lain |

## 2. Yang khusus diperhatikan (safety-critical)
- **Failsafe (T8) wajib lulus.** Ini yang mencegah "mobil liar". Untuk RC fisik, ini soal keselamatan.
- **Satu pengemudi per mobil:** HP kedua yang memilih RC yang sama → ditolak.
- **Clamp input:** `throttle` di luar −1..1 → server memotong ke −1..1.

## 2b. Uji otomatis
`npm test` (juga di GitHub Actions):
- `test/race.test.js` — aturan balapan: urutan gerbang, lap, skor, slot power-up, pemenang skor tertinggi, fisika.
- `test/smoke.test.js` — server asli: halaman tersaji & halaman lama 404, WebSocket selain `/race` ditolak,
  pengemudi bergerak & kursi kedua ditolak, mobil fisik dapat `control` ber-cap + gerbang QR,
  chat/klakson/traffic, **input HP → output ke mobil** (`io.outPerSec`) dan berhenti saat input basi, ganti RC.

## 3. Uji latensi (sederhana)
- Dashboard menampilkan RTT tiap HP (ping/pong tiap 2 dtk).
- Target kasar: < 200 ms di jaringan lokal; catat saat lewat Codespaces.

## 4. Uji RC car fisik — nanti
- Angkat roda dari tanah dulu (bench test) sebelum uji jalan.
- Uji failsafe firmware: cabut WiFi → motor **mati** < 0,5 dtk.
- Batasi kecepatan maksimum saat kalibrasi pertama.

## 5. Checklist rilis (sebelum online untuk umum)
- [x] Pakai `wss://` (bukan `ws://`) — otomatis saat dibuka via https
- [x] Failsafe input basi (dicek `npm test`)
- [x] 1 pengemudi/mobil
- [ ] Token sesi / login
- [x] Validasi/clamp semua input kontrol
- [ ] Uji di HP beneran (bukan cuma desktop)
