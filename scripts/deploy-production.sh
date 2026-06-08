#!/usr/bin/env bash
# Deploy Golden Fisheries to the VPS (goldenfisheries.in).
#
# One-time server setup:
#   1. Create frontend/.env.production (see frontend/.env.production.example)
#   2. Ensure backend/.env has CORS_ORIGIN=https://goldenfisheries.in
#   3. Install nginx site: see deploy/nginx/goldenfisheries.conf header
#
# Usage (on VPS):
#   cd ~/Golden-fisheries && bash scripts/deploy-production.sh

set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/goldenfisheries}"
PM2_APP="${PM2_APP:-golden-api}"
BRANCH="${BRANCH:-main}"

echo "==> Deploy from ${REPO_DIR} to ${WEB_ROOT}"

cd "${REPO_DIR}"
git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"
echo "    Git: $(git log -1 --oneline)"

echo "==> Backend"
cd "${REPO_DIR}/backend"
npm install --omit=dev
if pm2 describe "${PM2_APP}" >/dev/null 2>&1; then
  pm2 restart "${PM2_APP}"
else
  pm2 start src/server.js --name "${PM2_APP}"
  pm2 save
fi

echo "==> Frontend build"
cd "${REPO_DIR}/frontend"
if [[ ! -f .env.production ]]; then
  echo "ERROR: missing frontend/.env.production — copy from .env.production.example"
  exit 1
fi
npm install
npm run build

echo "==> Sync dist -> ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
rsync -a --delete "${REPO_DIR}/frontend/dist/" "${WEB_ROOT}/"

echo "==> Reload nginx"
nginx -t
systemctl reload nginx

echo "==> Done"
echo "    Site:  https://goldenfisheries.in"
echo "    Files: $(ls -1 "${WEB_ROOT}/index.html" 2>/dev/null && stat -c '%y' "${WEB_ROOT}/index.html" || echo 'index.html missing')"
curl -sf http://127.0.0.1:5000/health | head -c 120 || echo "    WARN: backend health check failed"
