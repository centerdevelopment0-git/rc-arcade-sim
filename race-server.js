// race-server.js — Room balapan 3D (server authoritative) di jalur WebSocket /race.
//
// Satu room, 3 mobil (car1..car3 = 3 mobil fisik pilot). Tiap mobil bisa:
//   - 'sim'      : fisika jalan di server (shared/physics.js), tick 30 Hz.
//   - 'physical' : perangkat di mobil RC tersambung sebagai role 'device'. Server meneruskan
//                  input (sudah dibatasi cap power-up) ke perangkat, dan menerima posisi
//                  (telemetry) + gerbang terlewati (checkpointSeen, dari QR — ADR-0012).
// Aturan skor/power-up/pemenang SAMA untuk keduanya (shared/race.js).
//
// Klien -> server : join {role:'driver'|'spectator'|'monitor'|'device', car, name}  (join lagi = ganti mobil)
//                   leave {}                            (driver melepas mobil, kembali ke pemilih RC)
//                   input {throttle, steer, t}          (driver, 20 Hz)
//                   skill {skill:'boost'|'shield'|'horn'} (driver, tombol skill)
//                   chat {text}                         (driver & spectator)
//                   admin {action:'start'|'reset'}      (spectator)
//                   telemetry {x,y,heading,speed}       (device)
//                   checkpointSeen {gate}               (device)
// Server -> klien : welcome, denied, snapshot (20 Hz, + statistik traffic), checkpointPassed,
//                   skillUsed, horn, chat, raceResult,
//                   control {throttle, steer, cap}      (ke device)

import { WebSocketServer } from 'ws';
import { ARENA, RULES } from './shared/arena.js';
import { stepVehicle, collideVehicles } from './shared/physics.js';
import { Race } from './shared/race.js';

export const PROTOCOL_VERSION = 1;
export const CAR_IDS = ['car1', 'car2', 'car3'];
const TICK_HZ = 30, SNAP_HZ = 20, STALE_MS = 1000;   // input basi > 1 dtk -> mobil berhenti (failsafe)
const CHAT_MAX = 80, CHAT_HISTORY = 20, CHAT_GAP_MS = 800, HORN_GAP_MS = 1500;

// teks chat: buang karakter kontrol, potong panjang (tampilan klien tetap pakai textContent)
const cleanText = t => String(t ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, CHAT_MAX);

const clamp1 = v => { v = Number(v); return Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0; };

