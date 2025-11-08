#!/bin/bash
# complete-fix.sh - Fix everything in the right order

set -e

echo "========================================="
echo "  Complete FlightPrint Setup Fix        "
echo "========================================="
echo ""

# Step 1: Remove flightprint config temporarily
echo "Step 1: Disabling flightprint Nginx config..."
mv /root/nginx/conf.d/flightprint.conf /root/nginx/conf.d/flightprint.conf.disabled 2>/dev/null || true

# Step 2: Restart Nginx
echo "Step 2: Restarting Nginx..."
cd /root/nginx
docker compose restart
sleep 5

if ! docker ps | grep -q "nginx-reverse-proxy.*Up"; then
    echo "ERROR: Nginx still not starting!"
    docker compose logs --tail=20
    exit 1
fi

echo "✓ Nginx is running!"

# Step 3: Stop and remove old FlightPrint containers
echo ""
echo "Step 3: Cleaning up old FlightPrint containers..."
cd /root/flightprint
docker compose down 2>/dev/null || true

# Step 4: Restart FlightPrint with proper network
echo "Step 4: Starting FlightPrint containers..."
docker compose up -d

sleep 5

# Verify containers are on the network
echo ""
echo "Verifying network connections..."
CLIENT_ON_NET=$(docker network inspect portfolio-net | grep -c "flightprint-client" || echo 0)
SERVER_ON_NET=$(docker network inspect portfolio-net | grep -c "flightprint-server" || echo 0)

if [ "$CLIENT_ON_NET" -gt 0 ] && [ "$SERVER_ON_NET" -gt 0 ]; then
    echo "✓ Both FlightPrint containers connected to portfolio-net"
else
    echo "✗ Network connection issue detected!"
    echo "  Client on portfolio-net: $CLIENT_ON_NET"
    echo "  Server on portfolio-net: $SERVER_ON_NET"
    echo ""
    echo "Manual fix: Connect containers to network"
    docker network connect portfolio-net flightprint-server 2>/dev/null || echo "  Server already connected or failed"
    docker network connect portfolio-net flightprint-client 2>/dev/null || echo "  Client already connected or failed"
fi

# Step 5: Re-enable Nginx config
echo ""
echo "Step 5: Re-enabling flightprint Nginx config..."
mv /root/nginx/conf.d/flightprint.conf.disabled /root/nginx/conf.d/flightprint.conf

# Step 6: Restart Nginx
echo "Step 6: Final Nginx restart..."
cd /root/nginx
docker compose restart

sleep 5

# Verify everything is running
echo ""
echo "========================================="
echo "         Status Check                    "
echo "========================================="
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
if docker ps | grep -q "nginx-reverse-proxy.*Up"; then
    echo "✓ Nginx: Running"
else
    echo "✗ Nginx: Failed"
    cd /root/nginx && docker compose logs --tail=10
    exit 1
fi

if docker ps | grep -q "flightprint-server.*Up"; then
    echo "✓ FlightPrint Server: Running"
else
    echo "✗ FlightPrint Server: Not running"
fi

if docker ps | grep -q "flightprint-client.*Up"; then
    echo "✓ FlightPrint Client: Running"
else
    echo "✗ FlightPrint Client: Not running"
fi

echo ""
echo "Testing local access..."
curl -I http://localhost 2>&1 | head -3

echo ""
echo "========================================="
echo "  Setup Complete!                       "
echo "========================================="
echo ""
echo "Try accessing: http://flightprint.danidajay.com"
echo "(Should redirect to https)"
echo ""
