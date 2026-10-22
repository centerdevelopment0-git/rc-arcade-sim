// race-server.js — Room balapan 3D (server authoritative) di jalur WebSocket /race.
//
// Satu room, 3 mobil (car1..car3 = 3 mobil fisik pilot). Tiap mobil bisa:
//   - 'sim'      : fisika jalan di server (shared/physics.js), tick 30 Hz.
//   - 'physical' : perangkat di mobil RC tersambung sebagai role 'device'. Server meneruskan
//                  input (sudah dibatasi cap power-up) ke perangkat, dan menerima posisi
//                  (telemetry) + gerbang terlewati (checkpointSeen, dari QR — ADR-0012).
// Aturan skor/power-up/pemenang SAMA untuk keduanya (shared/race.js).
//
// Klien -> server : join {role:'driver'|'spectator'|'device', car, name}
//                   input {throttle, steer, t}          (driver, 20 Hz)
//                   admin {action:'start'|'reset'}      (spectator)
//                   telemetry {x,y,heading,speed}       (device)
//                   checkpointSeen {gate}               (device)
// Server -> klien : welcome, denied, snapshot (20 Hz), checkpointPassed, raceResult,
//                   control {throttle, steer, cap}      (ke device)

import { WebSocketServer } from 'ws';
import { ARENA, RULES } from './shared/arena.js';
import { stepVehicle, collideVehicles } from './shared/physics.js';
import { Race } from './shared/race.js';

export const PROTOCOL_VERSION = 1;
export const CAR_IDS = ['car1', 'car2', 'car3'];
const TICK_HZ = 30, SNAP_HZ = 20, STALE_MS = 1000;   // input basi > 1 dtk -> mobil berhenti (failsafe)

const clamp1 = v => { v = Number(v); return Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0; };

export function createRaceServer() {
  const wss = new WebSocketServer({ noServer: true });
  const race = new Race(ARENA, RULES);
  const vehicles = new Map(CAR_IDS.map((id, i) => [id, {
    id, kind: 'sim', ...ARENA.spawns[i], speed: 0,
    input: { throttle: 0, steer: 0 }, lastInputAt: 0, driver: null, driverWs: null, deviceWs: null,
  }]));
  for (const id of CAR_IDS) race.addVehicle(id);

  const send = (ws, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
  const broadcast = m => { const s = JSON.stringify(m); for (const ws of wss.clients) if (ws.readyState === 1) ws.send(s); };

  function respawn() {
    CAR_IDS.forEach((id, i) => Object.assign(vehicles.get(id), ARENA.spawns[i], { speed: 0, input: { throttle: 0, steer: 0 } }));
  }

  wss.on('connection', ws => {
    ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
    ws.info = { role: null, car: null };
    send(ws, { type: 'welcome', protocolVersion: PROTOCOL_VERSION, arena: ARENA, rules: RULES, cars: CAR_IDS });

    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw); } catch { return; }
      const now = Date.now(), info = ws.info;

      if (m.type === 'join') {
        info.role = ['driver', 'spectator', 'device'].includes(m.role) ? m.role : 'spectator';
        if (info.role === 'spectator') return;
        const v = vehicles.get(String(m.car));
        if (!v) { send(ws, { type: 'denied', reason: 'mobil tidak dikenal' }); info.role = null; return; }
        if (info.role === 'driver') {
          if (v.driverWs) { send(ws, { type: 'denied', car: v.id, driver: v.driver }); info.role = null; return; }
          v.driverWs = ws; v.driver = String(m.name || 'Pemain').slice(0, 16);
        } else {
          v.deviceWs = ws; v.kind = 'physical';
        }
        info.car = v.id;
        send(ws, { type: 'joined', role: info.role, car: v.id });
        return;
      }
      const v = vehicles.get(info.car);
      if (m.type === 'input' && info.role === 'driver' && v?.driverWs === ws) {
        v.input = { throttle: clamp1(m.throttle), steer: clamp1(m.steer) }; v.lastInputAt = now;
      } else if (m.type === 'admin' && info.role === 'spectator') {
        if (m.action === 'start') { respawn(); race.start(now, CAR_IDS.filter(id => vehicles.get(id).driverWs || vehicles.get(id).deviceWs)); }
        if (m.action === 'reset') { respawn(); race.reset(); }
      } else if (m.type === 'telemetry' && info.role === 'device' && v?.deviceWs === ws) {
        for (const k of ['x', 'y', 'heading', 'speed']) if (Number.isFinite(m[k])) v[k] = m[k];
      } else if (m.type === 'checkpointSeen' && info.role === 'device' && v?.deviceWs === ws) {
        const ev = race.gatePassed(v.id, Number(m.gate), now);   // TODO ADR-0012: validasi HMAC isi QR
        if (ev) broadcast(ev);
      }
    });

    ws.on('close', () => {
      const v = vehicles.get(ws.info.car); if (!v) return;
      if (v.driverWs === ws) { v.driverWs = null; v.driver = null; v.input = { throttle: 0, steer: 0 }; }
      if (v.deviceWs === ws) { v.deviceWs = null; v.kind = 'sim'; }
    });
  });

  // ---- tick simulasi 30 Hz ----
  let last = Date.now();
  const tick = setInterval(() => {
    const now = Date.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    const canDrive = race.canDrive(now);
    for (const v of vehicles.values()) {
      const stale = now - v.lastInputAt > STALE_MS;
      const input = (!canDrive || stale) ? { throttle: 0, steer: 0 } : v.input;
      const cap = race.capOf(v.id, now);
      if (v.kind === 'physical') {
        // mobil fisik: kirim perintah yang sudah dibatasi; posisinya dari telemetry perangkat
        send(v.deviceWs, { type: 'control', throttle: input.throttle * cap, steer: input.steer, cap });
        continue;
      }
      const prev = { x: v.x, y: v.y };
      stepVehicle(v, input, dt, ARENA, { cap, shield: race.shieldOf(v.id, now) });
      const ev = race.checkCrossing(v.id, prev, v, now);
      if (ev) broadcast(ev);
    }
    collideVehicles([...vehicles.values()].filter(v => v.kind === 'sim'), v => race.shieldOf(v.id, now));
    const result = race.tick(now);
    if (result) broadcast(result);
  }, 1000 / TICK_HZ);

  // ---- snapshot 20 Hz ----
  const snap = setInterval(() => {
    if (wss.clients.size === 0) return;
    const now = Date.now();
    broadcast({
      type: 'snapshot', t: now, phase: race.phase,
      countdownMs: race.phase === 'countdown' ? Math.max(0, race.startAt - now) : 0,
      raceMs: race.phase === 'racing' ? now - race.startAt : 0,
      vehicles: [...vehicles.values()].map(v => {
        const c = race.cars.get(v.id) || {};
        return {
          id: v.id, kind: v.kind, driver: v.driver,
          x: +v.x.toFixed(3), y: +v.y.toFixed(3), heading: +v.heading.toFixed(3), speed: +v.speed.toFixed(2),
          score: c.score || 0, lap: c.lap || 0, nextGate: c.nextGate ?? 1, finished: !!c.finished, place: c.place ?? null,
          powerUp: c.powerUp && c.powerUp.until > now ? { type: c.powerUp.type, remainMs: c.powerUp.until - now } : null,
        };
      }),
      result: race.result,
    });
  }, 1000 / SNAP_HZ);

  return { wss, race, vehicles, close() { clearInterval(tick); clearInterval(snap); wss.close(); } };
}
