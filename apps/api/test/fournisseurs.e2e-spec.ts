import * as request from 'supertest';
import {
  creerApp, fermerApp, preparerDonneesTest,
  getPrisma, getApp,
  TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_TENANT_SLUG,
} from './test-helpers';
import { INestApplication } from '@nestjs/common';
import { RedisService } from '../src/redis/redis.service';

describe('Fournisseurs (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let tenantId: string;
  let fournisseurId: string;

  beforeAll(async () => {
    app = await creerApp();
    const { tenant } = await preparerDonneesTest();
    tenantId = tenant.id;

    const prisma = getPrisma();
    const redis = app.get(RedisService);

    const mod = await prisma.module.findUnique({ where: { code: 'fournisseurs' } });
    if (mod) {
      await prisma.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId, moduleId: mod.id } },
        create: { tenantId, moduleId: mod.id, actif: true },
        update: { actif: true },
      });
    }
    await redis.invalidateModulesActifs(tenantId);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ tenantSlug: TEST_TENANT_SLUG, email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    token = res.body.accessToken;
  });

  afterAll(async () => { await fermerApp(); });

  describe('POST /api/v1/fournisseurs', () => {
    it('doit créer un fournisseur', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/fournisseurs')
        .set('Authorization', `Bearer ${token}`)
        .send({ nom: 'Fournisseur Test SN', pays: 'SN', email: 'contact@frn-test.sn', telephone: '77 000 11 22' });

      expect(res.status).toBe(201);
      expect(res.body.nom).toBe('Fournisseur Test SN');
      expect(res.body.tenantId).toBe(tenantId);
      expect(res.body.actif).toBe(true);
      expect(res.body).toHaveProperty('reference');
      fournisseurId = res.body.id;
    });
  });

  describe('GET /api/v1/fournisseurs', () => {
    it('doit retourner la liste paginée', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/fournisseurs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('doit rechercher par nom', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/fournisseurs?search=Fournisseur+Test')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items.some((f: any) => f.nom.includes('Fournisseur Test'))).toBe(true);
    });
  });

  describe('GET /api/v1/fournisseurs/:id', () => {
    it('doit retourner le détail du fournisseur', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/fournisseurs/${fournisseurId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(fournisseurId);
    });

    it('doit retourner 404 pour un id inconnu', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/fournisseurs/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/fournisseurs/:id', () => {
    it('doit modifier le fournisseur', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/fournisseurs/${fournisseurId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ telephone: '33 999 99 99' });

      expect(res.status).toBe(200);
      expect(res.body.telephone).toBe('33 999 99 99');
    });
  });

  describe('PATCH /api/v1/fournisseurs/:id/toggle', () => {
    it('doit désactiver puis réactiver le fournisseur', async () => {
      const res1 = await request(app.getHttpServer())
        .patch(`/api/v1/fournisseurs/${fournisseurId}/toggle`)
        .set('Authorization', `Bearer ${token}`);
      expect(res1.status).toBe(200);
      expect(res1.body.actif).toBe(false);

      const res2 = await request(app.getHttpServer())
        .patch(`/api/v1/fournisseurs/${fournisseurId}/toggle`)
        .set('Authorization', `Bearer ${token}`);
      expect(res2.status).toBe(200);
      expect(res2.body.actif).toBe(true);
    });
  });

  describe('DELETE /api/v1/fournisseurs/:id (soft delete)', () => {
    it('doit archiver le fournisseur sans MP liées', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/fournisseurs/${fournisseurId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('archivé');
    });

    it('le fournisseur archivé ne doit plus apparaître dans la liste', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/fournisseurs')
        .set('Authorization', `Bearer ${token}`);

      const ids = res.body.items.map((f: any) => f.id);
      expect(ids).not.toContain(fournisseurId);
    });

    it('doit toujours exister en BDD avec deletedAt', async () => {
      const frn = await getPrisma().fournisseur.findFirst({ where: { id: fournisseurId } });
      expect(frn).not.toBeNull();
      expect(frn?.deletedAt).not.toBeNull();
    });

    it('doit refuser la suppression si des MP actives sont liées', async () => {
      // Créer un fournisseur avec une MP liée
      const prisma = getPrisma();
      const frn2 = await prisma.fournisseur.create({
        data: { tenantId, nom: 'FRN avec MP', reference: `FRN-MP-${Date.now()}`, pays: 'SN' },
      });
      await prisma.matierePremiere.create({
        data: {
          tenantId,
          nom: 'MP Liée',
          reference: `MP-LIE-${Date.now()}`,
          type: 'test',
          fournisseurId: frn2.id,
          unite: 'kg',
          prixAchat: 100,
          stockMinimum: 10,
        },
      });

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/fournisseurs/${frn2.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
