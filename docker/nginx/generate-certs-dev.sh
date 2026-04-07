#!/bin/bash
# Génère des certificats SSL auto-signés pour le développement local
# Usage : bash docker/nginx/generate-certs-dev.sh

set -e

CERTS_DIR="$(dirname "$0")/certs"
mkdir -p "$CERTS_DIR"

DOMAIN="${DOMAIN:-localhost}"

echo "Génération des certificats auto-signés pour : $DOMAIN"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERTS_DIR/privkey.pem" \
  -out "$CERTS_DIR/fullchain.pem" \
  -subj "/C=SN/ST=Thiès/L=Thiès/O=GISAC/OU=ERP/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:api.$DOMAIN,DNS:localhost,IP:127.0.0.1"

echo "Certificats générés dans $CERTS_DIR/"
echo "  - fullchain.pem (certificat)"
echo "  - privkey.pem   (clé privée)"
echo ""
echo "ATTENTION : Ces certificats auto-signés sont UNIQUEMENT pour le développement."
echo "En production, utilisez Let's Encrypt avec Certbot."
