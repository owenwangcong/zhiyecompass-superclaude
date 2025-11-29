# PM2 Commands for ZhiYeCompass on AWS EC2 Ubuntu

## Initial Server Setup

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not installed)
sudo apt-get install -y git

# Create project directory
sudo mkdir -p /var/www/zhiyecompass
sudo chown -R ubuntu:ubuntu /var/www/zhiyecompass
```

## Clone Repository (First Time)

```bash
# Navigate to web directory
cd /var/www

# Clone the repository (HTTPS - works for public repos)
sudo git clone https://github.com/owenwangcong/zhiyecompass-superclaude.git zhiyecompass

# Set ownership
sudo chown -R ubuntu:ubuntu /var/www/zhiyecompass

cd /var/www/zhiyecompass
```

## Deployment Scripts

All scripts are located in `/var/www/zhiyecompass/scripts/`:

| Script | Purpose | Usage |
|--------|---------|-------|
| `first-deploy.sh` | Initial setup & start | `bash scripts/first-deploy.sh` |
| `deploy.sh` | Pull & deploy (zero-downtime) | `bash scripts/deploy.sh` |
| `restart.sh` | Quick restart (no rebuild) | `bash scripts/restart.sh` |
| `rebuild.sh` | Full rebuild & restart | `bash scripts/rebuild.sh` |

### First Time Deployment

```bash
cd /var/www/zhiyecompass
bash scripts/first-deploy.sh
```

### Update from Repository (Zero-Downtime)

```bash
bash scripts/deploy.sh
```

### Quick Restart (No Rebuild)

```bash
bash scripts/restart.sh
```

### Full Rebuild & Restart

```bash
bash scripts/rebuild.sh
```

## PM2 Process Management

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

# View only error logs
pm2 logs zhiyecompass --err --lines 50

# Clear logs
pm2 flush
```

### Process Control

```bash
# Stop application
pm2 stop zhiyecompass

# Restart application (with downtime)
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
# Generate startup script (run as ubuntu user)
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save current process list (auto-start on reboot)
pm2 save

# Resurrect saved processes
pm2 resurrect

# Disable startup
pm2 unstartup systemd
```

### Cluster Mode (Multi-instance)

```bash
# Start with max CPU cores (configured in ecosystem.config.js)
pm2 start ecosystem.config.js

# Scale up/down
pm2 scale zhiyecompass 4
pm2 scale zhiyecompass +2
pm2 scale zhiyecompass -1
```

## Ecosystem Config File

Located at `/var/www/zhiyecompass/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'zhiyecompass',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/zhiyecompass',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3010
    },
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    // Graceful restart
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

## Troubleshooting

```bash
# Check if port is in use
sudo lsof -i :3010

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:3010)

# Check PM2 logs for errors
pm2 logs zhiyecompass --err --lines 50

# Reset PM2 (nuclear option)
pm2 kill
pm2 start ecosystem.config.js

# Check system resources
pm2 monit

# Update PM2 in-memory daemon
pm2 update

# Check Node.js version
node -v

# Check PM2 version
pm2 -v
```

## Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/zhiyecompass
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3010;
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

## SSL with Certbot

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## Useful Aliases

Add to `~/.bashrc`:

```bash
# ZhiYeCompass shortcuts
alias zyc='cd /var/www/zhiyecompass'
alias zyc-deploy='/var/www/zhiyecompass/scripts/deploy.sh'
alias zyc-restart='/var/www/zhiyecompass/scripts/restart.sh'
alias zyc-rebuild='/var/www/zhiyecompass/scripts/rebuild.sh'
alias zyc-logs='pm2 logs zhiyecompass'

# PM2 shortcuts
alias pm2l='pm2 list'
alias pm2m='pm2 monit'
alias pm2r='pm2 reload zhiyecompass'
```

Reload: `source ~/.bashrc`

## Quick Reference

| Action | Command |
|--------|---------|
| First deploy | `bash scripts/first-deploy.sh` |
| Update & deploy | `bash scripts/deploy.sh` |
| Quick restart | `bash scripts/restart.sh` |
| Full rebuild | `bash scripts/rebuild.sh` |
| View logs | `pm2 logs zhiyecompass` |
| Monitor | `pm2 monit` |
| Status | `pm2 list` |
| Stop | `pm2 stop zhiyecompass` |
| Start | `pm2 start ecosystem.config.js` |
