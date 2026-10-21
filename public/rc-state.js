// rc-state.js — Spec state & kode LED RC (dipakai arena.html & monitor.html).
// Juga jadi acuan pola LED untuk firmware RC car fisik (ESP32) nanti.
//
// Tiap state punya POLA KEDIP berbeda supaya bisa dibedakan dari lampunya saja:
//   off     : mati
//   solid   : nyala terus
//   slow    : kedip lambat   (~0,6 Hz)
//   fast    : kedip cepat    (~4 Hz)
//   flicker : kedip sangat cepat (~8 Hz)
//   double  : kedip ganda lalu jeda (pola error/failsafe)

const RC_STATES = {
  OFF:        { key:'OFF',        label:'MATI',            color:'#666',    pattern:'off',     desc:'Mobil mati / tidak terhubung ke server' },
  CONNECTING: { key:'CONNECTING', label:'MENYAMBUNG',      color:'#ffd23f', pattern:'fast',    desc:'Nyala, sedang menyambung ke internet' },
  STANDBY:    { key:'STANDBY',    label:'STANDBY',         color:'#5cc8ff', pattern:'slow',    desc:'Online, menunggu pengontrol' },
  READY:      { key:'READY',      label:'SIAP',            color:'#2ee98b', pattern:'solid',   desc:'Pengontrol terpasang, siap (idle)' },
  RECEIVING:  { key:'RECEIVING',  label:'TERIMA PERINTAH', color:'#2effa0', pattern:'flicker', desc:'Sedang menerima perintah gerak' },
  LOST:       { key:'LOST',       label:'SINYAL HILANG',   color:'#ff5555', pattern:'double',  desc:'Perintah putus > 0,6 dtk → failsafe' },
};

// Tentukan state dari sinyal yang ada.
// x = { online, controllers, msSinceCtrl, moving, justConnected }
function rcState(x){
  if (!x.online)            return RC_STATES.OFF;
  if (x.justConnected)      return RC_STATES.CONNECTING;
  if (!x.controllers)       return RC_STATES.STANDBY;
  if (x.msSinceCtrl > 600)  return RC_STATES.LOST;       // failsafe
  if (x.moving && x.msSinceCtrl < 250) return RC_STATES.RECEIVING;
  return RC_STATES.READY;
}

// Apakah LED menyala pada waktu t (ms) untuk pola tertentu?
function ledOn(pattern, t){
  switch (pattern){
    case 'off':     return false;
    case 'solid':   return true;
    case 'slow':    return (t % 1600) < 800;
    case 'fast':    return (t % 240)  < 130;
    case 'flicker': return (t % 120)  < 60;
    case 'double':  { const p = t % 1500; return p < 140 || (p >= 280 && p < 420); }
    default:        return true;
  }
}

// biar bisa dipakai juga sebagai module kalau perlu
if (typeof module !== 'undefined') module.exports = { RC_STATES, rcState, ledOn };
