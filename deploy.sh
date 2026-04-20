#!/bin/bash
# e-Khadi one-command deploy
# Usage: ./deploy.sh "commit message"
# Or:    ./deploy.sh   (uses "Deploy updates" as message)

set -e

MSG="${1:-Deploy updates}"
WEB_DIR="$(cd "$(dirname "$0")/web" && pwd)"
SERVER="root@110.238.73.51"
SERVER_PATH="/root/ekhadi-shopware-plugin/web"

echo "🚀 e-Khadi Deploy: $MSG"

# 1. Commit any local changes
cd "$WEB_DIR"
if [[ -n $(git status --porcelain) ]]; then
  echo "📦 Staging and committing local changes..."
  git add -A
  git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
fi

# 2. Rsync to server
echo "📤 Syncing files to server..."
sshpass -p 'EkhadiDB2026!' rsync -az \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env.local' \
  --exclude '.env' \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$WEB_DIR/" \
  "$SERVER:$SERVER_PATH/"

# 3. Install, migrate, build, restart on server
echo "🔧 Building on server..."
sshpass -p 'EkhadiDB2026!' ssh -o StrictHostKeyChecking=no "$SERVER" \
  "cd $SERVER_PATH && npm install --silent && npx prisma db push --accept-data-loss 2>&1 | grep -E '(sync|error|Error)' && npm run build 2>&1 | tail -5 && pm2 restart ekhadi --update-env && echo '✅ Live at http://110.238.73.51:3000'"

echo "✅ Deploy complete!"