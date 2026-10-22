# CLAUDE.md

RC Arcade Sim: server simulasi balap mobil RC multiplayer (Node.js, `server.js`). Jalankan `npm test` sebelum commit.

- **General skills (semua agen):** 27 skill [mattpocock/skills](https://github.com/mattpocock/skills) v1.3.1 (`5beb35b`, MIT) di `.claude/skills/`. Mulai dari `/ask-matt` bila bingung memilih.
- **Specialized skill engineering:** [ponytail](https://github.com/DietrichGebert/ponytail) v5.3.2 (`09c434a`, MIT), mode *lazy senior dev* level `full`. Setiap tugas kode, test, atau infra memuat [`.claude/skills/ponytail/SKILL.md`](.claude/skills/ponytail/SKILL.md) dan menjalankan `/ponytail-review` sebelum push. Tugas non-engineering (PRD, roadmap, dokumen) tidak memakainya.
- Jika bertabrakan: aturan di file ini, lalu ponytail (untuk tugas engineering), lalu skill mattpocock. Ukuran perubahan dan test mengikuti ponytail; `/tdd` untuk logika berisiko dengan test sekecil yang dibutuhkan.

## Agent skills

### Issue tracker

`docs/06-BACKLOG.md` dengan ID `F<n>`. Lihat `docs/agents/issue-tracker.md`.

### Triage labels

Dipetakan ke status backlog (⬜/🔨/✅/❌). Lihat `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` di root. Lihat `docs/agents/domain.md`.
