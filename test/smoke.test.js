// test/smoke.test.js — uji asap end-to-end: jalankan server asli, sambungkan HP (driver),
// layar laptop (spectator), dashboard (monitor), dan mobil fisik (device) lewat WebSocket /race.
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

// buka koneksi ke /race, kumpulkan semua pesan masuk
const open = () => new Promise((res, rej) => { const ws = new WebSocket(WS + '/race'), msgs = [];
  ws.on('message', d => msgs.push(JSON.parse(d))); ws.on('open', () => res({ ws, msgs })); ws.on('error', rej); });
const send = (c, m) => c.ws.send(JSON.stringify(m));
async function waitFor(msgs, pred, ms = 2000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = msgs.find(pred); if (m) return m;
    await new Promise(r => setTimeout(r, 20));
  }
  throw new Error('pesan tidak datang');
}

test('halaman & health check tersaji, halaman arena lama sudah tidak ada', async () => {
  for (const p of ['/', '/race3d.html', '/monitor.html', '/vendor/qrcode.js', '/shared/physics.js', '/vendor/three/three.module.min.js'])
    assert.equal((await fetch(HTTP + p)).status, 200, p);
  for (const p of ['/arena.html', '/controller.html', '/keyboard.html', '/car.html', '/rc-state.js'])
    assert.equal((await fetch(HTTP + p)).status, 404, p);
  const h = await (await fetch(HTTP + '/healthz')).json();
  assert.equal(h.ok, true);
  assert.equal((await fetch(HTTP + '/../server.js')).status, 404);
});

test('WebSocket selain /race ditolak (relay lama dihapus)', async () => {
  const ws = new WebSocket(WS + '/');
  await new Promise(res => { ws.on('error', res); ws.on('close', res); });
  assert.notEqual(ws.readyState, WebSocket.OPEN);
});

test('balapan 3D: penonton mulai, pengemudi bergerak, kursi kedua ditolak', async () => {
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
    send(hp, { type:'skill', skill:'boost' });     // pemain menekan tombol skill di HP
    await waitFor(tv.msgs, m => m.type === 'skillUsed' && m.vehicleId === 'car3');
    dev.msgs.length = 0;
    const c2 = await waitFor(dev.msgs, m => m.type === 'control' && m.throttle > 0.9, 2000);
    assert.equal(c2.cap, 1);                       // boost: 100%
  } finally { clearInterval(timer); }
  send(tv, { type:'admin', action:'reset' });
  dev.ws.close(); hp.ws.close(); tv.ws.close();
});

test('balapan 3D: chat, klakson, dan statistik traffic', async () => {
  const hp = await open(), tv = await open();
  send(tv, { type:'join', role:'spectator' });
  send(hp, { type:'join', role:'driver', car:'car2', name:'Chatter' });
  await waitFor(hp.msgs, m => m.type === 'joined');
  send(hp, { type:'chat', text:'  halo\u0007 <b>semua</b>  ' + 'x'.repeat(200) });
  const c = await waitFor(tv.msgs, m => m.type === 'chat');
  assert.equal(c.from, 'Chatter'); assert.equal(c.car, 'car2');
  assert.ok(c.text.startsWith('halo  <b>semua</b>'));   // karakter kontrol dibuang, HTML di-escape di klien
  assert.ok(c.text.length <= 80);
  send(hp, { type:'skill', skill:'horn' });
  assert.equal((await waitFor(tv.msgs, m => m.type === 'horn')).vehicleId, 'car2');
  const s = await waitFor(tv.msgs, m => m.type === 'snapshot' && m.net && m.net.clients.some(x => x.name === 'Chatter'), 3000);
  assert.ok(s.net.outPerSec >= 0);
  // riwayat chat dikirim ke klien baru
  const late = await open();
  assert.ok((await waitFor(late.msgs, m => m.type === 'welcome')).chat.some(m => m.from === 'Chatter'));
  hp.ws.close(); tv.ws.close(); late.ws.close();
});

test('dashboard: input HP diterapkan ke mobil sim 3D (output), berhenti saat input basi', async () => {
  const mon = await open(), hp = await open(), tv = await open();
  send(tv, { type:'join', role:'spectator' });
  send(tv, { type:'admin', action:'reset' });          // latihan bebas: mobil langsung bisa jalan
  send(mon, { type:'join', role:'monitor' });
  send(hp, { type:'join', role:'driver', car:'car2', name:'IO' });
  await waitFor(hp.msgs, m => m.type === 'joined');
  const car2 = s => s.vehicles.find(v => v.id === 'car2');
  const timer = setInterval(() => send(hp, { type:'input', throttle:1, steer:0.5, t:Date.now() }), 50);
  try {
    const s = await waitFor(mon.msgs, m => m.type === 'snapshot' && car2(m).io.outPerSec > 0, 3000);
    const v = car2(s);
    assert.ok(v.io.inPerSec > 0, 'input masuk tercatat');
    assert.ok(v.io.msSinceOutput < 300, 'output baru saja diterapkan');
    assert.deepEqual(v.input, { throttle:1, steer:0.5 });
    assert.ok(s.net.clients.some(c => c.role === 'monitor'));
  } finally { clearInterval(timer); }
  await waitFor(mon.msgs, m => m.type === 'snapshot' && car2(m).io.msSinceInput > 1100 && car2(m).io.msSinceOutput > 1000, 4000);
  mon.ws.close(); hp.ws.close(); tv.ws.close();
});

test('ganti RC: join ulang pindah mobil, leave melepas mobil', async () => {
  const hp = await open(), tv = await open();
  send(tv, { type:'join', role:'spectator' });
  send(hp, { type:'join', role:'driver', car:'car1', name:'Pindah' });
  await waitFor(hp.msgs, m => m.type === 'joined' && m.car === 'car1');
  send(hp, { type:'join', role:'driver', car:'car3', name:'Pindah' });
  await waitFor(hp.msgs, m => m.type === 'joined' && m.car === 'car3');
  const drv = (s, id) => s.vehicles.find(v => v.id === id).driver;
  await waitFor(tv.msgs, m => m.type === 'snapshot' && drv(m, 'car1') === null && drv(m, 'car3') === 'Pindah');
  send(hp, { type:'leave' });
  tv.msgs.length = 0;
  await waitFor(tv.msgs, m => m.type === 'snapshot' && drv(m, 'car3') === null);
  hp.ws.close(); tv.ws.close();
});
