# 03 — Protokol Pesan (Kontrak HP ↔ Relay ↔ Mobil ↔ Monitor)

**Versi:** 0.2 (multi-mobil + monitor) · **Tanggal:** 2026-10-20

Semua pesan **JSON** lewat WebSocket. Selama kontrak ini dipatuhi, tiap komponen
boleh diganti (sim → hardware).

---

## 1. Tiga peran klien
| role | siapa | kunci |
|------|-------|-------|
| `controller` | HP pemain | terikat ke satu `car` |
| `car` | satu mobil (sim / RC fisik) | punya id `car` (car1, car2, …) |
| `monitor` | dashboard | menerima `stats` seluruh sistem |

Kunci routing adalah **`car` id**. Perintah dari controller carX → hanya ke car carX.
Telemetry dari car carX → ke semua controller carX.

## 2. Pesan

### 2.1 `hello` (klien → server)
```json
{ "type":"hello", "role":"controller" | "car" | "monitor", "car":"car1" }
```
- `car` wajib untuk controller & car (default `car1`). Monitor mengabaikan `car`.

### 2.2 `presence` (server → controller & car di car itu)
```json
{ "type":"presence", "car":"car1", "carOnline":true, "controllers":2 }
```

### 2.3 `control` (controller → server → car)
```json
{ "type":"control", "car":"car1", "throttle":0.0, "steer":0.0, "t":1760000000000 }
```
| Field | Rentang | Arti |
|-------|---------|------|
| `throttle` | −1.0 … 1.0 | + maju, − mundur |
| `steer` | −1.0 … 1.0 | − kiri, + kanan |
| `t` | epoch ms | waktu kirim (ukur latensi) |

> `car` diisi server dari ikatan pengirim. **Wajib** di sisi mobil: clamp nilai +
> failsafe (anggap 0,0) bila tak ada `control` > 400 ms.

### 2.4 `telemetry` (car → server → controller)
```json
{ "type":"telemetry", "car":"car1", "x":450, "y":280, "heading":0.0, "speed":0.0 }
```

### 2.5 `stats` (server → monitor, 5×/detik)
```json
{
  "type":"stats", "now":1760000000000, "uptime":123,
  "clients":{ "controllers":3, "cars":3, "monitors":1, "total":7 },
  "global":{ "inPerSec":120, "outPerSec":180 },
  "cars":[
    { "id":"car1", "online":true, "controllers":1,
      "cps":20, "tps":20, "lastCtrl":1760…, "lastTel":1760… }
  ]
}
```
- `cps`/`tps` = pesan kontrol/telemetry per detik per mobil (beban).
- `lastCtrl`/`lastTel` = kapan data terakhir → dipakai monitor buat **LED kedip** (data < ~220 ms = nyala).

## 3. Aturan server (relay)
- `control` diteruskan hanya dari `controller` → ke `car` terikat.
- `telemetry` diteruskan hanya dari `car` → ke semua `controller` mobil itu.
- `monitor` hanya menerima `stats` (tidak ikut lalu lintas kontrol/telemetry → hemat beban).

### 2.6 `skill` (controller → server)
```json
{ "type":"skill", "car":"car1", "skill":"turbo" }
```
- Minta aktifkan skill. Server hanya menerima jika skill sedang **standby**.

### 2.7 `skills` (server → car + controller, ~5×/detik)
```json
{ "type":"skills", "car":"car1", "speedMul":1.0,
  "skills":[ { "id":"turbo", "name":"Turbo", "icon":"⚡", "state":"active", "remain":2400 } ] }
```
- `state` ∈ `standby|active|cooldown`; `remain` = sisa ms.
- `speedMul` = pengali kecepatan maks saat ini (base 0,7 → 1,0 saat turbo). Mobil pakai ini untuk efek.
- Skill didefinisikan di array `SKILLS` (server.js) — **scalable**, tambah satu baris = satu skill baru.

## 4. Perluasan
Tambah field, jangan ubah arti lama:
- Kontrol: `lights`, `horn`, `gear`. · Telemetry: `battery`, `rssi`.
- Fase video: pesan signaling WebRTC (`offer`/`answer`/`ice`) lewat relay yang sama.
