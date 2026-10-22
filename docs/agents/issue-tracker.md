# Issue tracker: docs/06-BACKLOG.md

Fitur dan tugas rc-arcade-sim dicatat di [`docs/06-BACKLOG.md`](../06-BACKLOG.md), bukan di GitHub Issues.

## Konvensi

- Satu fitur = satu baris di tabel kategori yang cocok, dengan ID `F<n>` atau sub-ID `F<n><huruf>`, kolom Fase, dan apakah [`03-PROTOCOL.md`](../03-PROTOCOL.md) perlu diubah.
- Status: ⬜ belum, 🔨 sedang, ✅ selesai, ❌ dibuang (lihat [`triage-labels.md`](triage-labels.md)).
- Spec yang lebih panjang dari satu baris disimpan di `docs/specs/<id>-<slug>.md` dan ditautkan dari kolom Fitur.

## Saat skill bilang "publish to the issue tracker"

Tambah baris baru (ID berikutnya) di `docs/06-BACKLOG.md`, plus spec di `docs/specs/` bila perlu.

## Saat skill bilang "fetch the relevant ticket"

Baca baris ID itu di `docs/06-BACKLOG.md` dan spec yang ditautkan.

## Wayfinding (`/wayfinder`)

- **Map**: `docs/specs/<effort>/map.md` (Notes / Decisions-so-far / Fog).
- **Tiket anak**: `docs/specs/<effort>/NN-<slug>.md` dengan baris `Type:`, `Status:` (`claimed`/`resolved`) dan `Blocked by: NN, NN`.
- **Resolve**: jawaban di bawah `## Answer`, `Status: resolved`, lalu ringkasan + tautan ke Decisions-so-far di `map.md`.
