#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Script de déploiement — erp.innosft.com
# Usage : bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

DOMAIN="erp.innosft.com"
EMAIL="innosoftcreation@gmail.com"
REPO="https://github.com/thiernoDiedhiou/erp_industrielle.git"
APP_DIR="$HOME/erp_industrielle"
CERTS_DIR="$APP_DIR/docker/nginx/certs"

echo "=== Déploiement ERP Industrielle — $DOMAIN ==="

# ── 1. Dépendances système ────────────────────────────────────────────────────
echo "[1/7] Vérification des dépendances..."
if ! command -v docker &>/dev/null; then
  echo "Installation de Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "IMPORTANT : reconnectez-vous (logout/login) pour appliquer le groupe docker, puis relancez ce script."
  exit 0
fi

if ! docker compose version &>/dev/null; then
  echo "Installation de Docker Compose v2..."
  sudo apt-get install -y docker-compose-plugin
fi

# ── 2. Cloner / mettre à jour le dépôt ───────────────────────────────────────
echo "[2/7] Récupération du code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 3. Fichier .env de production ────────────────────────────────────────────
echo "[3/7] Configuration des variables d'environnement..."
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Génération des secrets..."
  PG_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  REDIS_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  RABBIT_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  JWT_SECRET=$(openssl rand -base64 64)
  JWT_REFRESH=$(openssl rand -base64 64)
  MINIO_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

  cat > "$ENV_FILE" <<EOF
# Domaine
DOMAIN=$DOMAIN

# Base de données
POSTGRES_DB=saas_erp
POSTGRES_USER=saas_user
POSTGRES_PASSWORD=$PG_PASS
DATABASE_URL=postgresql://saas_user:$PG_PASS@postgres:5432/saas_erp

# Redis
REDIS_PASSWORD=$REDIS_PASS
REDIS_URL=redis://:$REDIS_PASS@redis:6379

# RabbitMQ
RABBITMQ_USER=erp_user
RABBITMQ_PASSWORD=$RABBIT_PASS
RABBITMQ_VHOST=erp

# JWT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH

# MinIO
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=$MINIO_SECRET

# Email SMTP (à compléter)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@innosft.com

# Sentry (optionnel)
SENTRY_DSN=
EOF
  echo ".env créé avec des secrets générés automatiquement."
  echo ""
  echo "IMPORTANT : éditez $ENV_FILE pour configurer SMTP_USER et SMTP_PASSWORD"
  echo "  nano $ENV_FILE"
  echo ""
else
  echo ".env existant conservé."
fi

# ── 4. Certificats SSL (Let's Encrypt) ───────────────────────────────────────
echo "[4/7] Certificats SSL..."
mkdir -p "$CERTS_DIR"
mkdir -p "$APP_DIR/docker/nginx/certbot-webroot"

if [ ! -f "$CERTS_DIR/fullchain.pem" ]; then
  echo "Obtention des certificats Let's Encrypt (port 80 doit être libre)..."

  # Vérifier si le port 80 est occupé
  if ss -tlnp | grep -q ':80 '; then
    echo ""
    echo "ATTENTION : le port 80 est occupé par un autre processus."
    echo "Arrêtez-le temporairement, obtenez le certificat, puis redémarrez-le :"
    echo ""
    echo "  # Identifier le processus :"
    echo "  sudo ss -tlnp | grep ':80'"
    echo ""
    echo "  # Puis lancer manuellement :"
    echo "  sudo certbot certonly --standalone -d $DOMAIN -d api.$DOMAIN --email $EMAIL --agree-tos --non-interactive"
    echo "  sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERTS_DIR/fullchain.pem"
    echo "  sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem  $CERTS_DIR/privkey.pem"
    echo "  sudo chmod 644 $CERTS_DIR/fullchain.pem $CERTS_DIR/privkey.pem"
    echo ""
    echo "Ensuite relancez ce script."
    exit 1
  fi

  # Installer certbot si absent
  if ! command -v certbot &>/dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y certbot
  fi

  sudo certbot certonly --standalone \
    -d "$DOMAIN" -d "api.$DOMAIN" \
    --email "$EMAIL" --agree-tos --non-interactive

  sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERTS_DIR/fullchain.pem"
  sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem"  "$CERTS_DIR/privkey.pem"
  sudo chmod 644 "$CERTS_DIR/fullchain.pem" "$CERTS_DIR/privkey.pem"

  echo "Certificats copiés dans $CERTS_DIR"
else
  echo "Certificats déjà présents — ignoré."
fi

# ── 5. Build & démarrage ──────────────────────────────────────────────────────
echo "[5/7] Build des images Docker (peut prendre 5-10 min)..."
cd "$APP_DIR/docker"
docker compose --env-file "$APP_DIR/.env" build --no-cache

echo "[6/7] Démarrage des services..."
docker compose --env-file "$APP_DIR/.env" up -d

# ── 6. Migrations Prisma ──────────────────────────────────────────────────────
echo "[7/7] Attente de la base de données..."
sleep 15
echo "Les migrations Prisma s'exécutent automatiquement au démarrage de l'API."

# ── 7. Récapitulatif ──────────────────────────────────────────────────────────
echo ""
echo "======================================================="
echo "  Déploiement terminé !"
echo "======================================================="
echo ""
echo "  Frontend : https://$DOMAIN"
echo "  API      : https://api.$DOMAIN/api/v1"
echo "  Swagger  : https://api.$DOMAIN/api/docs"
echo ""
echo "  Vérifier les logs :"
echo "  docker compose -f $APP_DIR/docker/docker-compose.yml logs -f"
echo ""
echo "  Renouvellement SSL automatique (à ajouter au crontab) :"
echo "  0 3 1 * * sudo certbot renew --quiet && sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERTS_DIR/fullchain.pem && sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERTS_DIR/privkey.pem && docker exec saas_erp_nginx nginx -s reload"
echo ""
