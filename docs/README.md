# 📚 Dokumentasi Proyek — RC Arcade (orisinal)

Ini kumpulan dokumen seperti yang dipakai tim software beneran untuk membangun
sebuah aplikasi. Urutannya dari "kenapa & apa" sampai "gimana teknisnya".

Baca sesuai kebutuhan — tiap dokumen berdiri sendiri.

| # | Dokumen | Isinya | Buat siapa |
|---|---------|--------|------------|
| 01 | [PRD.md](01-PRD.md) | **Product Requirements** — produk ini apa, buat siapa, fitur apa aja, batasan, ukuran sukses | Semua orang (mulai dari sini) |
| 02 | [ARCHITECTURE.md](02-ARCHITECTURE.md) | **Desain teknis** — komponen, alur data, pilihan teknologi, keamanan | Developer |
| 03 | [PROTOCOL.md](03-PROTOCOL.md) | **Kontrak pesan** — format persis perintah kontrol & telemetry (seam HP↔server↔mobil) | Developer (wajib) |
| 04 | [REVERSE-ENGINEERING.md](04-REVERSE-ENGINEERING.md) | **Analisis app acuan** — hasil RE RC Arcade (capygang): dibangun pakai apa, alurnya | Referensi / belajar |
| 05 | [ROADMAP.md](05-ROADMAP.md) | **Tahapan** — dari simulasi cloud → RC car fisik, milestone per fase | Perencanaan |
| 06 | [BACKLOG.md](06-BACKLOG.md) | **Daftar fitur** — centang fitur yang mau kamu ambil / buang (kustomisasi di sini) | Kamu |
| 07 | [TEST-PLAN.md](07-TEST-PLAN.md) | **Rencana uji** — cara mastiin tiap bagian beneran jalan | QA / kamu |

## Cara pakai dokumen ini untuk kustomisasi
1. Buka **01-PRD** → ini gambaran besar fitur & tujuannya.
2. Buka **06-BACKLOG** → coret fitur yang nggak kamu mau, tambahin yang kamu mau.
3. Kalau nambah fitur yang ngubah cara HP/mobil ngobrol → update **03-PROTOCOL**.
4. **05-ROADMAP** bantu kamu putusin urutan ngerjainnya.

## Status sekarang
- ✅ **Fase 1 (Simulasi cloud)** — SUDAH JALAN. Lihat [../README.md](../README.md) buat cara menjalankan.
- ⬜ Fase 2 (Akun & multi-sesi), Fase 3 (RC car fisik) — lihat ROADMAP.

> Catatan legal: proyek ini **karya orisinal** yang terinspirasi *konsep* RC-arcade.
> Dokumen 04 hanya untuk *memahami* app acuan, bukan menyalin kode/aset/brand-nya.
