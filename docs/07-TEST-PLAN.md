# 07 — Rencana Uji (Test Plan)

**Tanggal:** 2026-10-20 · Fokus: pastikan tiap bagian beneran jalan & aman.

---

## 1. Uji manual Fase 1 (lakukan sekarang)
| # | Langkah | Hasil diharapkan |
|---|---------|------------------|
| T1 | Jalankan `npm start` | Server cetak alamat, tanpa error |
| T2 | Buka `car.html` di laptop | Indikator "menunggu kontroler…" |
| T3 | Buka `controller.html` di HP (WiFi sama) | Kedua sisi jadi hijau "tersambung" |
| T4 | Geser joystick ke atas | Mobil **maju**; `speed` naik di kedua layar |
| T5 | Geser kiri/kanan sambil maju | Mobil **berbelok** |
| T6 | Lepas joystick | `throttle`/`steer` → 0; mobil melambat berhenti |
| T7 | **Failsafe**: matikan WiFi HP / tutup tab kontroler | Dalam ~0,4 dtk mobil **berhenti sendiri** |
| T8 | Nyalakan ulang kontroler | Auto-reconnect, hijau lagi, bisa kontrol lagi |
| T9 | Mobil menyentuh tepi arena | Mantul halus, tidak nyangkut/keluar |

## 2. Yang khusus diperhatikan (safety-critical)
- **Failsafe (T7) wajib lulus.** Ini yang mencegah "mobil liar". Untuk RC fisik, ini soal keselamatan.
- **Satu kontroler per mobil** (Fase 2): buka 2 kontroler ke room sama → yang kedua ditolak / tidak ikut mengontrol.
- **Clamp input**: kirim `throttle` di luar −1..1 (lewat alat manual) → mobil tetap aman.

## 3. Uji latensi (sederhana)
- Field `t` di `control` = waktu kirim. Bandingkan dengan waktu terima di mobil.
- Target kasar: < 200 ms di jaringan lokal; catat saat pindah ke cloud.

## 4. Uji Fase 3 (RC car fisik) — nanti
- Angkat roda dari tanah dulu (bench test) sebelum uji jalan.
- Uji failsafe firmware: cabut WiFi → motor **mati** < 0,5 dtk.
- Batasi kecepatan maksimum saat kalibrasi pertama.

## 5. Checklist rilis (sebelum online untuk umum)
- [ ] Pakai `wss://` (bukan `ws://`)
- [ ] Failsafe lulus
- [ ] 1 kontroler/mobil + token sesi
- [ ] Validasi/clamp semua input kontrol
- [ ] Uji di HP beneran (bukan cuma desktop)
