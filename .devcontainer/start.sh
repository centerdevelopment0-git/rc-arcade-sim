#!/usr/bin/env bash
# Dijalankan tiap Codespace menyala: start server di latar belakang,
# lalu jadikan port 3000 publik (HP bisa buka tanpa login GitHub).
nohup setsid npm start > /tmp/rc-server.log 2>&1 &

if [ -n "$CODESPACE_NAME" ]; then
  for i in $(seq 1 30); do
    if gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" >/dev/null 2>&1; then
      echo "Port 3000 publik: https://$CODESPACE_NAME-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}/"
      exit 0
    fi
    sleep 2
  done
  echo "Gagal membuat port publik otomatis. Buka tab PORTS, klik kanan port 3000 > Port Visibility > Public."
fi
