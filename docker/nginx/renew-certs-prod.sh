#!/bin/bash
# Obtient et renouvelle les certificats Let's Encrypt en production
# Prérequis : Docker + le domaine pointe sur ce serveur (port 80 ouvert)
# Usage : DOMAIN=erp.gisac.sn bash docker/nginx/renew-certs-prod.sh

set -e

DOMAIN="${DOMAIN:?La variable DOMAIN est obligatoire. Ex: DOMAIN=erp.gisac.sn}"
EMAIL="${CERTBOT_EMAIL:?La variable CERTBOT_EMAIL est obligatoire. Ex: CERTBOT_EMAIL=admin@gisac.sn}"
CERTS_DIR="$(dirname "$0")/certs"

mkdir -p "$CERTS_DIR"
mkdir -p "$(dirname "$0")/certbot-webroot"

echo "Obtention du certificat Let's Encrypt pour : $DOMAIN"

docker run --rm \
  -v "$(realpath "$CERTS_DIR"):/etc/letsencrypt/live/$DOMAIN" \
  -v "$(realpath "$(dirname "$0")/certbot-webroot"):/var/www/certbot" \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "api.$DOMAIN"

echo "Certificats obtenus. Rechargement de Nginx..."
docker exec saas_erp_nginx nginx -s reload

echo "Renouvellement automatique : ajouter cette ligne dans crontab :"
echo "0 0 1 * * DOMAIN=$DOMAIN CERTBOT_EMAIL=$EMAIL bash $(realpath "$0") >> /var/log/certbot-renew.log 2>&1"
