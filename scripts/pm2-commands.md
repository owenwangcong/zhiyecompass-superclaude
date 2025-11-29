# PM2 Commands for ZhiYeCompass on AWS EC2 Ubuntu

## Initial Setup

```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Navigate to project directory
cd /home/ubuntu/zhiyecompass
```

## Build Application

```bash
# Install dependencies
npm install

# Build production version
npm run build
```

## PM2 Process Management

### Start Application

```bash
# Start Next.js production server with PM2
pm2 start npm --name "zhiyecompass" -- start

# Or start with specific port
PORT=3000 pm2 start npm --name "zhiyecompass" -- start

# Start with ecosystem file (recommended)
pm2 start ecosystem.config.js
```

### Basic Commands

```bash
# List all processes
pm2 list

# Show detailed status
pm2 show zhiyecompass

# Monitor in real-time (CPU, memory, logs)
pm2 monit

# View logs
pm2 logs zhiyecompass

# View last 100 lines of logs
pm2 logs zhiyecompass --lines 100

# Clear logs
pm2 flush
```

### Process Control

```bash
# Stop application
pm2 stop zhiyecompass

# Restart application
pm2 restart zhiyecompass

# Reload with zero-downtime (graceful reload)
pm2 reload zhiyecompass

# Delete from PM2 process list
pm2 delete zhiyecompass

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all
```

### Startup & Auto-restart

```bash
# Generate startup script (run as root/sudo)
pm2 startup systemd

# Save current process list (auto-start on reboot)
pm2 save

# Resurrect saved processes
pm2 resurrect

# Disable startup
pm2 unstartup systemd
```

### Cluster Mode (Multi-instance)

```bash
# Start with max CPU cores
pm2 start npm --name "zhiyecompass" -i max -- start

# Start with specific number of instances
pm2 start npm --name "zhiyecompass" -i 2 -- start

# Scale up/down
pm2 scale zhiyecompass 4
pm2 scale zhiyecompass +2
pm2 scale zhiyecompass -1
```

## Ecosystem Config File

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [{
    name: 'zhiyecompass',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/zhiyecompass',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    error_file: '/home/ubuntu/zhiyecompass/logs/error.log',
    out_file: '/home/ubuntu/zhiyecompass/logs/output.log',
    log_file: '/home/ubuntu/zhiyecompass/logs/combined.log',
    time: true,
    // Graceful restart
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

## Deployment Workflow

```bash
# 1. Pull latest code
cd /home/ubuntu/zhiyecompass
git pull origin main

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Reload with zero-downtime
pm2 reload zhiyecompass

# 5. Save process list
pm2 save
```

## Quick Deploy Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "=== ZhiYeCompass Deployment ==="

cd /home/ubuntu/zhiyecompass

echo "1. Pulling latest code..."
git pull origin main

echo "2. Installing dependencies..."
npm install

echo "3. Building application..."
npm run build

echo "4. Reloading PM2..."
pm2 reload zhiyecompass || pm2 start ecosystem.config.js

echo "5. Saving PM2 state..."
pm2 save

echo "=== Deployment Complete ==="
pm2 list
```

Make it executable:
```bash
chmod +x scripts/deploy.sh
```

## Troubleshooting

```bash
# Check if port is in use
sudo lsof -i :3000

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:3000)

# Check PM2 logs for errors
pm2 logs zhiyecompass --err --lines 50

# Reset PM2 (nuclear option)
pm2 kill
pm2 start ecosystem.config.js

# Check system resources
pm2 monit

# Update PM2 in-memory daemon
pm2 update
```

## Nginx Reverse Proxy (Optional)

If using Nginx as reverse proxy:

```nginx
# /etc/nginx/sites-available/zhiyecompass
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/zhiyecompass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Variables

Set environment variables in PM2:

```bash
# Set via command line
PORT=3000 NODE_ENV=production pm2 start npm --name "zhiyecompass" -- start

# Or use ecosystem.config.js (recommended)
# Or use .env file (loaded by Next.js automatically)
```

## Useful Aliases

Add to `~/.bashrc`:

```bash
# PM2 shortcuts
alias pm2l='pm2 list'
alias pm2m='pm2 monit'
alias pm2log='pm2 logs zhiyecompass'
alias pm2r='pm2 reload zhiyecompass'
alias deploy='cd /home/ubuntu/zhiyecompass && ./scripts/deploy.sh'
```

Reload: `source ~/.bashrc`
