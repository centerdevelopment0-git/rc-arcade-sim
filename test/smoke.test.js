// test/smoke.test.js — uji asap end-to-end: jalankan server asli, sambungkan
// mobil + kontroler lewat WebSocket, cek alur HP -> server -> mobil.
// Jalankan: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { WebSocket } from 'ws';

const PORT = 3900 + Math.floor(Math.random() * 90);
const HTTP = `http://localhost:${PORT}`, WS = `ws://localhost:${PORT}`;
let proc;

before(async () => {
  proc = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(HTTP + '/healthz')).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('server tidak menyala');
});
after(() => proc.kill());

// sambung + kirim hello, kumpulkan semua pesan masuk
function client(hello) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS), msgs = [];
    ws.on('message', d => msgs.push(JSON.parse(d)));
    ws.on('open', () => { ws.send(JSON.stringify({ type:'hello', ...hello })); resolve({ ws, msgs }); });
    ws.on('error', reject);
  });
}
async function waitFor(msgs, pred, ms = 2000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = msgs.find(pred); if (m) return m;
    await new Promise(r => setTimeout(r, 20));
  }
  throw new Error('pesan tidak datang');
}

test('halaman & health check tersaji', async () => {
  for (const p of ['/', '/arena.html', '/controller.html', '/keyboard.html', '/monitor.html', '/car.html', '/rc-state.js'])
    assert.equal((await fetch(HTTP + p)).status, 200, p);
  const h = await (await fetch(HTTP + '/healthz')).json();
  assert.equal(h.ok, true);
  assert.equal((await fetch(HTTP + '/../server.js')).status, 404);
});

test('kontrol diteruskan ke mobil (dengan clamp) dan telemetry balik', async () => {
  const car = await client({ role:'car', car:'car7' });
  const hp  = await client({ role:'controller', car:'car7', name:'Tes' });
  await waitFor(hp.msgs, m => m.type === 'presence' && m.carOnline);

  hp.ws.send(JSON.stringify({ type:'control', throttle:5, steer:'x', t:Date.now() }));
  const ctrl = await waitFor(car.msgs, m => m.type === 'control');
  assert.equal(ctrl.throttle, 1);   // di-clamp ke 1
  assert.equal(ctrl.steer, 0);      // bukan angka -> 0

  car.ws.send(JSON.stringify({ type:'telemetry', x:1, y:2, heading:0, speed:3 }));
  const tel = await waitFor(hp.msgs, m => m.type === 'telemetry');
  assert.equal(tel.speed, 3);

  await waitFor(hp.msgs, m => m.type === 'skills' && Array.isArray(m.skills));
  car.ws.close(); hp.ws.close();
});

test('kontroler kedua ditolak, mobil bebas lagi setelah yang pertama keluar', async () => {
  const a = await client({ role:'controller', car:'car8', name:'A' });
  await waitFor(a.msgs, m => m.type === 'presence');
  const b = await client({ role:'controller', car:'car8', name:'B' });
  const denied = await waitFor(b.msgs, m => m.type === 'denied');
  assert.equal(denied.driver, 'A');
  a.ws.close(); b.ws.close();
  await new Promise(r => setTimeout(r, 150));
  const c = await client({ role:'controller', car:'car8', name:'C' });
  const p = await waitFor(c.msgs, m => m.type === 'presence');
  assert.equal(p.driver, 'C');
  c.ws.close();
});

test('monitor menerima statistik', async () => {
  const mon = await client({ role:'monitor' });
  const s = await waitFor(mon.msgs, m => m.type === 'stats');
  assert.ok(s.clients.monitors >= 1);
  mon.ws.close();
});

test('balapan 3D: penonton mulai, pengemudi bergerak, kursi kedua ditolak', async () => {
  const open = () => new Promise((res, rej) => { const ws = new WebSocket(WS + '/race'), msgs = [];
    ws.on('message', d => msgs.push(JSON.parse(d))); ws.on('open', () => res({ ws, msgs })); ws.on('error', rej); });
  const send = (c, m) => c.ws.send(JSON.stringify(m));
  const tv = await open(), hp = await open(), hp2 = await open();
  const welcome = await waitFor(tv.msgs, m => m.type === 'welcome');
  assert.equal(welcome.arena.gates.length, 4);
  send(tv, { type:'join', role:'spectator' });
  send(hp, { type:'join', role:'driver', car:'car1', name:'HP1' });
  await waitFor(hp.msgs, m => m.type === 'joined');
  send(hp2, { type:'join', role:'driver', car:'car1', name:'HP2' });
  assert.equal((await waitFor(hp2.msgs, m => m.type === 'denied')).driver, 'HP1');

  send(tv, { type:'admin', action:'start' });
  await waitFor(tv.msgs, m => m.type === 'snapshot' && m.phase === 'countdown');
  const timer = setInterval(() => send(hp, { type:'input', throttle:1, steer:0, t:Date.now() }), 50);
  try {
    const s = await waitFor(tv.msgs, m => m.type === 'snapshot' && m.phase === 'racing' && m.vehicles[0].x > 1.5, 6000);
    assert.equal(s.vehicles[0].driver, 'HP1');
  } finally { clearInterval(timer); }
  tv.ws.close(); hp.ws.close(); hp2.ws.close();
});

test('balapan 3D: mobil fisik (device) dapat perintah ber-cap dan gerbang dari QR dihitung', async () => {
  const open = () => new Promise((res, rej) => { const ws = new WebSocket(WS + '/race'), msgs = [];
    ws.on('message', d => msgs.push(JSON.parse(d))); ws.on('open', () => res({ ws, msgs })); ws.on('error', rej); });
  const send = (c, m) => c.ws.send(JSON.stringify(m));
  const dev = await open(), hp = await open(), tv = await open();
  send(dev, { type:'join', role:'device', car:'car3' });
  send(hp, { type:'join', role:'driver', car:'car3', name:'Fisik' });
  send(tv, { type:'join', role:'spectator' });
  await waitFor(hp.msgs, m => m.type === 'joined');
  send(tv, { type:'admin', action:'start' });
  await waitFor(tv.msgs, m => m.type === 'snapshot' && m.phase === 'racing', 5000);
  const timer = setInterval(() => send(hp, { type:'input', throttle:1, steer:0, t:Date.now() }), 50);
  try {
    const c = await waitFor(dev.msgs, m => m.type === 'control' && m.throttle > 0, 2000);
    assert.equal(c.throttle, 0.8);                 // batas throttle normal 80%
    send(dev, { type:'checkpointSeen', gate:1 });  // gerbang G1 (boost) terbaca dari QR
    const ev = await waitFor(tv.msgs, m => m.type === 'checkpointPassed' && m.vehicleId === 'car3');
    assert.equal(ev.powerUp, 'boost');
    dev.msgs.length = 0;
    const c2 = await waitFor(dev.msgs, m => m.type === 'control' && m.throttle > 0.9, 2000);
    assert.equal(c2.cap, 1);                       // boost: 100%
  } finally { clearInterval(timer); }
  send(tv, { type:'admin', action:'reset' });
  dev.ws.close(); hp.ws.close(); tv.ws.close();
});