export function createRaceServer() {
  const wss = new WebSocketServer({ noServer: true });
  const race = new Race(ARENA, RULES);
  const vehicles = new Map(CAR_IDS.map((id, i) => [id, {
    id, kind: 'sim', ...ARENA.spawns[i], speed: 0,
    input: { throttle: 0, steer: 0 }, lastInputAt: 0, driver: null, driverWs: null, deviceWs: null,
    // statistik jalur input -> output per mobil (dashboard): input = pesan dari HP,
    // output = perintah yang benar-benar diterapkan ke mobil (fisika sim / control ke perangkat)
    io: { inCount: 0, outCount: 0, inPerSec: 0, outPerSec: 0, lastOutputAt: 0 },
  }]));
  for (const id of CAR_IDS) race.addVehicle(id);

  const chatLog = [];
  // statistik traffic (untuk monitor): pesan & byte per detik, per klien + total
  const net = { inMsgs: 0, outMsgs: 0, outBytes: 0, inPerSec: 0, outPerSec: 0, kbOutPerSec: 0 };
  const out = (ws, s) => { ws.send(s); ws.outMsgs++; net.outMsgs++; net.outBytes += s.length; };
  const send = (ws, m) => { if (ws && ws.readyState === 1) out(ws, JSON.stringify(m)); };
  const broadcast = m => { const s = JSON.stringify(m); for (const ws of wss.clients) if (ws.readyState === 1) out(ws, s); };

  function respawn() {
    CAR_IDS.forEach((id, i) => Object.assign(vehicles.get(id), ARENA.spawns[i], { speed: 0, input: { throttle: 0, steer: 0 } }));
  }

  // lepaskan mobil yang sedang dipegang klien ini (ganti RC / keluar / putus)
  function release(ws) {
    const v = vehicles.get(ws.info.car); if (!v) return;
    if (v.driverWs === ws) { v.driverWs = null; v.driver = null; v.input = { throttle: 0, steer: 0 }; }
    if (v.deviceWs === ws) { v.deviceWs = null; v.kind = 'sim'; }
    ws.info.car = null;
  }

  wss.on('connection', ws => {
    ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
    ws.info = { role: null, car: null, name: null };
    Object.assign(ws, { inMsgs: 0, outMsgs: 0, inPerSec: 0, outPerSec: 0, rtt: null, lastChat: 0, lastHorn: 0 });
    ws.on('pong', () => { if (ws.pingAt) ws.rtt = Date.now() - ws.pingAt; });
    send(ws, { type: 'welcome', protocolVersion: PROTOCOL_VERSION, arena: ARENA, rules: RULES, cars: CAR_IDS, chat: chatLog });

    ws.on('message', raw => {
      ws.inMsgs++; net.inMsgs++;
      let m; try { m = JSON.parse(raw); } catch { return; }
      const now = Date.now(), info = ws.info;

      if (m.type === 'join') {
        release(ws);
        info.role = ['driver', 'spectator', 'monitor', 'device'].includes(m.role) ? m.role : 'spectator';
        if (info.role === 'spectator' || info.role === 'monitor') { info.name = info.role === 'monitor' ? 'Dashboard' : 'Layar'; return; }
        const v = vehicles.get(String(m.car));
        if (!v) { send(ws, { type: 'denied', reason: 'mobil tidak dikenal' }); info.role = null; return; }
        if (info.role === 'driver') {
          if (v.driverWs) { send(ws, { type: 'denied', car: v.id, driver: v.driver }); info.role = null; return; }
          v.driverWs = ws; v.driver = cleanText(m.name).slice(0, 16) || 'Pemain'; info.name = v.driver;
        } else {
          v.deviceWs = ws; v.kind = 'physical';
        }
        info.car = v.id;
        send(ws, { type: 'joined', role: info.role, car: v.id });
        return;
      }
      if (m.type === 'leave') { release(ws); info.role = null; return; }
      const v = vehicles.get(info.car);
      if (m.type === 'input' && info.role === 'driver' && v?.driverWs === ws) {
        v.input = { throttle: clamp1(m.throttle), steer: clamp1(m.steer) }; v.lastInputAt = now; v.io.inCount++;
      } else if (m.type === 'skill' && info.role === 'driver' && v?.driverWs === ws) {
        if (m.skill === 'horn') {
          if (now - ws.lastHorn < HORN_GAP_MS) return;
          ws.lastHorn = now; broadcast({ type: 'horn', vehicleId: v.id });
        } else {
          const ev = race.useSkill(v.id, String(m.skill), now);
          if (ev) broadcast(ev);
        }
      } else if (m.type === 'chat' && (info.role === 'driver' || info.role === 'spectator')) {
        const text = cleanText(m.text);
        if (!text || now - ws.lastChat < CHAT_GAP_MS) return;
        ws.lastChat = now;
        const msg = { type: 'chat', from: info.name || 'Pemain', car: info.car, text, t: now };
        chatLog.push(msg); if (chatLog.length > CHAT_HISTORY) chatLog.shift();
        broadcast(msg);
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

    ws.on('close', () => release(ws));
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
        if (!stale && canDrive) { v.io.outCount++; v.io.lastOutputAt = now; }
        continue;
      }
      if (!stale && canDrive && v.driverWs) { v.io.outCount++; v.io.lastOutputAt = now; }   // input diterapkan ke fisika
      const prev = { x: v.x, y: v.y };
      stepVehicle(v, input, dt, ARENA, { cap, shield: race.shieldOf(v.id, now) });
      const ev = race.checkCrossing(v.id, prev, v, now);
      if (ev) broadcast(ev);
    }
    collideVehicles([...vehicles.values()].filter(v => v.kind === 'sim'), v => race.shieldOf(v.id, now));
    const result = race.tick(now);
    if (result) broadcast(result);
  }, 1000 / TICK_HZ);

  // ---- statistik traffic tiap detik + ukur RTT (ping/pong) tiap 2 dtk ----
  let pingTurn = false;
  const stats = setInterval(() => {
    net.inPerSec = net.inMsgs; net.outPerSec = net.outMsgs; net.kbOutPerSec = +(net.outBytes / 1024).toFixed(1);
    net.inMsgs = net.outMsgs = net.outBytes = 0;
    for (const v of vehicles.values()) { v.io.inPerSec = v.io.inCount; v.io.outPerSec = v.io.outCount; v.io.inCount = v.io.outCount = 0; }
    pingTurn = !pingTurn;
    for (const ws of wss.clients) {
      ws.inPerSec = ws.inMsgs; ws.outPerSec = ws.outMsgs; ws.inMsgs = ws.outMsgs = 0;
      if (pingTurn && ws.readyState === 1) { ws.pingAt = Date.now(); ws.ping(); }
    }
  }, 1000);
  const netSnapshot = () => ({
    inPerSec: net.inPerSec, outPerSec: net.outPerSec, kbOutPerSec: net.kbOutPerSec,
    clients: [...wss.clients].filter(ws => ws.info.role).map(ws => ({
      role: ws.info.role, car: ws.info.car, name: ws.info.name, rtt: ws.rtt, inPerSec: ws.inPerSec, outPerSec: ws.outPerSec })),
  });

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
          gatesPassed: c.gatesPassed || 0, finishMs: c.finishMs ?? null,
          powerUp: c.powerUp && c.powerUp.until > now ? { type: c.powerUp.type, remainMs: c.powerUp.until - now } : null,
          inventory: c.inventory || {},
          input: v.input,
          io: { inPerSec: v.io.inPerSec, outPerSec: v.io.outPerSec,
                msSinceInput: v.lastInputAt ? now - v.lastInputAt : null, msSinceOutput: v.io.lastOutputAt ? now - v.io.lastOutputAt : null },
        };
      }),
      result: race.result,
      net: netSnapshot(),
    });
  }, 1000 / SNAP_HZ);

  return { wss, race, vehicles, close() { clearInterval(tick); clearInterval(snap); clearInterval(stats); wss.close(); } };
}
