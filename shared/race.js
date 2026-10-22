// shared/race.js — Aturan balapan: urutan gerbang, lap, skor, power-up, pemenang.
//
// Ini "otak" permainan dan SAMA untuk mobil virtual maupun fisik (digital twin, ADR-0007):
//   - mobil virtual : server memanggil checkCrossing() dari posisi hasil fisika.
//   - mobil fisik   : perangkat di mobil membaca QR gerbang (ADR-0012) -> server memanggil gatePassed().
// Server authoritative: klien hanya menampilkan hasilnya.

import { RULES } from './arena.js';
import { crossesGate } from './physics.js';

export class Race {
  constructor(arena, rules = RULES) {
    this.arena = arena; this.rules = rules;
    this.phase = 'lobby';            // lobby (latihan bebas) | countdown | racing | finished
    this.cars = new Map();           // id -> state
    this.startAt = 0; this.finishCount = 0; this.result = null;
  }

  addVehicle(id) { if (!this.cars.has(id)) this.cars.set(id, this.#fresh()); return this.cars.get(id); }
  #fresh() { return { score: 0, lap: 0, nextGate: 1, gatesPassed: 0, finished: false, place: null, finishMs: null, powerUp: null }; }

  // mulai: semua skor di-reset, hitung mundur, lalu racing. ids = mobil yang ikut.
  start(now, ids) {
    this.cars = new Map(ids.map(id => [id, this.#fresh()]));
    this.phase = 'countdown'; this.startAt = now + this.rules.countdownMs;
    this.finishCount = 0; this.result = null;
  }
  reset() { this.phase = 'lobby'; this.result = null; for (const id of this.cars.keys()) this.cars.set(id, this.#fresh()); }

  canDrive(now) { return this.phase !== 'countdown' && !(this.phase === 'racing' && now < this.startAt); }

  // pengali batas kecepatan & shield saat ini
  capOf(id, now)    { return this.#active(id, 'boost', now) ? this.rules.boostCap : this.rules.baseCap; }
  shieldOf(id, now) { return this.#active(id, 'shield', now); }
  #active(id, type, now) { const p = this.cars.get(id)?.powerUp; return !!p && p.type === type && now < p.until; }

  // mobil virtual: cek apakah gerakan prev->cur melewati gerbang berikutnya
  checkCrossing(id, prev, cur, now) {
    const c = this.cars.get(id);
    if (!c || this.phase !== 'racing' || c.finished) return null;
    const g = this.arena.gates[c.nextGate];
    return crossesGate(prev, cur, g) ? this.gatePassed(id, c.nextGate, now) : null;
  }

  // dipanggil saat gerbang terlewati (dari fisika ATAU dari QR mobil fisik).
  // Gerbang di luar urutan diabaikan. Mengembalikan event untuk disiarkan, atau null.
  gatePassed(id, gate, now) {
    const c = this.cars.get(id);
    if (!c || this.phase !== 'racing' || c.finished || gate !== c.nextGate) return null;
    const g = this.arena.gates[gate];
    let points = this.rules.gatePoints, powerUp = null;
    c.gatesPassed++;
    if (g.powerUp) { powerUp = g.powerUp; c.powerUp = { type: powerUp, until: now + this.rules.powerUps[powerUp].durationMs }; }
    if (gate === 0) {
      c.lap++; points += this.rules.lapPoints;
      if (c.lap >= this.arena.laps) {
        c.finished = true; c.place = ++this.finishCount; c.finishMs = now - this.startAt;
        points += this.rules.finishBonus[c.place - 1] || 0;
      }
    }
    c.score += points;
    c.nextGate = (gate + 1) % this.arena.gates.length;
    return { type: 'checkpointPassed', vehicleId: id, gate, lap: c.lap, points, score: c.score, powerUp, finished: c.finished, place: c.place };
  }

  // panggil tiap tick; mengembalikan hasil sekali saat balapan selesai
  tick(now) {
    for (const c of this.cars.values()) if (c.powerUp && now >= c.powerUp.until) c.powerUp = null;
    if (this.phase === 'countdown' && now >= this.startAt) this.phase = 'racing';
    if (this.phase !== 'racing' || this.cars.size === 0) return null;
    const all = [...this.cars.values()].every(c => c.finished);
    if (all || now - this.startAt > this.rules.raceTimeoutMs) {
      this.phase = 'finished';
      this.result = { type: 'raceResult', standings: this.standings() };
      return this.result;
    }
    return null;
  }

  // pemenang = posisi finish (opsi A ADR-0010); yang belum finish diurutkan dari progres
  standings() {
    return [...this.cars.entries()].map(([id, c]) => ({ id, ...c }))
      .sort((a, b) => (a.place ?? 99) - (b.place ?? 99) || b.gatesPassed - a.gatesPassed || b.score - a.score)
      .map((c, i) => ({ position: i + 1, vehicleId: c.id, score: c.score, lap: c.lap, finished: c.finished, finishMs: c.finishMs }));
  }
}
