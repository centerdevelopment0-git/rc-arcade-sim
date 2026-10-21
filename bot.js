// bot.js — "HP palsu" otomatis untuk menguji beban & menggerakkan mobil.
//
// Tiap bot = satu koneksi 'controller' ke server, mengendalikan satu mobil
// (car1, car2, ...) dengan pola gerak buatan (setir & gas berosilasi).
// Berguna untuk: simulasi banyak user, uji beban server, dan mengisi arena
// tanpa perlu banyak HP sungguhan.
//
// Pakai:  node bot.js [jumlah] [host]
//   node bot.js 3                    -> 3 bot -> car1..car3, ke ws://localhost:3000
//   node bot.js 5 ws://10.0.0.8:3000 -> 5 bot ke server lain

import { WebSocket } from 'ws';

const COUNT = Math.max(1, parseInt(process.argv[2] || '3', 10));
const HOST  = process.argv[3] || 'ws://localhost:3000';

console.log(`\n🤖 Menjalankan ${COUNT} bot -> ${HOST}`);
console.log('   Tiap bot mengendalikan car1..car%d. Ctrl+C untuk berhenti.\n', COUNT);

function startBot(i) {
  const car = 'car' + i;
  const phase = Math.random() * Math.PI * 2;   // beda-beda tiap bot
  let ws, timer, t0 = Date.now();

  function connect() {
    ws = new WebSocket(HOST);
    ws.on('open', () => {
      ws.send(JSON.stringify({ type:'hello', role:'controller', car, name:'Bot'+i }));
      console.log(`  ✓ bot ${car} tersambung`);
      // kirim perintah buatan 20x/detik
      timer = setInterval(() => {
        if (ws.readyState !== 1) return;
        const t = (Date.now() - t0) / 1000;
        const steer    = Math.sin(t * 1.3 + phase);            // belok kiri-kanan halus
        const throttle = 0.55 + 0.45 * Math.sin(t * 0.7 + phase); // gas naik-turun (selalu maju-ish)
        ws.send(JSON.stringify({ type:'control', throttle:+throttle.toFixed(2), steer:+steer.toFixed(2), t:Date.now() }));
      }, 50);
    });
    ws.on('close', () => { clearInterval(timer); setTimeout(connect, 1000); });
    ws.on('error', () => {});
  }
  connect();
}

for (let i = 1; i <= COUNT; i++) startBot(i);
