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

describe('CRM — Clients (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let tenantId: string;
  let clientId: string;

  beforeAll(async () => {
    app = await creerApp();
    const { tenant } = await preparerDonneesTest();
    tenantId = tenant.id;

    // Activer le module CRM + vider le cache Redis pour ce tenant
    const prisma = getPrisma();
    const moduleCrm = await prisma.module.findUnique({ where: { code: 'crm' } });
    if (moduleCrm) {
      await prisma.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId, moduleId: moduleCrm.id } },
        create: { tenantId, moduleId: moduleCrm.id, actif: true },
        update: { actif: true },
      });
    }
    // Invalider le cache Redis pour forcer la lecture BDD au prochain appel
    const redis = getApp().get(RedisService);
    await redis.invalidateModulesActifs(tenantId);

    // Obtenir le token
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ tenantSlug: TEST_TENANT_SLUG, email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await fermerApp();
  });

  describe('POST /api/v1/crm/clients', () => {
    it('doit créer un client', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nom: 'ACME Plastiques SA',
          telephone: '33 123 45 67',
          email: 'contact@acme-plastiques.sn',
          adresse: 'Zone Industrielle, Dakar',
        });

      expect(res.status).toBe(201);
      expect(res.body.nom).toBe('ACME Plastiques SA');
      expect(res.body.tenantId).toBe(tenantId);
      expect(res.body).toHaveProperty('reference');
      clientId = res.body.id;
    });

    it('doit refuser sans token (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/crm/clients')
        .send({ nom: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/crm/clients', () => {
    it('doit retourner la liste paginée des clients du tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/clients')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
      // Tous les clients retournés appartiennent au bon tenant
      res.body.items.forEach((c: any) => {
        expect(c.tenantId).toBe(tenantId);
      });
    });

    it('doit respecter la pagination (?page=1&limite=1)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/clients?page=1&limite=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeLessThanOrEqual(1);
    });

    it('doit filtrer par recherche (?search=ACME)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/clients?search=ACME')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      res.body.items.forEach((c: any) => {
        expect(c.nom.toLowerCase()).toContain('acme');
      });
    });
  });

  describe('GET /api/v1/crm/clients/:id', () => {
    it('doit retourner le détail du client', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/crm/clients/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(clientId);
      expect(res.body.nom).toBe('ACME Plastiques SA');
    });

    it('doit retourner 404 pour un id inexistant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/clients/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/crm/clients/:id', () => {
    it('doit modifier le client', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/crm/clients/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ telephone: '77 999 00 00', adresse: 'Thiès, Sénégal' });

      expect(res.status).toBe(200);
      expect(res.body.telephone).toBe('77 999 00 00');
    });
  });

  describe('DELETE /api/v1/crm/clients/:id (soft delete)', () => {
    it('doit archiver le client (soft delete)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/crm/clients/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('archivé');
    });

    it('le client archivé ne doit plus apparaître dans la liste', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crm/clients')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const ids = res.body.items.map((c: any) => c.id);
      expect(ids).not.toContain(clientId);
    });

    it('le client archivé doit toujours exister en BDD (intégrité comptable)', async () => {
      const prisma = getPrisma();
      const client = await prisma.client.findFirst({ where: { id: clientId } });
      expect(client).not.toBeNull();
      expect(client?.deletedAt).not.toBeNull();
    });
  });
});
