#!/bin/bash
# Full Rebuild & Restart Script for ZhiYeCompass
# Usage: bash scripts/rebuild.sh

set -e

echo "=== Full Rebuild & Restart ==="
cd /var/www/zhiyecompass

# Clean and rebuild
echo "1. Cleaning old build..."
rm -rf .next

echo "2. Installing dependencies..."
npm install

echo "3. Building..."
npm run build

echo "4. Reloading PM2..."
pm2 reload zhiyecompass

echo "=== Rebuild Complete ==="
pm2 list
