#!/bin/bash
# First Time Deployment Script for ZhiYeCompass
# Usage: bash scripts/first-deploy.sh

set -e

echo "=== ZhiYeCompass First Time Deployment ==="

cd /var/www/zhiyecompass

# 1. Install dependencies
echo "1. Installing dependencies..."
npm install

# 2. Create logs directory
echo "2. Creating logs directory..."
mkdir -p logs

# 3. Copy environment file (edit with actual values)
echo "3. Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values!"
    echo "   nano /var/www/zhiyecompass/.env.local"
fi

# 4. Build application
echo "4. Building application..."
npm run build

# 5. Start with PM2
echo "5. Starting PM2..."
pm2 start ecosystem.config.js

# 6. Setup PM2 startup on boot
echo "6. Setting up PM2 startup..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

echo ""
echo "=== First Time Deployment Complete ==="
pm2 list
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your AWS credentials"
echo "  2. Configure Nginx reverse proxy (optional)"
echo "  3. Setup SSL with Certbot (optional)"
