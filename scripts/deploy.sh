#!/bin/bash
# Update & Deploy Script for ZhiYeCompass (Zero-Downtime)
# Usage: bash scripts/deploy.sh

set -e

echo "=== ZhiYeCompass Deployment ==="
echo "Started at: $(date)"

cd /var/www/zhiyecompass

# 1. Pull latest code
echo "1. Pulling latest code..."
git fetch origin
git reset --hard origin/main

# 2. Install/update dependencies
echo "2. Installing dependencies..."
npm install

# 3. Build application
echo "3. Building application..."
npm run build

# 4. Reload PM2 (zero-downtime)
echo "4. Reloading PM2 (zero-downtime)..."
pm2 reload zhiyecompass

# 5. Save PM2 state
echo "5. Saving PM2 state..."
pm2 save

echo ""
echo "=== Deployment Complete ==="
echo "Finished at: $(date)"
pm2 list
