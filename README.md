# SaaS ERP Industrielle

Plateforme ERP multi-tenant configurable pour PME industrielles africaines.
Tenant de référence : **GISAC** — Global Invest Samoura & Co, Thiès, Sénégal (industrie plastique).

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui | Interface utilisateur |
| Backend | NestJS + TypeScript | API REST |
| BDD | PostgreSQL 16 + Prisma ORM | Persistance |
| Cache | Redis 7 | Sessions, modules actifs, rate limiting |
| Queue | RabbitMQ 3.13 | Emails, alertes stock, notifications |
| Reverse proxy | Nginx 1.27 | HTTPS, rate limiting, headers sécurité |
| Auth | JWT + Refresh Tokens (RBAC) | Authentification |
| Monitoring | Winston + Sentry | Logs structurés + erreurs |
| Infra | Docker Compose | Orchestration |
| Monorepo | npm workspaces | Organisation du code |

---

## Structure du projet

```
saas-erp/
├── apps/
│   ├── api/                    → Backend NestJS (port 3001)
│   │   ├── src/
│   │   │   ├── common/         → Guards, intercepteurs, filtres, DTOs partagés
│   │   │   │   ├── decorators/ → @Audit(), @CurrentUser(), @TenantId()
│   │   │   │   ├── filters/    → SentryExceptionFilter (erreurs 5xx)
│   │   │   │   ├── guards/     → JwtAuthGuard, ModuleActiveGuard
│   │   │   │   ├── interceptors/ → AuditInterceptor (journal automatique)
│   │   │   │   └── logger/     → Configuration Winston
│   │   │   ├── modules/        → 15 modules métier + infrastructure
│   │   │   └── prisma/         → Service Prisma singleton
│   │   └── test/               → 6 suites de tests e2e
│   └── web/                    → Frontend Next.js (port 3000)
│       ├── app/[tenant]/       → Pages par tenant (App Router)
│       └── components/         → Composants réutilisables
├── packages/
│   ├── database/               → Schéma Prisma + migrations + seed
│   └── shared/                 → Types TypeScript partagés
└── docker/
    ├── docker-compose.yml      → Production (Nginx + tous les services)
    ├── docker-compose.dev.yml  → Override développement
    ├── Dockerfile.api
    ├── Dockerfile.web
    └── nginx/                  → Config Nginx + certificats SSL
```

---

## Modules

| Module | Description | Routes principales |
|--------|-------------|-------------------|
| `auth` | Authentification JWT + refresh tokens | `POST /auth/login`, `POST /auth/refresh` |
| `crm` | Gestion des clients | `GET/POST/PATCH/DELETE /crm/clients` |
| `commandes` | Commandes clients avec workflow | `GET/POST /commandes` |
| `production` | Ordres de fabrication | `GET/POST /production/ordres` |
| `stock` | Mouvements de stock | `GET/POST /stock/mouvements` |
| `facturation` | Factures et paiements | `GET/POST /facturation/factures` |
| `recyclage` | Collectes recyclage | `GET/POST /recyclage/collectes` |
| `fournisseurs` | Gestion des fournisseurs | `GET/POST /fournisseurs` |
| `machines` | Parc machines | `GET/POST /machines` |
| `matieres-premieres` | Stocks matières premières | `GET/POST /matieres-premieres` |
| `logistique` | Bons de livraison | `GET/POST /logistique/livraisons` |
| `audit` | Journal d'audit | `GET /audit` *(admin/direction)* |
| `dashboard` | KPIs et statistiques | `GET /dashboard/stats` |
| `notifications` | SSE temps réel | `GET /notifications/stream` |
| `admin` | Gestion plateforme | `GET/POST /admin/tenants` |

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- Docker Desktop
- npm 10+

### 1. Cloner et installer les dépendances

```bash
git clone <repo>
cd saas-erp
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs (JWT secrets, SMTP, etc.)
```

### 3. Démarrer l'infrastructure Docker

```bash
npm run docker:up
# Lance PostgreSQL, Redis, RabbitMQ
```

### 4. Initialiser la base de données

```bash
npm run db:migrate   # Applique les migrations Prisma
npm run db:seed      # Données initiales (tenant GISAC + admin)
```

### 5. Lancer l'application en développement

```bash
npm run dev
# API  → http://localhost:3001/api/v1
# Web  → http://localhost:3000
# Docs → http://localhost:3001/api/docs
```

---

## Déploiement production

### Avec Nginx + HTTPS (Let's Encrypt)

```bash
# 1. Obtenir les certificats SSL
DOMAIN=erp.gisac.sn CERTBOT_EMAIL=admin@gisac.sn \
  bash docker/nginx/renew-certs-prod.sh

# 2. Configurer .env.production
cp .env.example .env.production
# Renseigner : DOMAIN, JWT_SECRET, POSTGRES_PASSWORD, REDIS_PASSWORD, SENTRY_DSN...

# 3. Démarrer tous les services
DOMAIN=erp.gisac.sn docker compose -f docker/docker-compose.yml up -d
```

### Avec certificats auto-signés (dev/staging)

```bash
bash docker/nginx/generate-certs-dev.sh
docker compose -f docker/docker-compose.yml up -d
```

### Architecture réseau en production

