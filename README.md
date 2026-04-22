# SaaS ERP Industrielle — Innosoft Creation

Plateforme ERP multi-tenant configurable pour PME industrielles africaines.
Tenant de référence : **GISAC** — Global Invest Samoura & Co, Thiès, Sénégal (industrie plastique).
Opérée par **Innosoft Creation**.

---

## Stack technique

| Couche | Technologie | Rôle |
| --- | --- | --- |
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui | Interface utilisateur |
| Backend | NestJS + TypeScript | API REST |
| BDD | PostgreSQL 16 + Prisma ORM | Persistance |
| Cache | Redis 7 | Sessions, modules actifs, rate limiting |
| Queue | RabbitMQ 3.13 | Emails, alertes stock, notifications |
| Fichiers | MinIO (S3-compatible) | Logos tenants, fichiers uploadés |
| Reverse proxy | Nginx 1.27 | HTTPS, rate limiting, headers sécurité |
| Auth | JWT + Refresh Tokens (RBAC) + JWT super-admin séparé | Authentification |
| Monitoring | Winston + Sentry | Logs structurés + erreurs |
| Infra | Docker Compose | Orchestration |
| Monorepo | npm workspaces | Organisation du code |

---

## Structure du projet

```text
saas-erp/
├── apps/
│   ├── api/                    → Backend NestJS (port 3001)
│   │   ├── src/
│   │   │   ├── common/         → Guards, intercepteurs, filtres, DTOs partagés
│   │   │   ├── modules/        → Modules métier + super-admin + upload
│   │   │   └── prisma/         → Service Prisma singleton
│   │   └── test/               → Suites de tests e2e
│   └── web/                    → Frontend Next.js (port 3000)
│       ├── app/[tenant]/       → Pages ERP par tenant (App Router)
│       ├── app/super-admin/    → Interface Innosoft (login, dashboard, tenants)
│       └── components/         → Composants réutilisables
├── packages/
│   ├── database/               → Schéma Prisma + migrations + seed
│   └── shared/                 → Types TypeScript partagés
└── docker/
    ├── docker-compose.yml      → Production (Nginx + tous les services)
    ├── Dockerfile.api
    ├── Dockerfile.web
    └── nginx/                  → Config Nginx + certificats SSL
```

---

## Modules tenant

| Module | Description | Routes principales |
| --- | --- | --- |
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
| `bom` | Nomenclatures produits | `GET/POST /bom` |
| `audit` | Journal d'audit | `GET /audit` *(admin/direction)* |
| `dashboard` | KPIs et statistiques | `GET /dashboard/stats` |
| `notifications` | SSE temps réel | `GET /notifications/stream` |

---

## Super-Admin (Innosoft Creation)

Interface réservée à l'équipe Innosoft — gestion globale de tous les tenants.

| Route | Description |
| --- | --- |
| `POST /super-admin/auth/login` | Connexion super-admin (JWT séparé) |
| `GET /super-admin/tenants` | Liste de tous les tenants |
| `POST /super-admin/tenants` | Créer un nouveau tenant |
| `PUT /super-admin/tenants/:id` | Modifier les infos d'un tenant |
| `PATCH /super-admin/tenants/:id/toggle-actif` | Suspendre / réactiver |
| `PATCH /super-admin/tenants/:id/modules` | Modifier les modules actifs |
| `POST /super-admin/tenants/:id/users` | Ajouter un utilisateur au tenant |
| `POST /super-admin/upload/logo` | Upload logo vers MinIO |
| `GET /tenants/:slug/branding` | Charte graphique publique (sans auth) |

**Accès UI** : `http://localhost:3000/super-admin/login`

**Identifiants seed** : `admin@innosoft.sn` / `InnoSoft2024!`

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- Docker Desktop
- npm 10+

### Installation

```bash
# 1. Cloner et installer
git clone <repo>
cd saas-erp
npm install

# 2. Variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Infrastructure Docker (PostgreSQL, Redis, RabbitMQ, MinIO)
npm run docker:up

# 4. Base de données
npm run db:migrate
npm run db:seed

# 5. Lancer en développement
npm run dev
# API  → http://localhost:3001/api/v1
# Web  → http://localhost:3000
# Docs → http://localhost:3001/api/docs
```

---

## Déploiement production

```bash
# Avec Nginx + HTTPS (Let's Encrypt)
DOMAIN=erp.gisac.sn CERTBOT_EMAIL=admin@gisac.sn \
  bash docker/nginx/renew-certs-prod.sh

cp .env.example .env.production
# Renseigner : DOMAIN, JWT_SECRET, POSTGRES_PASSWORD, REDIS_PASSWORD, SENTRY_DSN...

DOMAIN=erp.gisac.sn docker compose -f docker/docker-compose.yml up -d
```

### Architecture réseau en production

```text
Internet
    │
    ▼
Nginx :443 (HTTPS)
    ├── erp.gisac.sn       → Next.js :3000
    └── api.erp.gisac.sn   → NestJS :3001
            │
            ├── PostgreSQL :5432
            ├── Redis :6379
            ├── RabbitMQ :5672
            └── MinIO :9000
```

L'API et le frontend **n'exposent aucun port** directement — tout passe par Nginx.

---

## Scripts disponibles

