# 01 — Product Requirements Document (PRD)

**Produk:** RC Arcade (nama kerja) — arcade mengemudi mobil RC dari jarak jauh.
**Versi dokumen:** 0.1 · **Tanggal:** 2026-10-20 · **Status:** Draft
**Pemilik produk:** (kamu)

---

## 1. Ringkasan
RC Arcade adalah aplikasi yang memungkinkan pengguna **mengendalikan mobil RC
secara real-time dari jarak jauh** lewat HP, sambil **menonton video langsung**
dari kamera di mobil. Pada tahap awal, mobil berupa **simulasi di layar** agar
seluruh alur (HP → cloud → mobil bergerak) bisa dibuktikan tanpa hardware.

## 2. Masalah & peluang
- Orang suka main RC tapi terhalang: harus punya mobilnya, di lokasi yang sama.
- Peluang: "main mobil RC fisik dari mana saja" — sewa waktu bermain, balapan online.

## 3. Target pengguna
| Persona | Kebutuhan |
|---------|-----------|
| **Pemain kasual** | Buka app, langsung bisa nyetir, seru, murah |
| **Pemilik arena (operator)** | Daftarkan mobil fisik, atur jadwal/biaya, pantau |
| **Developer/hobbyist (kamu)** | Hubungkan RC car sendiri, eksperimen |

## 4. Tujuan & ukuran sukses
- **G1:** Pengguna bisa mengontrol "mobil" real-time dengan latensi terasa rendah (< 200 ms di jaringan lokal).
- **G2:** Alur kontrol HP→cloud→mobil berjalan andal (failsafe berhenti saat sinyal putus).
- **G3 (fase lanjut):** 1 RC car fisik berhasil dikontrol lewat internet.
- Metrik: latensi perintah, uptime sesi, % sesi tanpa "mobil liar" (kontrol hilang).

## 5. Lingkup (scope)

### ✅ Dalam lingkup — Fase 1 (sekarang)
- Setir dari HP: tombol ◀ ▶ + pedal gas (multitouch).
- Server relay "cloud" (meneruskan perintah & telemetry).
- Mobil simulasi (fisika sederhana + visual pergerakan).
- Failsafe: mobil berhenti bila perintah putus > 0,4 dtk.

### ✅ Dalam lingkup — Fase berikut (lihat ROADMAP)
- Akun & login, pilih mobil, sesi/antrian, kredit/billing, video live, RC car fisik.

### ❌ Di luar lingkup (sekarang)
- Multiplayer balapan simultan, matchmaking, chat, toko item.

## 6. Fitur utama (ringkas; detail lengkap di [06-BACKLOG](06-BACKLOG.md))
| ID | Fitur | Prioritas | Fase |
|----|-------|-----------|------|
| F1 | Kontroler HP (gas/belok) | Must | 1 ✅ |
| F2 | Relay realtime (cloud) | Must | 1 ✅ |
| F3 | Mobil simulasi + telemetry | Must | 1 ✅ |
| F4 | Failsafe kehilangan sinyal | Must | 1 ✅ |
| F5 | Akun & login | Should | 2 |
| F6 | Pilih/daftar mobil (room) | Should | 2 |
| F7 | Antrian & waktu sesi | Should | 2 |
| F8 | Video live dari mobil (WebRTC) | Must (fisik) | 3 |
| F9 | Koneksi RC car fisik | Must (fisik) | 3 |
| F10 | Kredit / pembelian waktu | Could | 4 |
| F11 | Papan skor / lap time | Could | 4 |

## 7. Alur pengguna inti (Fase 1)
1. Operator/kamu buka layar **Mobil** (atau nyalakan RC car) → tersambung ke room.
2. Pemain buka **Kontroler** di HP → masuk room yang sama.
3. Pemain tekan gas & belok → perintah lari ke server → diterapkan ke mobil → **mobil bergerak**.
4. Telemetry (laju, posisi) balik ke HP sebagai umpan balik.
5. Pemain berhenti / tutup app → mobil berhenti otomatis (failsafe).

## 8. Kebutuhan non-fungsional
- **Latensi rendah** (utamakan protokol ringan untuk kontrol).
- **Keamanan:** hanya 1 kontroler aktif per mobil; perintah tervalidasi; failsafe.
- **Andal:** auto-reconnect; mobil tidak "lari liar" saat jaringan putus.
- **Portabel:** jalan di HP (web) tanpa instalasi; server bisa di-deploy ke cloud.

## 9. Asumsi & risiko
- Asumsi: HP & mobil terhubung internet/WiFi yang sama (fase 1).
- Risiko: latensi internet publik → butuh server region dekat (app acuan pakai Asia Tenggara).
- Risiko: keamanan hardware (orang lain ambil alih mobil) → butuh auth + token sesi (Fase 2/3).

## 10. Pertanyaan terbuka
- Model bisnis: sewa per menit, langganan, atau gratis?
- Satu mobil = satu pemain, atau antrian bergiliran?
- Perlu region server mana (dekat pemain atau dekat mobil)?
