// test/race.test.js — aturan balapan & fisika (shared/), tanpa jaringan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARENA, RULES } from '../shared/arena.js';
import { Race } from '../shared/race.js';
import { stepVehicle, crossesGate, CAR } from '../shared/physics.js';

function racing(ids = ['car1', 'car2']) {
  const r = new Race(ARENA, RULES);
  r.start(0, ids); r.tick(RULES.countdownMs);   // lewati hitung mundur
  return r;
}
const lap = (r, id, t) => [1, 2, 3, 0].map(g => r.gatePassed(id, g, t));

test('hitung mundur menahan mobil, lalu balapan', () => {
  const r = new Race(ARENA, RULES); r.start(0, ['car1']);
  assert.equal(r.phase, 'countdown'); assert.equal(r.canDrive(100), false);
  r.tick(RULES.countdownMs); assert.equal(r.phase, 'racing'); assert.equal(r.canDrive(RULES.countdownMs), true);
});

test('gerbang harus berurutan; di luar urutan diabaikan', () => {
  const r = racing();
  assert.equal(r.gatePassed('car1', 2, 4000), null);
  assert.equal(r.gatePassed('car1', 1, 4000).points, 10);
  assert.equal(r.gatePassed('car1', 1, 4000), null);   // dobel
  assert.equal(r.cars.get('car1').nextGate, 2);
});

test('power-up masuk slot, aktif saat tombol skill ditekan', () => {
  const r = racing();
  assert.equal(r.useSkill('car1', 'boost', 4000), null);            // slot masih kosong
  assert.equal(r.gatePassed('car1', 1, 4000).powerUp, 'boost');
  assert.equal(r.capOf('car1', 4000), RULES.baseCap);                 // belum aktif
  assert.equal(r.cars.get('car1').inventory.boost, 1);
  assert.equal(r.useSkill('car1', 'boost', 4100).skill, 'boost');
  assert.equal(r.capOf('car1', 4100), RULES.boostCap);
  assert.equal(r.cars.get('car1').inventory.boost, 0);
  assert.equal(r.useSkill('car1', 'boost', 4200), null);            // tidak bisa dipakai dua kali
});

test('mode auto: power-up langsung aktif (pilihan RULES.powerUpActivation)', () => {
  const r = new Race(ARENA, { ...RULES, powerUpActivation: 'auto' });
  r.start(0, ['car1']); r.tick(RULES.countdownMs);
  r.gatePassed('car1', 1, 4000);
  assert.equal(r.capOf('car1', 4000), RULES.boostCap);
});

test('lap +50, power-up aktif lalu habis', () => {
  const r = racing();
  const ev = r.gatePassed('car1', 1, 4000);
  assert.equal(ev.powerUp, 'boost');
  r.useSkill('car1', 'boost', 4000);
  assert.equal(r.capOf('car1', 4000), RULES.boostCap);
  r.tick(4000 + RULES.powerUps.boost.durationMs);
  assert.equal(r.capOf('car1', 4000 + RULES.powerUps.boost.durationMs), RULES.baseCap);
  r.gatePassed('car1', 2, 5000);
  assert.equal(r.gatePassed('car1', 3, 5000).powerUp, 'shield');
  r.useSkill('car1', 'shield', 5000);
  assert.equal(r.shieldOf('car1', 5001), true);
  const e0 = r.gatePassed('car1', 0, 6000);
  assert.equal(e0.lap, 1); assert.equal(e0.points, 10 + 50);
  assert.equal(r.cars.get('car1').score, 4 * 10 + 50);
});

test('pemenang = skor tertinggi, bukan yang finish pertama', () => {
  const r = racing(['car1', 'car2']);
  // car1 finish duluan; car2 menyusul tapi dapat skor lebih besar dari gerbang tambahan
  for (let i = 0; i < ARENA.laps; i++) lap(r, 'car1', 5000);
  assert.equal(r.cars.get('car1').place, 1);
  assert.equal(r.tick(5000), null);                     // car2 belum finish
  r.cars.get('car2').score += 200;                       // mis. bonus lain di masa depan
  for (let i = 0; i < ARENA.laps; i++) lap(r, 'car2', 6000);
  const res = r.tick(6000);
  assert.equal(r.phase, 'finished');
  assert.deepEqual(res.standings.map(s => s.vehicleId), ['car2', 'car1']);
  const perLap = 4 * 10 + 50;
  assert.equal(res.standings[1].score, ARENA.laps * perLap + RULES.finishBonus[0]);
  assert.equal(res.standings[0].score, 200 + ARENA.laps * perLap + RULES.finishBonus[1]);
});

test('skor seri: yang finish lebih dulu di atas', () => {
  const r = racing(['car1', 'car2']);
  for (let i = 0; i < ARENA.laps; i++) { lap(r, 'car2', 5000); lap(r, 'car1', 5000); }
  r.cars.get('car1').score = r.cars.get('car2').score = 300;
  assert.deepEqual(r.standings().map(s => s.vehicleId), ['car2', 'car1']);
});

test('lobby tidak menghitung gerbang', () => {
  const r = new Race(ARENA, RULES); r.addVehicle('car1');
  assert.equal(r.gatePassed('car1', 1, 0), null);
});

test('fisika: batas kecepatan 80%, boost 100%, dinding menahan mobil', () => {
  const v = { x: 0, y: 2.8, heading: 0, speed: 0 };
  for (let i = 0; i < 60; i++) stepVehicle(v, { throttle: 1, steer: 0 }, 1 / 30, ARENA, { cap: 0.8 });
  assert.ok(Math.abs(v.speed - CAR.maxSpeed * 0.8) < 0.01, 'cap 80%: ' + v.speed);
  for (let i = 0; i < 60; i++) stepVehicle(v, { throttle: 1, steer: 0 }, 1 / 30, ARENA, { cap: 1 });
  assert.ok(v.x <= ARENA.width / 2 - CAR.radius + 1e-9, 'tidak tembus dinding');
});

test('deteksi lintas gerbang', () => {
  const g = ARENA.gates[1];   // garis y=0, x 3.8..5.8
  assert.equal(crossesGate({ x: 4.8, y: 0.3 }, { x: 4.8, y: -0.3 }, g), true);
  assert.equal(crossesGate({ x: 2.0, y: 0.3 }, { x: 2.0, y: -0.3 }, g), false);
});
