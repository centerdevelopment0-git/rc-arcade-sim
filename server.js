// server.js — Relay "cloud" multi-mobil untuk RC Arcade Sim (karya orisinal).
//
// Peran: ini "internet"-nya. Mengatur BANYAK mobil (RC1, RC2, ...) dan banyak
// kontroler (HP) sekaligus, meneruskan perintah ke mobil yang tepat, telemetry
// balik ke kontroler yang tepat, dan menyiarkan STATISTIK ke layar monitor.
//
// Tiga peran klien:
//   - 'controller' : HP pemain. Terikat ke satu mobil (field `car`).
//   - 'car'        : satu mobil (sim atau RC fisik). Punya id (`car`).
//   - 'monitor'    : dashboard. Menerima statistik seluruh sistem.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// ---------- Skill (SCALABLE) ----------
// Tambah skill baru cukup tulis satu baris di SKILLS. Semua UI & logika ikut otomatis.
//   duration  : berapa lama aktif (ms)
//   cooldown  : jeda sebelum bisa dipakai lagi (ms)
//   speedMul  : pengali kecepatan maks selama aktif (base tanpa skill = BASE_SPEED_FACTOR)
const BASE_SPEED_FACTOR = 0.7;   // default 70% dari kecepatan maksimal
const SKILLS = [
  { id:'turbo', name:'Turbo', icon:'⚡', duration:3000, cooldown:6000, speedMul:1.0, desc:'Kecepatan maksimal 3 dtk' },
  // Contoh skill lain — hapus // untuk mengaktifkan, bebas tambah sebanyak mungkin:
  // { id:'nitro', name:'Nitro', icon:'🔥', duration:1500, cooldown:9000, speedMul:1.4, desc:'Dorongan ekstra 1,5 dtk' },
  // { id:'rem',   name:'Rem',   icon:'🛑', duration:800,  cooldown:3000, speedMul:0.2, desc:'Pelan sejenak' },
];
const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));

// hitung status tiap skill sebuah mobil + pengali kecepatan efektif
function skillsSnapshot(c, now){
  let speedMul = BASE_SPEED_FACTOR;
  const list = SKILLS.map(sk => {
    const a = c.skills[sk.id] || 0, dt = a ? now - a : Infinity;
    let state = 'standby', remain = 0;
    if (a) {
      if (dt < sk.duration) { state = 'active'; remain = sk.duration - dt; speedMul = Math.max(speedMul, sk.speedMul); }
      else if (dt < sk.duration + sk.cooldown) { state = 'cooldown'; remain = sk.duration + sk.cooldown - dt; }
    }
    return { id:sk.id, name:sk.name, icon:sk.icon, state, remain:Math.max(0, Math.round(remain)) };
  });
  return { list, speedMul };
}

// ---------- 1) Server file statis ----------
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const file = path.join(PUBLIC, path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

// ---------- 2) Registry & statistik ----------
const wss = new WebSocketServer({ server });
const clients = new Map();   // ws -> { role, car }
const cars = new Map();      // carId -> { carWs, controllers:Set<ws>, ctrl, tel, lastCtrl, lastTel, cps, tps }
const monitors = new Set();
let gIn = 0, gOut = 0, gInPerSec = 0, gOutPerSec = 0;
const startedAt = Date.now();

function getCar(id) {
  if (!cars.has(id))
    cars.set(id, { carWs:null, controllers:new Set(), driver:null, lastThr:0, lastStr:0,
                   onlineSince:0, skills:{}, ctrl:0, tel:0, lastCtrl:0, lastTel:0, cps:0, tps:0 });
  return cars.get(id);
}
function out(ws, obj) { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(obj)); gOut++; } }

function presence(carId) {
  const c = cars.get(carId); if (!c) return;
  const msg = { type:'presence', car:carId, carOnline:!!c.carWs,
                controllers:c.controllers.size, driver:c.driver };
  out(c.carWs, msg);
  for (const w of c.controllers) out(w, msg);
}