```bash
npm run dev            # Démarre API + Web en parallèle
npm run build          # Build de production
npm run docker:up      # Démarre l'infrastructure
npm run docker:down    # Arrête l'infrastructure
npm run db:migrate     # Applique les migrations Prisma
npm run db:seed        # Insère les données initiales
npm run db:studio      # Ouvre Prisma Studio
npm run db:reset       # Réinitialise la BDD (⚠️ supprime tout)
npm run test:e2e       # Lance les tests d'intégration
```

---

## Tests

6 suites de tests d'intégration (e2e) sur base PostgreSQL réelle :

| Suite | Tests | Couverture |
| --- | --- | --- |
| `auth.e2e-spec.ts` | 10 | Login, refresh token, isolation tenant |
| `crm.e2e-spec.ts` | 11 | CRUD clients, pagination, soft delete |
| `matieres-premieres.e2e-spec.ts` | 11 | Mouvements stock, alertes seuil |
| `commandes.e2e-spec.ts` | ~10 | Création TVA 18%, filtres, suppression |
| `facturation.e2e-spec.ts` | ~10 | Facture → paiement → soldée, stats |
| `fournisseurs.e2e-spec.ts` | ~9 | CRUD, toggle actif, contraintes MP |

```bash
# Prérequis : PostgreSQL démarré
cd apps/api && npm run test:e2e
```

---

## Modèle de données

28 modèles Prisma couvrant l'ensemble des opérations industrielles :

```text
Tenant ──┬── User
         ├── Client ── Commande ── LigneCommande
         │                  └── Facture ── Paiement
         ├── Fournisseur ── MatierePremiere ── MouvementStock
         ├── Machine ── OrdreFabrication ── ConsommationMP
         ├── Produit ── BonLivraison ── LigneLivraison
         ├── RecyclageCollecte
         ├── AuditLog
         ├── WorkflowDefinition ── WorkflowState ── WorkflowTransition
         ├── CustomEnum ── CustomField ── CustomFieldValue
         └── Setting
```

> **Isolation tenant stricte** : chaque requête Prisma inclut `WHERE tenant_id = tenantId`.
> Exception : super-admin (accès cross-tenant intentionnel).

---

## Principes d'architecture

### Multi-tenant

Chaque tenant dispose de ses propres données, modules actifs, workflows et énumérations.
Rien n'est partagé entre tenants. La table `super_admins` est distincte de `users`.

### Charte graphique par tenant

Chaque tenant a `couleurPrimaire`, `couleurSecondaire` et `logo` (URL MinIO) en BDD.
La sidebar de l'ERP applique dynamiquement ces couleurs via CSS custom properties.

### Plateforme configurable

Tout ce qui varie par tenant est en base de données (`CustomEnum`, `WorkflowDefinition`, `Setting`).
Aucune logique hardcodée dans le code.

### Sécurité

- Passwords : bcrypt facteur 12
- JWT access token (15 min) + refresh token rotatif (7 jours)
- JWT super-admin séparé (8h) avec claim `isSuperAdmin: true`
- Rate limiting : Nginx (10 req/s) + NestJS ThrottlerGuard (100 req/min)
- En-têtes HTTP : HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- Soft delete : données masquées, jamais détruites

### Observabilité

- **Winston** : logs JSON structurés (prod) / coloré (dev), rotation fichiers
- **Sentry** : remontée automatique des erreurs 5xx avec contexte tenant
- **Journal d'audit** : toute action `CREATE/UPDATE/DELETE/STATUT/EXPORT` tracée

### Asynchrone

- **RabbitMQ** : 3 queues durables — `erp.emails`, `erp.stock_alerts`, `erp.notifications`
- Les emails et alertes stock ne bloquent jamais la requête HTTP

---

## Variables d'environnement

| Variable | Requis | Description |
| --- | --- | --- |
| `DATABASE_URL` | Oui | URL PostgreSQL |
| `REDIS_URL` | Oui | URL Redis |
| `RABBITMQ_URL` | Oui | URL RabbitMQ (format amqp://) |
| `JWT_SECRET` | Oui | Clé secrète JWT (min 32 chars) |
| `JWT_REFRESH_SECRET` | Oui | Clé refresh token (min 32 chars) |
| `MINIO_ENDPOINT` | Oui | Hôte MinIO (défaut: localhost) |
| `MINIO_PORT` | Oui | Port MinIO (défaut: 9000) |
| `MINIO_ACCESS_KEY` | Oui | Clé d'accès MinIO |
| `MINIO_SECRET_KEY` | Oui | Clé secrète MinIO |
| `MINIO_BUCKET_LOGOS` | Non | Bucket logos tenants (défaut: logos) |
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
| --- | --- |
| Slug | `gisac` |
| Plan | `pro` (7 modules actifs) |
| Secteur | Industrie plastique |
| Localisation | Thiès, Sénégal |
| Couleurs | Bleu `#1565C0`, Vert `#4CAF50` |
| Téléphone | 33 999 01 79 |

---

## Accès locaux

| Service | URL | Credentials |
| --- | --- | --- |
| ERP GISAC | `http://localhost:3000/gisac` | selon utilisateur |
| Super-Admin | `http://localhost:3000/super-admin` | `admin@innosoft.sn` |
| API Swagger | `http://localhost:3001/api/docs` | — |
| MinIO Console | `http://localhost:9001` | minio_admin / minio_secret |
| Prisma Studio | `http://localhost:5555` | — |

---

Innosoft Creation © 2026 — Propriété de Global Invest Samoura & Co
