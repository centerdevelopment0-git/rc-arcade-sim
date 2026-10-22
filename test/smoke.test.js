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