wss.on('connection', (ws) => {
  clients.set(ws, { role:null, car:null });

  ws.on('message', (raw) => {
    gIn++;
    let m; try { m = JSON.parse(raw); } catch { return; }
    const info = clients.get(ws);

    if (m.type === 'hello') {
      info.role = ['controller','car','monitor'].includes(m.role) ? m.role : 'controller';
      info.car  = String(m.car || 'car1');
      info.name = String(m.name || 'Pemain').slice(0, 24);
      if (info.role === 'monitor') { monitors.add(ws); return; }
      const c = getCar(info.car);
      if (info.role === 'car') { c.carWs = ws; c.onlineSince = Date.now(); }
      else {
        // aturan: 1 kontroler aktif per mobil
        if (c.controllers.size >= 1) {
          out(ws, { type:'denied', car:info.car, driver:c.driver });
          console.log(`[x] ${info.name} ditolak di ${info.car} (dipakai ${c.driver})`);
          return;
        }
        c.controllers.add(ws); c.driver = info.name;
      }
      console.log(`[+] ${info.role} ${info.name||''} -> ${info.car}`);
      presence(info.car);
      return;
    }

    // perintah kontrol: controller -> mobil terikat
    if (m.type === 'control' && info.role === 'controller') {
      const c = cars.get(info.car); if (!c || !c.controllers.has(ws)) return; // hanya kontroler aktif
      c.ctrl++; c.lastCtrl = Date.now();
      c.lastThr = m.throttle||0; c.lastStr = m.steer||0;               // rekam isi input terakhir
      out(c.carWs, { type:'control', car:info.car, throttle:m.throttle||0, steer:m.steer||0, t:m.t });
    }
    // telemetry: mobil -> semua kontroler mobil itu
    else if (m.type === 'telemetry' && info.role === 'car') {
      const c = cars.get(info.car); if (!c) return;
      c.tel++; c.lastTel = Date.now();
      for (const w of c.controllers) out(w, { type:'telemetry', car:info.car, ...m });
    }
    // aktivasi skill: hanya kontroler aktif, dan hanya kalau skill sedang standby
    else if (m.type === 'skill' && info.role === 'controller') {
      const c = cars.get(info.car); if (!c || !c.controllers.has(ws)) return;
      const sk = SKILL_BY_ID[m.skill]; if (!sk) return;
      const now = Date.now(), a = c.skills[sk.id] || 0, dt = a ? now - a : Infinity;
      if (!a || dt >= sk.duration + sk.cooldown) {
        c.skills[sk.id] = now;
        console.log(`[*] ${info.car} pakai skill ${sk.id} (${info.name})`);
      }
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws); clients.delete(ws);
    if (!info) return;
    if (info.role === 'monitor') { monitors.delete(ws); return; }
    const c = cars.get(info.car); if (!c) return;
    if (info.role === 'car' && c.carWs === ws) c.carWs = null;
    if (info.role === 'controller' && c.controllers.has(ws)) {
      c.controllers.delete(ws);
      if (c.controllers.size === 0) c.driver = null;   // mobil bebas lagi
    }
    console.log(`[-] ${info.role} x ${info.car}`);
    presence(info.car);
  });
});

// ---------- 3) Hitung laju pesan per detik ----------
setInterval(() => {
  gInPerSec = gIn; gOutPerSec = gOut; gIn = 0; gOut = 0;
  for (const c of cars.values()) { c.cps = c.ctrl; c.tps = c.tel; c.ctrl = 0; c.tel = 0; }
}, 1000);

// ---------- 4) Siarkan statistik ke monitor (5x/detik) ----------
setInterval(() => {
  if (monitors.size === 0) return;
  let nControllers = 0, nCars = 0;
  for (const info of clients.values()) {
    if (info.role === 'controller') nControllers++;
    else if (info.role === 'car') nCars++;
  }
  const now = Date.now();
  const carList = [...cars.entries()].map(([id, c]) => ({
    id, online:!!c.carWs, controllers:c.controllers.size, driver:c.driver,
    throttle:c.lastThr, steer:c.lastStr, onlineSince:c.onlineSince,
    skills: skillsSnapshot(c, now).list,
    cps:c.cps, tps:c.tps, lastCtrl:c.lastCtrl, lastTel:c.lastTel,
  }));
  const stats = {
    type:'stats', now, uptime:Math.floor((now-startedAt)/1000),
    clients:{ controllers:nControllers, cars:nCars, monitors:monitors.size, total:clients.size },
    global:{ inPerSec:gInPerSec, outPerSec:gOutPerSec },
    cars: carList,
  };
  for (const w of monitors) out(w, stats);
}, 200);

// ---------- Siarkan status skill ke tiap mobil + kontrolernya (buat efek & icon) ----------
setInterval(() => {
  const now = Date.now();
  for (const [id, c] of cars) {
    if (!c.carWs && c.controllers.size === 0) continue;
    const snap = skillsSnapshot(c, now);
    const msg = { type:'skills', car:id, skills:snap.list, speedMul:snap.speedMul };
    out(c.carWs, msg);
    for (const w of c.controllers) out(w, msg);
  }
}, 200);

// ---------- 5) Info koneksi ----------
function lanIPs() {
  const r = [];
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) r.push(i.address);
  return r;
}
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=== RC Arcade Sim — relay multi-mobil aktif ===');
  console.log(`Arena (5 mobil)     : http://localhost:${PORT}/arena.html?n=5`);
  console.log(`Dashboard monitor   : http://localhost:${PORT}/monitor.html`);
  console.log(`Keyboard (laptop)   : http://localhost:${PORT}/keyboard.html   (pilih mobil: 1-5, setir: WASD/panah)`);
  for (const ip of lanIPs())
    console.log(`Kontroler dari HP   : http://${ip}:${PORT}/controller.html?car=car1`);
  console.log('\nBot (beban/otomatis): node bot.js 3     (3 HP palsu di car1..car3; car4 & car5 kamu setir manual)\n');
});
