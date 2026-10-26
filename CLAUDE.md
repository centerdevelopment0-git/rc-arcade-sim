# CLAUDE.md

RC Arcade Sim: server simulasi balap mobil RC multiplayer (Node.js, `server.js`). Jalankan `npm test` sebelum commit.

- **General skills (semua agen):** 27 skill [mattpocock/skills](https://github.com/mattpocock/skills) v1.3.1 (`5beb35b`, MIT) di `.claude/skills/`. Mulai dari `/ask-matt` bila bingung memilih.
- **Specialized skill engineering:** [ponytail](https://github.com/DietrichGebert/ponytail) v5.3.2 (`09c434a`, MIT), mode *lazy senior dev* level `full`. Setiap tugas kode, test, atau infra memuat [`.claude/skills/ponytail/SKILL.md`](.claude/skills/ponytail/SKILL.md) dan menjalankan `/ponytail-review` sebelum push. Tugas non-engineering (PRD, roadmap, dokumen) tidak memakainya.
- **General skill teks:** [humanizer](https://github.com/blader/humanizer) v3.1.0 (`8c307f3`, MIT) di `.claude/skills/humanizer/`, untuk semua tugas yang menulis teks dibaca manusia (teks UI, dokumen, deskripsi PR).
- **Specialized skill UI (tugas yang mengubah tampilan `public/`):** [frontend-design](https://github.com/anthropics/skills) (`dbd4588`, Apache-2.0), [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) (`35545ea`, MIT), [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (`434b7f9`, MIT, salinan lokal), dan [mobile-native](https://github.com/emilkowalski/skills) (`2d22863`, MIT) untuk HP. Mulai dari [`docs/09-UI-GUIDE.md`](docs/09-UI-GUIDE.md): token, tipografi, HUD balap, dan daftar tanda AI slop. Sebelum push, jalankan `/make-interfaces-feel-better quick` dan `/web-interface-guidelines` pada file yang berubah.
- Jika bertabrakan: aturan di file ini, lalu [`docs/09-UI-GUIDE.md`](docs/09-UI-GUIDE.md) untuk tampilan, lalu ponytail (untuk tugas engineering), lalu skill UI, lalu skill mattpocock. Ponytail menentukan ukuran perubahan: skill UI tidak dipakai untuk merombak layar di luar yang diminta. Ukuran perubahan dan test mengikuti ponytail; `/tdd` untuk logika berisiko dengan test sekecil yang dibutuhkan.

## Agent skills

### Issue tracker

`docs/06-BACKLOG.md` dengan ID `F<n>`. Lihat `docs/agents/issue-tracker.md`.

### Triage labels

Dipetakan ke status backlog (⬜/🔨/✅/❌). Lihat `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` di root. Lihat `docs/agents/domain.md`.
