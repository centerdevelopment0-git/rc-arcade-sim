// shared/arena.js — Arena pilot (open track, ADR-0009 krca). Dipakai server & browser.
//
// Satuan METER, skala RC sungguhan supaya angka sim = angka arena fisik nanti.
// Koordinat 2D: x ke kanan, y ke "bawah" peta (di 3D: y -> sumbu z). Titik (0,0) = tengah arena.
// Gerbang dilewati berurutan 0 -> 1 -> 2 -> 3 -> 0 (= 1 lap). Gerbang 0 = garis start/finish.
// Di arena fisik, tiap gerbang nanti diberi QR (ADR-0012) dengan index yang sama.

export const ARENA = {
  id: 'pilot-1',
  version: 1,
  width: 12,          // m
  height: 8,          // m
  laps: 2,
  gates: [
    { x1: 0,    y1: 1.8,  x2: 0,    y2: 3.8,  label: 'START' },
    { x1: 3.8,  y1: 0,    x2: 5.8,  y2: 0,    label: 'G1', powerUp: 'boost' },
    { x1: 0,    y1: -3.8, x2: 0,    y2: -1.8, label: 'G2' },
    { x1: -5.8, y1: 0,    x2: -3.8, y2: 0,    label: 'G3', powerUp: 'shield' },
  ],
  obstacles: [
    { x: 0,    y: 0, r: 1.0 },
    { x: -2.6, y: 0, r: 0.5 },
    { x: 2.6,  y: 0, r: 0.5 },
  ],
  // posisi start (tepat setelah garis start, menghadap +x) untuk car1..car3
  spawns: [
    { x: 0.6, y: 2.3, heading: 0 },
    { x: 0.6, y: 2.8, heading: 0 },
    { x: 0.6, y: 3.3, heading: 0 },
  ],
};

// Aturan skor & power-up (ADR-0010 krca). Sama untuk mobil virtual dan fisik.
export const RULES = {
  gatePoints: 10,
  lapPoints: 50,
  finishBonus: [100, 60, 30],
  baseCap: 0.8,       // batas throttle normal 80% (sim: batas kecepatan; mobil fisik: batas PWM)
  boostCap: 1.0,      // saat boost
  countdownMs: 3000,
  raceTimeoutMs: 5 * 60 * 1000,
  // 'button' = power-up dari gerbang masuk slot, pemain menekan tombol skill untuk memakai (konsep "Lapangan").
  // 'auto'   = langsung aktif saat lewat gerbang (usulan awal ADR-0010).
  powerUpActivation: 'button',
  maxPerPowerUp: 1,   // isi slot maksimal per jenis
  powerUps: {
    boost:  { durationMs: 3000, label: 'Boost',  icon: '⚡' },  // batas kecepatan 80% -> 100%
    shield: { durationMs: 5000, label: 'Shield', icon: '🛡️' }, // tabrakan tidak memperlambat
  },
};
