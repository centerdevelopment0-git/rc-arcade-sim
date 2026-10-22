// bot.js — Pengemudi otomatis untuk balapan 3D (uji beban & mengisi RC yang kosong).
//
// Tiap bot = satu koneksi 'driver' ke /race. Bot memilih RC yang masih kosong dan
// menyetir menuju gerbang berikutnya (pakai data arena dari server).
//
// Pakai:  node bot.js [jumlah] [alamat]
//   node bot.js 2                              -> 2 bot ke ws://localhost:3000/race
//   node bot.js 1 wss://xxxx-3000.app.github.dev/race

import { WebSocket } from 'ws';

const COUNT = Math.max(1, parseInt(process.argv[2] || '1', 10));
const HOST  = process.argv[3] || 'ws://localhost:3000/race';

function startBot(i) {
  let ws, arena, myCar = null, timer, me = null;
  const connect = () => {
    ws = new WebSocket(HOST);
    ws.on('message', raw => {
      const m = JSON.parse(raw);
      if (m.type === 'welcome') arena = m.arena;
      if (m.type === 'snapshot') {
        if (!myCar) {
          const free = m.vehicles.find(v => !v.driver && v.kind === 'sim');
          if (free) { myCar = free.id; ws.send(JSON.stringify({ type:'join', role:'driver', car:myCar, name:'Bot' + i })); }
        }
        me = m.vehicles.find(v => v.id === myCar);
      }
      if (m.type === 'joined') console.log(`  ✓ Bot${i} menyetir ${m.car.toUpperCase()}`);
      if (m.type === 'denied') myCar = null;
    });
    ws.on('open', () => {
      timer = setInterval(() => {
        if (!me || !arena || ws.readyState !== 1) return;
        // arahkan ke titik tengah gerbang berikutnya, sedikit menjauh dari rintangan tengah
        const g = arena.gates[me.nextGate], tx = (g.x1 + g.x2) / 2, ty = (g.y1 + g.y2) / 2;
        let diff = Math.atan2(ty - me.y, tx - me.x) - me.heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const steer = Math.max(-1, Math.min(1, diff * 2));
        ws.send(JSON.stringify({ type:'input', throttle: Math.abs(diff) > 1.2 ? 0.4 : 0.85, steer, t: Date.now() }));
        if (me.inventory?.boost) ws.send(JSON.stringify({ type:'skill', skill:'boost' }));
      }, 50);
    });
    ws.on('close', () => { clearInterval(timer); myCar = null; setTimeout(connect, 1000); });
    ws.on('error', () => {});
  };
  connect();
}

console.log(`\n🤖 ${COUNT} bot -> ${HOST}  (Ctrl+C untuk berhenti)\n`);
for (let i = 1; i <= COUNT; i++) startBot(i);
