// server.js — Server RC Arcade Sim: menyajikan halaman + room balapan 3D (WebSocket /race).
//
// Halaman:
//   /                 halaman depan (link + QR)
//   /race3d.html      layar laptop (arena, papan skor, kisi POV) — ?drive = mode setir di HP
//   /monitor.html     dashboard koneksi: input & output per mobil, RTT, beban
// Logika balapan ada di race-server.js + shared/.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRaceServer } from './race-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
// prefix URL -> folder (logika sim bersama & Three.js disajikan dari server sendiri, tanpa CDN)
const STATIC_DIRS = [
  ['/shared/', path.join(__dirname, 'shared')],
  ['/vendor/three/', path.join(__dirname, 'node_modules', 'three', 'build')],
  ['/', PUBLIC],
];
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml' };
const startedAt = Date.now();

function lanIPs() {
  const r = [];
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) r.push(i.address);
  return r;
}

const race = createRaceServer();

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  // health check (dipakai Render & tes otomatis); `lan` dipakai QR saat dibuka via localhost
  if (url === '/healthz') {
    res.writeHead(200, { 'Content-Type':'application/json' });
    res.end(JSON.stringify({ ok:true, uptime:Math.floor((Date.now() - startedAt) / 1000), clients:race.wss.clients.size,
                             lan:lanIPs().map(ip => `http://${ip}:${PORT}`) }));
    return;
  }
  if (url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (url === '/') url = '/index.html';
  const [prefix, dir] = STATIC_DIRS.find(([p]) => url.startsWith(p));
  const file = path.join(dir, path.normalize(url.slice(prefix.length - 1)).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(dir + path.sep)) { res.writeHead(404); res.end('404'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('upgrade', (req, socket, head) => {
  if (req.url.split('?')[0] !== '/race') { socket.destroy(); return; }
  race.wss.handleUpgrade(req, socket, head, ws => race.wss.emit('connection', ws, req));
});

// Heartbeat: putuskan koneksi mati (HP keluar jangkauan, tab di-suspend), supaya mobil
// tidak terkunci "pengemudi hantu". Ping juga menjaga WebSocket hidup di balik proxy cloud.
setInterval(() => {
  for (const ws of race.wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 15000);

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=== RC Arcade Sim — balapan 3D aktif ===');
  console.log(`Layar laptop  : http://localhost:${PORT}/race3d.html   (HP scan QR di layar itu)`);
  console.log(`Dashboard     : http://localhost:${PORT}/monitor.html`);
  for (const ip of lanIPs()) console.log(`HP (WiFi sama): http://${ip}:${PORT}/race3d.html?drive`);
  console.log('\nBot (mobil otomatis): node bot.js 2   (bot menyetir RC yang masih kosong)\n');
});
