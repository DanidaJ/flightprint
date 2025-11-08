#!/bin/bash
# fix-nginx.sh - Fix Nginx configuration issues

echo "Fixing Nginx configuration..."

# Backup and remove the problematic portfolio config
if [ -f /root/nginx/conf.d/danida-portfolio.conf ]; then
    echo "Backing up and removing danida-portfolio.conf..."
    mv /root/nginx/conf.d/danida-portfolio.conf /root/nginx/conf.d/danida-portfolio.conf.bak
fi

# Update flightprint.conf to fix http2 deprecation warning
echo "Updating flightprint.conf..."
sed -i 's/listen 443 ssl http2;/listen 443 ssl;\n    http2 on;/' /root/nginx/conf.d/flightprint.conf

# Restart Nginx
echo "Restarting Nginx..."
cd /root/nginx
docker compose restart

# Wait and check status
sleep 5
if docker ps | grep -q nginx-reverse-proxy; then
    echo ""
    echo "✓ Nginx is running successfully!"
    docker compose ps
else
    echo ""
    echo "✗ Nginx failed to start. Checking logs..."
    docker compose logs --tail=20
fi
