#!/bin/bash
# setup-ssl-automated.sh - Automated SSL setup for FlightPrint

set -e

echo "========================================="
echo "   FlightPrint SSL Setup (Automated)    "
echo "========================================="
echo ""

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt update
    apt install -y certbot
fi

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
version: '3'

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

# Restart Nginx with new configuration
echo "Restarting Nginx..."
cd /root/nginx
docker compose down
docker compose up -d

# Wait for Nginx to be ready
echo "Waiting for Nginx to start..."
sleep 5

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
        echo "Certificate request failed. Common issues:"
        echo "1. DNS not pointing to this server yet"
        echo "2. Port 80 blocked by firewall"
        echo "3. Domain verification failed"
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

# Restart Nginx to ensure everything is loaded
echo ""
echo "Final Nginx restart..."
cd /root/nginx
docker compose restart

echo ""
echo "========================================="
echo "   SSL Setup Complete!                  "
echo "========================================="
echo ""
echo "Certificate location: /etc/letsencrypt/live/flightprint.danidajay.com/"
echo "Certificate expires: 90 days (auto-renews daily)"
echo ""
echo "Next steps:"
echo "1. Copy flightprint.conf to /root/nginx/conf.d/"
echo "2. Deploy FlightPrint application"
echo "3. Restart Nginx: cd /root/nginx && docker compose restart"
echo ""
echo "Test your certificate:"
echo "  curl -I https://flightprint.danidajay.com"
echo ""
