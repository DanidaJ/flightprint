#!/bin/bash
# final-ssl-setup.sh - Complete SSL setup handling all containers

set -e

echo "========================================="
echo "   Complete SSL Setup for FlightPrint  "
echo "========================================="
echo ""

# Stop all containers using port 80
echo "Stopping containers using port 80..."
docker ps --format '{{.Names}}' | while read container; do
    if docker port $container 2>/dev/null | grep -q ':80->'; then
        echo "  Stopping $container (using port 80)..."
        docker stop $container
    fi
done

# Kill any lingering processes on port 80
echo "Cleaning up port 80..."
lsof -ti:80 | xargs kill -9 2>/dev/null || true
sleep 2

# Create webroot directory
echo "Creating webroot directory..."
mkdir -p /var/www/certbot

# Update Nginx docker-compose
echo "Updating Nginx configuration..."
cat > /root/nginx/docker-compose.yml << 'EOF'
services:
  nginx:
    image: nginx:latest
    container_name: nginx-reverse-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /root/nginx/conf.d:/etc/nginx/conf.d
      - /root/nginx/certs:/etc/nginx/certs
      - /root/nginx/vhost.d:/etc/nginx/vhost.d
      - /var/www/certbot:/var/www/certbot
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - portfolio-net

networks:
  portfolio-net:
    external: true
EOF

# Start Nginx
echo ""
echo "Starting Nginx reverse proxy..."
cd /root/nginx
docker compose up -d

# Wait for Nginx to be ready
echo "Waiting for Nginx to start..."
sleep 5

# Verify Nginx is running
if ! docker ps | grep -q nginx-reverse-proxy; then
    echo "ERROR: Nginx failed to start!"
    docker compose logs
    exit 1
fi
echo "Nginx is running!"

# Get SSL certificate
echo ""
echo "Obtaining SSL certificate for flightprint.danidajay.com..."
certbot certonly --webroot \
    -w /var/www/certbot \
    -d flightprint.danidajay.com \
    --agree-tos \
    --no-eff-email \
    --email danidajay@gmail.com \
    --non-interactive || {
        echo ""
        echo "ERROR: Certificate request failed!"
        echo ""
        echo "Please check:"
        echo "1. DNS record: nslookup flightprint.danidajay.com"
        echo "2. Firewall allows port 80"
        echo "3. Domain is accessible: curl -I http://flightprint.danidajay.com"
        exit 1
    }

# Set up certificate symlinks
echo ""
echo "Setting up certificate paths..."
mkdir -p /root/nginx/certs/flightprint.danidajay.com
ln -sf /etc/letsencrypt/live/flightprint.danidajay.com/fullchain.pem /root/nginx/certs/flightprint.danidajay.com/fullchain.pem
ln -sf /etc/letsencrypt/live/flightprint.danidajay.com/privkey.pem /root/nginx/certs/flightprint.danidajay.com/privkey.pem

# Set up auto-renewal
echo ""
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null | grep -v 'certbot renew'; echo "0 0 * * * certbot renew --quiet --webroot -w /var/www/certbot --post-hook 'cd /root/nginx && docker compose restart'") | crontab -

# Restart the portfolio container (it will need nginx config)
echo ""
echo "Note: Your portfolio container was stopped. You'll need to:"
echo "  1. Create nginx config for it"
echo "  2. Connect it to portfolio-net network"
echo "  3. Remove its port 80 mapping (nginx will handle routing)"

echo ""
echo "========================================="
echo "        SSL Setup Complete!             "
echo "========================================="
echo ""
echo "✓ Certificate: /etc/letsencrypt/live/flightprint.danidajay.com/"
echo "✓ Auto-renewal: Configured"
echo "✓ Nginx: Running on ports 80 & 443"
echo ""
echo "Certificate details:"
ls -lh /etc/letsencrypt/live/flightprint.danidajay.com/
echo ""
echo "Next steps:"
echo "1. Upload flightprint.conf:"
echo "   scp nginx-config/flightprint.conf root@168.231.73.185:/root/nginx/conf.d/"
echo ""
echo "2. Restart Nginx to load config:"
echo "   ssh root@168.231.73.185 'cd /root/nginx && docker compose restart'"
echo ""
echo "3. Deploy FlightPrint:"
echo "   ./deploy-clean.ps1"
echo ""
echo "4. Fix your portfolio container to work behind nginx proxy"
echo ""
