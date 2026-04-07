import * as request from 'supertest';
import {
  creerApp,
  fermerApp,
  preparerDonneesTest,
  getPrisma,
  getApp,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
  TEST_TENANT_SLUG,
} from './test-helpers';
import { INestApplication } from '@nestjs/common';
import { RedisService } from '../src/redis/redis.service';

describe('Matières Premières (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let tenantId: string;
  let mpId: string;

  beforeAll(async () => {
    app = await creerApp();
    const { tenant } = await preparerDonneesTest();
    tenantId = tenant.id;

    // Activer le module matieres-premieres + invalider le cache Redis
    const prisma = getPrisma();
    const module = await prisma.module.findUnique({ where: { code: 'matieres-premieres' } });
    if (module) {
      await prisma.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId, moduleId: module.id } },
        create: { tenantId, moduleId: module.id, actif: true },
        update: { actif: true },
      });
    }
    const redis = getApp().get(RedisService);
    await redis.invalidateModulesActifs(tenantId);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ tenantSlug: TEST_TENANT_SLUG, email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await fermerApp();
  });

  describe('POST /api/v1/matieres-premieres', () => {
    it('doit créer une matière première', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/matieres-premieres')
        .set('Authorization', `Bearer ${token}`)
        .send({
          reference: 'MP-TEST-001',
          nom: 'Polyéthylène Test',
          type: 'plastique',
          unite: 'kg',
          prixAchat: 850,
          stockMinimum: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.nom).toBe('Polyéthylène Test');
      expect(res.body.tenantId).toBe(tenantId);
      expect(Number(res.body.stockActuel)).toBe(0);
      mpId = res.body.id;
    });

    it('doit rejeter une référence dupliquée', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/matieres-premieres')
        .set('Authorization', `Bearer ${token}`)
        .send({
          reference: 'MP-TEST-001', // même référence
          nom: 'Autre MP',
          type: 'plastique',
          unite: 'kg',
          prixAchat: 500,
          stockMinimum: 50,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/matieres-premieres/:id/stock — entrée', () => {
    it('doit augmenter le stock après une entrée', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'entree', quantite: 500, motif: 'Réception commande fournisseur' });

      expect(res.status).toBe(200);
      expect(Number(res.body.stockActuel)).toBe(500);
    });

    it('le mouvement de stock doit être enregistré en BDD', async () => {
      const prisma = getPrisma();
      const mvt = await prisma.mouvementStock.findFirst({
        where: { matierePremiereId: mpId, type: 'entree' },
      });
      expect(mvt).not.toBeNull();
      expect(Number(mvt?.quantite)).toBe(500);
    });
  });

  describe('PATCH /api/v1/matieres-premieres/:id/stock — sortie', () => {
    it('doit diminuer le stock après une sortie', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'sortie', quantite: 350, motif: 'Consommation production' });

      expect(res.status).toBe(200);
      expect(Number(res.body.stockActuel)).toBe(150); // 500 - 350
    });

    it('doit rejeter une sortie si stock insuffisant', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'sortie', quantite: 9999 }); // plus que le stock disponible

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/matieres-premieres/:id/stock — alerte seuil', () => {
    it('doit passer sous le seuil minimum sans erreur (alerte déclenchée async)', async () => {
      // Stock actuel = 150, seuil = 100 → on sort 60, stock = 90 < 100
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'sortie', quantite: 60 });

      expect(res.status).toBe(200);
      expect(Number(res.body.stockActuel)).toBe(90);
      // L'alerte est émise de façon asynchrone via RabbitMQ — pas de vérification synchrone ici
    });
  });

  describe('PATCH /api/v1/matieres-premieres/:id/stock — ajustement', () => {
    it('doit ajuster directement à une valeur fixe', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'ajustement', quantite: 250, motif: 'Inventaire physique' });

      expect(res.status).toBe(200);
      expect(Number(res.body.stockActuel)).toBe(250);
    });
  });

  describe('DELETE /api/v1/matieres-premieres/:id (soft delete)', () => {
    it('doit refuser si stock > 0', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/matieres-premieres/${mpId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400); // stock = 250, doit être à 0
    });

    it('doit archiver si stock = 0', async () => {
      // Remettre à 0 via ajustement
      await request(app.getHttpServer())
        .patch(`/api/v1/matieres-premieres/${mpId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'ajustement', quantite: 0 });

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/matieres-premieres/${mpId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('archivée');
    });

    it('la MP archivée doit toujours exister en BDD avec deletedAt', async () => {
      const prisma = getPrisma();
      const mp = await prisma.matierePremiere.findFirst({ where: { id: mpId } });
      expect(mp?.deletedAt).not.toBeNull();
    });
  });
});
