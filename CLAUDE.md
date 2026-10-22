# CLAUDE.md

RC Arcade Sim: server simulasi balap mobil RC multiplayer (Node.js, `server.js`). Jalankan `npm test` sebelum commit.

- Skill **ponytail** (mode *lazy senior dev*, level `full`) aktif untuk semua sesi dan agen. Aturannya dimuat di bawah; perintah `/ponytail lite|full|ultra|off`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help` ada di [`.claude/skills/`](.claude/skills/). Sumber: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) v5.3.2 (`09c434a`), lisensi MIT.
- Sebelum push, review diff sendiri dengan `/ponytail-review` dan perbaiki temuan *Must fix*.

@.claude/skills/ponytail/SKILL.md

## Agent skills

Skill [mattpocock/skills](https://github.com/mattpocock/skills) v1.3.1 (`5beb35b`, MIT) ada di `.claude/skills/` (27 skill engineering + productivity; mulai dari `/ask-matt` bila bingung memilih). Jika bertabrakan, urutan prioritasnya: aturan di file ini, lalu ponytail, lalu skill mattpocock.

- Ukuran perubahan tetap mengikuti ponytail. `/tdd` dipakai untuk logika berisiko, dengan test sekecil yang dibutuhkan; jangan menambah abstraksi demi "deep module" yang tidak diminta.
- `/ponytail-review` tetap wajib sebelum handoff atau push. `/code-review` (mattpocock) opsional untuk review standar + kesesuaian spec, dan dipakai otomatis oleh `/implement`.

### Issue tracker

`docs/06-BACKLOG.md` dengan ID `F<n>`. Lihat `docs/agents/issue-tracker.md`.

### Triage labels

Dipetakan ke status backlog (⬜/🔨/✅/❌). Lihat `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` di root. Lihat `docs/agents/domain.md`.
