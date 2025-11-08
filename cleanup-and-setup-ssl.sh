#!/bin/bash
# cleanup-and-setup-ssl.sh - Clean up processes and set up SSL

set -e

echo "========================================="
echo "   Cleanup & SSL Setup (Automated)      "
echo "========================================="
echo ""

# Kill any certbot processes
echo "Killing any running certbot processes..."
pkill -9 certbot 2>/dev/null || true

# Kill any process using port 80
echo "Checking for processes using port 80..."
lsof -ti:80 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Create webroot directory
echo "Creating webroot directory..."
mkdir -p /var/www/certbot

# Backup current docker-compose if exists
if [ -f /root/nginx/docker-compose.yml ]; then
    echo "Backing up current nginx docker-compose.yml..."
    cp /root/nginx/docker-compose.yml /root/nginx/docker-compose.yml.bak
fi

# Update Nginx docker-compose to include webroot volume
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
echo "Starting Nginx..."
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

# Get SSL certificate using webroot method
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
        echo "Certificate request failed. Common issues:"
        echo "1. DNS not pointing to this server (check: nslookup flightprint.danidajay.com)"
        echo "2. Port 80 blocked by firewall"
        echo "3. Domain verification failed"
        echo ""
        echo "Nginx logs:"
        docker compose logs --tail=20
        exit 1
    }

# Create certificate directory and symlinks
echo ""
echo "Setting up certificate paths..."
mkdir -p /root/nginx/certs/flightprint.danidajay.com
ln -sf /etc/letsencrypt/live/flightprint.danidajay.com/fullchain.pem /root/nginx/certs/flightprint.danidajay.com/fullchain.pem
ln -sf /etc/letsencrypt/live/flightprint.danidajay.com/privkey.pem /root/nginx/certs/flightprint.danidajay.com/privkey.pem

# Set up auto-renewal cron job
echo ""
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null | grep -v 'certbot renew'; echo "0 0 * * * certbot renew --quiet --webroot -w /var/www/certbot --post-hook 'cd /root/nginx && docker compose restart'") | crontab -

echo ""
echo "========================================="
echo "   SSL Setup Complete!                  "
echo "========================================="
echo ""
echo "Certificate location: /etc/letsencrypt/live/flightprint.danidajay.com/"
echo "Certificate expires: 90 days (auto-renews daily)"
echo ""
echo "Certificates created:"
ls -lh /etc/letsencrypt/live/flightprint.danidajay.com/
echo ""
echo "Next steps:"
echo "1. Upload flightprint.conf: scp nginx-config/flightprint.conf root@168.231.73.185:/root/nginx/conf.d/"
echo "2. Restart Nginx: ssh root@168.231.73.185 'cd /root/nginx && docker compose restart'"
echo "3. Deploy FlightPrint: ./deploy-clean.ps1"
echo ""
