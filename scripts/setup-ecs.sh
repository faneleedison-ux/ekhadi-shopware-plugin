#!/bin/bash
# Run once on a fresh Huawei ECS Ubuntu 22.04 instance
# Usage: bash setup-ecs.sh
set -euo pipefail

echo "=== e-Khadi ECS Setup ==="

# ── 1. System updates ─────────────────────────────────────────────────────────
apt-get update -y
apt-get upgrade -y

# ── 2. Docker ─────────────────────────────────────────────────────────────────
apt-get install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin
systemctl enable docker
systemctl start docker
# Allow ubuntu user to run docker without sudo
usermod -aG docker ubuntu
echo "✓ Docker installed"

# ── 3. Nginx ──────────────────────────────────────────────────────────────────
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "✓ Nginx installed"

# ── 4. Certbot (Let's Encrypt SSL) ────────────────────────────────────────────
apt-get install -y certbot python3-certbot-nginx
echo "✓ Certbot installed"

# ── 5. Firewall ───────────────────────────────────────────────────────────────
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
echo "✓ Firewall configured (SSH + HTTP/HTTPS)"

# ── 6. Nginx site config ──────────────────────────────────────────────────────
# Copy the nginx config from the repo (assumes you've cloned it or scp'd it)
# cp /path/to/repo/web/nginx.conf /etc/nginx/sites-available/ekhadi
# ln -sf /etc/nginx/sites-available/ekhadi /etc/nginx/sites-enabled/ekhadi
# rm -f /etc/nginx/sites-enabled/default
echo ""
echo "=== NEXT MANUAL STEPS ==="
echo ""
echo "1. Copy nginx config:"
echo "   scp web/nginx.conf ubuntu@YOUR_ECS_IP:/etc/nginx/sites-available/ekhadi"
echo "   ssh ubuntu@YOUR_ECS_IP 'sudo ln -sf /etc/nginx/sites-available/ekhadi /etc/nginx/sites-enabled/ekhadi'"
echo "   ssh ubuntu@YOUR_ECS_IP 'sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx'"
echo ""
echo "2. Point DNS: A record e-khadi.co.za → $(curl -s ifconfig.me)"
echo "   (wait for DNS to propagate — usually 5-30 minutes)"
echo ""
echo "3. Issue SSL certificate:"
echo "   sudo certbot --nginx -d e-khadi.co.za -d www.e-khadi.co.za --non-interactive --agree-tos -m admin@e-khadi.co.za"
echo ""
echo "4. Add GitHub repository secrets (Settings → Secrets → Actions):"
echo "   HW_AK             = Huawei IAM Access Key"
echo "   HW_SK             = Huawei IAM Secret Key"
echo "   HW_SWR_ORG        = SWR organisation name (e.g. ekhadi)"
echo "   HW_SWR_LOGIN_KEY  = Huawei SWR login password (from SWR console → Login command)"
echo "   ECS_HOST          = $(curl -s ifconfig.me)"
echo "   ECS_USER          = ubuntu"
echo "   ECS_SSH_KEY       = (contents of ~/.ssh/id_rsa for the ECS key pair)"
echo "   DATABASE_URL      = postgresql://... (Supabase pooler URL)"
echo "   DIRECT_URL        = postgresql://... (Supabase direct URL)"
echo "   NEXTAUTH_SECRET   = (run: openssl rand -base64 32)"
echo ""
echo "5. Push to main branch — GitHub Actions will build, push to SWR, and deploy."
echo ""
echo "=== Setup complete ==="