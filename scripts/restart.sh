#!/bin/bash
# Quick Restart Script for ZhiYeCompass (No Rebuild)
# Usage: bash scripts/restart.sh

set -e

echo "=== Quick Restart ==="
cd /var/www/zhiyecompass

# Reload with zero-downtime
pm2 reload zhiyecompass

echo "=== Restart Complete ==="
pm2 list
