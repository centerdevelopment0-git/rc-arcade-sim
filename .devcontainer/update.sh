#!/usr/bin/env bash
# Ambil kode terbaru dari GitHub lalu (re)start server.
# Otomatis dijalankan tiap Codespace menyala (start.sh); manual: npm run update
cd "$(dirname "$0")/.."
before=$(git rev-parse HEAD)
if [ -z "$(git status --porcelain --untracked-files=no)" ]; then
  git pull --ff-only origin "$(git rev-parse --abbrev-ref HEAD)" || echo "⚠️  git pull gagal — server tetap memakai kode yang ada."
else
  echo "⚠️  Ada perubahan lokal yang belum di-commit — git pull dilewati."
fi
# dependensi hanya dipasang ulang kalau berubah (atau belum ada)
if [ ! -d node_modules ] || ! git diff --quiet "$before" HEAD -- package.json package-lock.json; then npm ci; fi
pkill -f "^node server.js" 2>/dev/null && sleep 1
nohup setsid npm start > /tmp/rc-server.log 2>&1 &
echo "✅ Server jalan dengan kode: $(git log --oneline -1)"
