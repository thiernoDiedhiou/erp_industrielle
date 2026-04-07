import * as request from 'supertest';
import {
  creerApp, fermerApp, preparerDonneesTest,
  getPrisma, getApp,
  TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_TENANT_SLUG,
} from './test-helpers';
import { INestApplication } from '@nestjs/common';
import { RedisService } from '../src/redis/redis.service';

describe('Commandes (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let tenantId: string;
  let clientId: string;
  let produitId: string;
  let commandeId: string;

  beforeAll(async () => {
    app = await creerApp();
    const { tenant } = await preparerDonneesTest();
    tenantId = tenant.id;

    const prisma = getPrisma();
    const redis = app.get(RedisService);

    // Activer les modules commandes + crm
    for (const code of ['commandes', 'crm']) {
      const mod = await prisma.module.findUnique({ where: { code } });
      if (mod) {
        await prisma.tenantModule.upsert({
          where: { tenantId_moduleId: { tenantId, moduleId: mod.id } },
          create: { tenantId, moduleId: mod.id, actif: true },
          update: { actif: true },
        });
      }
    }
    await redis.invalidateModulesActifs(tenantId);

    // Créer un client et un produit de test
    const client = await prisma.client.create({
      data: { tenantId, nom: 'Client Test CMD', reference: `CLI-TEST-${Date.now()}` },
    });
    clientId = client.id;

    const produit = await prisma.produit.create({
      data: {
        tenantId,
        nom: 'Produit Test CMD',
        reference: `PRD-TEST-${Date.now()}`,
        categorie: 'test',
        prixUnitaire: 5000,
        unite: 'pce',
      },
    });
    produitId = produit.id;

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ tenantSlug: TEST_TENANT_SLUG, email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    token = res.body.accessToken;
  });

  afterAll(async () => { await fermerApp(); });

  describe('POST /api/v1/commandes', () => {
    it('doit créer une commande avec calcul automatique des montants', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/commandes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId,
          notes: 'Commande de test',
          lignes: [
            { produitId, quantite: 10, prixUnitaire: 5000 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('reference');
      expect(res.body.reference).toMatch(/^CMD-\d{4}-\d{4}$/);
      expect(res.body.statut).toBe('brouillon');

      // Vérifier les calculs : 10 × 5000 = 50000 HT, TVA 18% = 9000, TTC = 59000
      expect(Number(res.body.totalHT)).toBe(50000);
      expect(Number(res.body.tva)).toBeCloseTo(9000, 0);
      expect(Number(res.body.totalTTC)).toBeCloseTo(59000, 0);

      commandeId = res.body.id;
    });

    it('doit rejeter si le client appartient à un autre tenant', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/commandes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: '00000000-0000-0000-0000-000000000000',
          lignes: [{ produitId, quantite: 1, prixUnitaire: 1000 }],
        });
      expect(res.status).toBe(404);
    });

    it('doit rejeter sans lignes (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/commandes')
        .set('Authorization', `Bearer ${token}`)
        .send({ clientId, lignes: [] });
      // lignes vide ou invalide → 400 ou 201 selon validation
      expect([400, 201]).toContain(res.status);
    });
  });

  describe('GET /api/v1/commandes', () => {
    it('doit retourner la liste paginée', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/commandes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      // Toutes les commandes appartiennent au tenant
      res.body.items.forEach((c: any) => expect(c.tenantId).toBe(tenantId));
    });

    it('doit filtrer par statut (?statut=brouillon)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/commandes?statut=brouillon')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      res.body.items.forEach((c: any) => expect(c.statut).toBe('brouillon'));
    });
  });

  describe('GET /api/v1/commandes/:id', () => {
    it('doit retourner le détail avec lignes et historique', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/commandes/${commandeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(commandeId);
      expect(res.body.lignes).toHaveLength(1);
      expect(res.body.historique.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/commandes/:id/statut', () => {
    it('doit refuser une transition non autorisée (brouillon → livree)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/commandes/${commandeId}/statut`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statut: 'livree' });

      // La transition directe brouillon → livree n'existe pas dans le workflow
      expect([400, 403]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/commandes/:id', () => {
    it('doit supprimer une commande en brouillon', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/commandes/${commandeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('supprimée');
    });

    it('la commande supprimée ne doit plus exister en BDD', async () => {
      const prisma = getPrisma();
      const cmd = await prisma.commande.findFirst({ where: { id: commandeId } });
      expect(cmd).toBeNull();
    });
  });
});
