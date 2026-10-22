# 03 — Protokol Pesan (HP ↔ Server ↔ Mobil, WebSocket `/race`)

**Versi:** 1 (balapan 3D) · **Tanggal:** 2026-10-22

Semua pesan **JSON** lewat satu WebSocket: `ws(s)://<host>/race`. Selama kontrak ini dipatuhi,
mobil boleh berupa simulasi 3D di server atau RC fisik — HP dan layar tidak perlu tahu bedanya.

> Protokol 0.x (relay `hello`/`presence`/`control`/`stats` di jalur `/`) dan halaman arena 2D lama
> **dihapus** 2026-10-22. Upgrade WebSocket ke jalur selain `/race` ditolak server.

---

## 1. Peran klien (`join.role`)
| role | siapa | catatan |
|------|-------|---------|
| `driver` | HP pemain (`race3d.html?drive`) | memegang satu mobil `car1..car3`; mobil yang sudah dipegang → `denied` |
| `spectator` | layar laptop (`race3d.html`) | boleh `admin` (mulai/reset) dan chat sebagai "Layar" |
| `monitor` | dashboard (`monitor.html`) | hanya menerima `snapshot` |
| `device` | perangkat di mobil RC fisik | server berhenti menjalankan fisika untuk mobil itu |

## 2. Klien → server
| Pesan | Dari | Isi |
|---|---|---|
| `join {role, car, name}` | semua | `join` lagi = **ganti mobil** (mobil lama dilepas dulu) |
| `leave {}` | driver | lepas mobil, kembali ke pemilih RC |
| `input {throttle, steer, t}` | driver | −1..1, di-*clamp* server; dikirim 20×/dtk |
| `skill {skill}` | driver | `boost` / `shield` (pakai slot power-up), `horn` (jeda 1,5 dtk) |
| `chat {text}` | driver, spectator | maks 80 karakter, jeda 0,8 dtk, karakter kontrol dibuang |
| `admin {action}` | spectator | `start` / `reset` |
| `telemetry {x, y, heading, speed}` | device | posisi mobil fisik (opsional) |
| `checkpointSeen {gate}` | device | gerbang terbaca dari QR (ADR-0012) |

## 3. Server → klien
| Pesan | Ke | Isi |
|---|---|---|
| `welcome` | semua saat tersambung | `protocolVersion`, `arena`, `rules`, `cars`, riwayat `chat` (20) |
| `joined {role, car}` / `denied {car, driver}` | yang join | hasil `join` |
| `snapshot` | semua, 20×/dtk | `phase`, `countdownMs`, `raceMs`, `vehicles[]`, `result`, `net` |
| `checkpointPassed`, `skillUsed`, `horn`, `chat`, `raceResult` | semua | kejadian |
| `control {throttle, steer, cap}` | device, 30×/dtk | throttle sudah dikali batas (80%, 100% saat boost); juga heartbeat |

### 3.1 Isi `snapshot.vehicles[]`
`id, kind ('sim'|'physical'), driver, x, y, heading, speed, score, lap, nextGate, gatesPassed, finished, place, finishMs,
powerUp {type, remainMs}, inventory {boost, shield}, input {throttle, steer}, io`.

`io` dipakai dashboard untuk membuktikan jalur **input → output** per mobil:
| Field | Arti |
|---|---|
| `inPerSec` | pesan `input` dari HP per detik |
| `outPerSec` | berapa kali per detik input itu **diterapkan** ke mobil (tick fisika sim, atau `control` ke device) |
| `msSinceInput` | umur input terakhir. > 1000 ms = failsafe, mobil berhenti |
| `msSinceOutput` | umur output terakhir. Input segar tapi output tua = ada yang menahan (mis. hitung mundur) |

`net` = `inPerSec`, `outPerSec`, `kbOutPerSec`, dan `clients[]` (`role, car, name, rtt, inPerSec, outPerSec`).

## 4. Aturan keamanan
- **Failsafe:** input lebih tua dari 1 dtk diabaikan → mobil berhenti. Mobil fisik tetap menerima `control` nol.
- **Satu pengemudi per mobil.** Mobil dilepas otomatis saat HP `leave`, `join` mobil lain, atau putus (heartbeat 15 dtk).
- **Clamp** semua input di server. Nama & chat dibersihkan; klien menampilkannya sebagai teks (bukan HTML).
