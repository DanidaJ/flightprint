#!/bin/bash
# quick-fix.sh - Remove flightprint config temporarily so Nginx can start

echo "Temporarily removing flightprint.conf so Nginx can start..."
mv /root/nginx/conf.d/flightprint.conf /root/nginx/conf.d/flightprint.conf.disabled 2>/dev/null || true

echo "Restarting Nginx..."
cd /root/nginx
docker compose restart

sleep 5

if docker ps | grep -q "nginx-reverse-proxy.*Up"; then
    echo "✓ Nginx is now running!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy FlightPrint from your PC: ./deploy-clean.ps1"
    echo "2. Re-enable Nginx config: ssh root@168.231.73.185 'mv /root/nginx/conf.d/flightprint.conf.disabled /root/nginx/conf.d/flightprint.conf && cd /root/nginx && docker compose restart'"
else
    echo "✗ Nginx still failing. Checking logs..."
    docker compose logs --tail=10
fi
