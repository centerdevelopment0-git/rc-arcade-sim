// shared/physics.js — Fisika mobil RC sederhana (model kinematik "bicycle").
// Dipakai server (authoritative) dan boleh dipakai browser untuk prediksi.
// Mobil fisik TIDAK memakai file ini: posisinya datang dari dunia nyata.

export const CAR = {
  radius: 0.2,        // m, untuk tabrakan
  length: 0.42, width: 0.24,
  maxSpeed: 4.0,      // m/s pada throttle 100%
  accel: 6.0,         // m/s^2 pada throttle penuh
  drag: 1.2,          // 1/s (terminal speed accel/drag > maxSpeed, jadi batas kecepatan yang menentukan)
  turnRate: 2.8,      // rad/s pada steer penuh & kecepatan maks
  wallSlow: 0.5,      // kecepatan dikali ini saat menabrak (kecuali shield)
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// v: {x,y,heading,speed}; input: {throttle,steer} -1..1; opts: {cap, shield}
export function stepVehicle(v, input, dt, arena, opts = {}) {
  const cap = CAR.maxSpeed * (opts.cap ?? 0.8);   // opts.cap dari Race (RULES.baseCap / boostCap)
  const thr = clamp(input.throttle || 0, -1, 1), str = clamp(input.steer || 0, -1, 1);
  v.speed += thr * CAR.accel * dt;
  v.speed -= v.speed * CAR.drag * dt;
  v.speed = clamp(v.speed, -cap * 0.5, cap);
  if (Math.abs(v.speed) < 0.01 && thr === 0) v.speed = 0;
  v.heading += str * CAR.turnRate * dt * (v.speed / CAR.maxSpeed);
  v.heading = Math.atan2(Math.sin(v.heading), Math.cos(v.heading));
  v.x += Math.cos(v.heading) * v.speed * dt;
  v.y += Math.sin(v.heading) * v.speed * dt;

  const slow = opts.shield ? 1 : CAR.wallSlow;
  let hit = false;
  // dinding arena
  const hx = arena.width / 2 - CAR.radius, hy = arena.height / 2 - CAR.radius;
  if (v.x < -hx || v.x > hx) { v.x = clamp(v.x, -hx, hx); hit = true; }
  if (v.y < -hy || v.y > hy) { v.y = clamp(v.y, -hy, hy); hit = true; }
  // rintangan bulat
  for (const o of arena.obstacles) {
    const dx = v.x - o.x, dy = v.y - o.y, d = Math.hypot(dx, dy), min = o.r + CAR.radius;
    if (d < min) {
      const k = d > 1e-6 ? min / d : 1;
      v.x = o.x + dx * k; v.y = o.y + (d > 1e-6 ? dy * k : min);
      hit = true;
    }
  }
  if (hit) v.speed *= slow;
  return hit;
}

// tabrakan antar mobil: dorong saling menjauh. shieldOf(v) -> bool
export function collideVehicles(list, shieldOf = () => false) {
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = CAR.radius * 2;
    if (d >= min) continue;
    const nx = d > 1e-6 ? dx / d : 1, ny = d > 1e-6 ? dy / d : 0, push = (min - d) / 2;
    a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
    if (!shieldOf(a)) a.speed *= CAR.wallSlow;
    if (!shieldOf(b)) b.speed *= CAR.wallSlow;
  }
}

// apakah lintasan p->q memotong garis gerbang g?
export function crossesGate(p, q, g) {
  const d = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d1 = d(g.x1, g.y1, g.x2, g.y2, p.x, p.y), d2 = d(g.x1, g.y1, g.x2, g.y2, q.x, q.y);
  const d3 = d(p.x, p.y, q.x, q.y, g.x1, g.y1), d4 = d(p.x, p.y, q.x, q.y, g.x2, g.y2);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0)) && d1 !== d2;
}
