# 04 — Analisis Reverse Engineering (App Acuan)

**Subjek:** RC Arcade — `com.capygang.rcarcade1` (Play Store)
**Tujuan dokumen:** *memahami* bagaimana app sejenis dirancang, sebagai referensi
belajar & desain. **Bukan** salinan kode/aset/brand app tersebut.
**Tanggal:** 2026-10-20

---

## 1. Ringkasan temuan
RC Arcade adalah aplikasi **Flutter** (Dart) yang memadukan **kontrol realtime**
dan **streaming video langsung** untuk mengemudikan perangkat RC dari jarak jauh.

## 2. Cara analisis
- APK ditarik dari perangkat via `adb` (app split: `base.apk` + `split_config.*`).
- `base.apk` di-decode dengan **apktool** (manifest/resource) & di-decompile dengan **jadx** (Java).
- Native lib diperiksa dari `split_config.arm64_v8a.apk`.

## 3. Stack teknologi (terbukti dari artefak)
| Lapisan | Bukti | Fungsi |
|---------|-------|--------|
| UI & logika | `libflutter.so`, `io.flutter.*`, `libapp.so` (7,6 MB, Dart AOT) | framework Flutter |
| Video realtime | `libjingle_peerconnection_so.so`, paket `com.cloudwebrtc` | **WebRTC** (feed kamera) |
| Database realtime | URL Realtime Database region `asia-southeast1` | sinkronisasi kontrol/status cepat |
| Backend | plugin `cloud_firestore`, `firebase_auth`, `firebase_messaging`, `firebase_core` | akun, data, notifikasi |
| Login | `google_sign_in` | masuk dgn akun Google |
| Monetisasi | izin `com.android.vending.BILLING`, plugin `in_app_purchase`, izin `CHECK_LICENSE` | beli dalam app |
| Perangkat | izin `BLUETOOTH_*` | pairing ke perangkat RC |
| Media | izin `CAMERA`, `RECORD_AUDIO`; plugin `video_player` | video/audio |

## 4. Izin (AndroidManifest) & artinya
`INTERNET`, `ACCESS_NETWORK_STATE` (jaringan) · `BLUETOOTH_SCAN/CONNECT/ADMIN` (perangkat RC) ·
`CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` (video call) · `WAKE_LOCK` (layar tetap nyala) ·
`BILLING`, `CHECK_LICENSE` (pembelian) · `C2DM RECEIVE` (push notif FCM).
- Entry point: `com.capygang.rcarcade1.MainActivity` (host Flutter).
- Tidak tampak `android:debuggable=true` (build rilis normal).

## 5. Pola arsitektur yang disimpulkan
```
   HP (Flutter)
     │  kontrol (throttle/steer)  ──▶  Firebase Realtime DB  ──▶  perangkat RC
     │                                   (message bus cepat)        (mendengar DB)
     │  ◀───────────── video live (WebRTC P2P) ─────────────────────┘
     └─ Firebase Auth/Firestore/FCM: akun, sesi, pembelian, notifikasi
```
- **Kontrol** lewat Realtime DB: pola umum IoT — payload kecil, latensi rendah, murah.
- **Video** lewat WebRTC: standar untuk video latensi rendah peer-to-peer.
- **Firestore/Auth**: data persisten (user, sesi, transaksi).

## 6. Catatan "di mana logika intinya"
Karena Flutter, **logika bisnis TIDAK di kode Java**. Ia dikompilasi AOT ke dalam
`libapp.so`. Kode `jadx/sources/` sebagian besar hanyalah *glue* Flutter & plugin.
Analisis lebih dalam `libapp.so` butuh tool khusus (mis. Blutter/reFlutter) — **tidak
dilakukan di sini**, karena untuk tujuan kita (memahami arsitektur) stack & manifest sudah cukup.

## 7. Catatan keamanan (level desain, umum)
- "API key" Firebase di app Android **bukan rahasia** (identitas project publik);
  keamanan sebenarnya ada di **Firebase Security Rules** di server.
- Untuk sistem kontrol perangkat fisik, kunci keamanannya: **auth + token sesi +
  satu pengontrol per perangkat + failsafe**. (Kita adopsi prinsip ini di desain orisinal kita.)

## 8. Apa yang kita ambil (ide, bukan ekspresi)
Yang kita pelajari & terapkan secara orisinal:
- Pemisahan **kontrol (realtime bus)** vs **video (WebRTC)**.
- **Failsafe** wajib untuk perangkat bergerak.
- Backend untuk akun/sesi/billing sebagai fase lanjutan.
Yang **tidak** kita ambil: kode Dart, aset, UI, nama/brand, konfigurasi project mereka.