```
Internet
    │
    ▼
Nginx :443 (HTTPS)
    ├── erp.gisac.sn       → Next.js :3000
    └── api.erp.gisac.sn   → NestJS :3001
            │
            ├── PostgreSQL :5432
            ├── Redis :6379
            └── RabbitMQ :5672
```

L'API et le frontend **n'exposent aucun port** directement — tout passe par Nginx.

---

## Scripts disponibles

```bash
npm run dev            # Démarre API + Web en parallèle
npm run build          # Build de production (API + Web)
npm run docker:up      # Démarre l'infrastructure (PostgreSQL, Redis, RabbitMQ)
npm run docker:down    # Arrête l'infrastructure
npm run db:migrate     # Applique les migrations Prisma
npm run db:seed        # Insère les données initiales
npm run db:studio      # Ouvre Prisma Studio (interface BDD)
npm run db:reset       # Réinitialise complètement la BDD
npm run test:e2e       # Lance les tests d'intégration
```

---

## Tests

6 suites de tests d'intégration (e2e) sur base PostgreSQL réelle :

| Suite | Tests | Couverture |
|-------|-------|------------|
| `auth.e2e-spec.ts` | 10 | Login, refresh token, isolation tenant |
| `crm.e2e-spec.ts` | 11 | CRUD clients, pagination, soft delete |
| `matieres-premieres.e2e-spec.ts` | 11 | Mouvements stock, alertes seuil |
| `commandes.e2e-spec.ts` | ~10 | Création TVA 18%, filtres, suppression |
| `facturation.e2e-spec.ts` | ~10 | Facture → paiement → soldée, stats |
| `fournisseurs.e2e-spec.ts` | ~9 | CRUD, toggle actif, contraintes MP |

```bash
# Prérequis : PostgreSQL démarré (npm run docker:up)
cd apps/api
npm run test:e2e
```

---

## Modèle de données

28 modèles Prisma couvrant l'ensemble des opérations industrielles :

```
Tenant ──┬── User
         ├── Client ── Commande ── LigneCommande
         │                  └── Facture ── Paiement
         ├── Fournisseur ── MatierePremiere ── MouvementStock
         ├── Machine ── OrdreFabrication ── ConsommationMP
         ├── Produit ── BonLivraison ── LigneLivraison
         ├── RecyclageCollecte
         ├── AuditLog
         ├── WorkflowDefinition ── WorkflowState ── WorkflowTransition
         ├── CustomEnum
         ├── CustomField ── CustomFieldValue
         └── Setting
```

> **Isolation tenant stricte** : chaque requête Prisma inclut `WHERE tenant_id = tenantId`.

---

## Principes d'architecture

### Multi-tenant
Chaque tenant dispose de ses propres données, modules actifs, workflows et énumérations. Rien n'est partagé entre tenants.

### Plateforme configurable
Tout ce qui varie par tenant est en base de données (`CustomEnum`, `WorkflowDefinition`, `Setting`). Aucune logique hardcodée dans le code.

### Sécurité
- Passwords : bcrypt facteur 12
- JWT avec access token court (15 min) + refresh token rotatif (7 jours)
- Rate limiting : Nginx (10 req/s) + NestJS ThrottlerGuard (100 req/min)
- Double protection login : 5 req/min côté Nginx, 5 req/60s côté NestJS
- En-têtes HTTP sécurité : HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- Soft delete : les enregistrements supprimés sont masqués, pas détruits

### Observabilité
- **Winston** : logs JSON structurés (prod) / pretty coloré (dev), rotation fichiers
- **Sentry** : remontée automatique des erreurs 5xx avec contexte utilisateur et tenant
- **Journal d'audit** : toute action `CREATE/UPDATE/DELETE/STATUT/EXPORT` est tracée avec `avant`/`après`

### Asynchrone
- **RabbitMQ** : 3 queues durables — `erp.emails`, `erp.stock_alerts`, `erp.notifications`
- Les emails (factures, confirmations commande) et alertes stock ne bloquent jamais la requête HTTP

---

## Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL |
| `REDIS_URL` | Oui | URL Redis |
| `RABBITMQ_URL` | Oui | URL RabbitMQ (format amqp://) |
| `JWT_SECRET` | Oui | Clé secrète JWT (min 32 chars) |
| `JWT_REFRESH_SECRET` | Oui | Clé refresh token (min 32 chars) |
| `SENTRY_DSN` | Non | DSN Sentry (désactivé si vide) |
| `DOMAIN` | Non | Domaine de déploiement (défaut: localhost) |
| `SMTP_HOST` | Non | Serveur SMTP (emails désactivés si vide) |
| `SMTP_USER` | Non | Identifiant SMTP |
| `SMTP_PASSWORD` | Non | Mot de passe SMTP |
| `FRONTEND_URL` | Non | URL du frontend (CORS) |

Générer des secrets sécurisés :
```bash
openssl rand -base64 64
```

---

## Tenant GISAC (référence)

| Propriété | Valeur |
|-----------|--------|
| Slug | `gisac` |
| Plan | `pro` (7 modules actifs) |
| Secteur | Industrie plastique |
| Localisation | Thiès, Sénégal |
| Couleurs | Bleu `#1565C0`, Vert `#4CAF50` |
| Téléphone | 33 999 01 79 |

---

## Licence

Propriété de Global Invest Samoura & Co. Usage interne uniquement.
