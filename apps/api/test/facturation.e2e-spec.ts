import * as request from 'supertest';
import {
  creerApp, fermerApp, preparerDonneesTest,
  getPrisma, getApp,
  TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_TENANT_SLUG,
} from './test-helpers';
import { INestApplication } from '@nestjs/common';
import { RedisService } from '../src/redis/redis.service';

describe('Facturation (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let tenantId: string;
  let factureId: string;
  let commandeId: string;

  beforeAll(async () => {
    app = await creerApp();
    const { tenant } = await preparerDonneesTest();
    tenantId = tenant.id;

    const prisma = getPrisma();
    const redis = app.get(RedisService);

    // Activer les modules nécessaires
    for (const code of ['commandes', 'crm', 'facturation']) {
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

    // Préparer client + produit + commande LIVRÉE (prérequis facturation)
    const client = await prisma.client.create({
      data: { tenantId, nom: 'Client Factu Test', reference: `CLI-FAC-${Date.now()}`, email: 'client@test.sn' },
    });

    const produit = await prisma.produit.create({
      data: { tenantId, nom: 'Produit Factu', reference: `PRD-FAC-${Date.now()}`, categorie: 'test', prixUnitaire: 10000, unite: 'pce' },
    });

    // Créer directement en BDD une commande avec statut "livree"
    const commande = await prisma.commande.create({
      data: {
        tenantId,
        clientId: client.id,
        reference: `CMD-FAC-TEST-${Date.now()}`,
        statut: 'livree',
        totalHT: 100000,
        tva: 18000,
        totalTTC: 118000,
        lignes: {
          create: [{
            produitId: produit.id,
            quantite: 10,
            prixUnitaire: 10000,
            montant: 100000,
          }],
        },
      },
    });
    commandeId = commande.id;

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ tenantSlug: TEST_TENANT_SLUG, email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    token = res.body.accessToken;
  });

  afterAll(async () => { await fermerApp(); });

  describe('POST /api/v1/facturation/factures/depuis-commande/:commandeId', () => {
    it('doit créer une facture depuis une commande livrée', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/depuis-commande/${commandeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('reference');
      expect(res.body.reference).toMatch(/^FAC-\d{4}-\d{4}$/);
      expect(res.body.statut).toBe('emise');
      expect(Number(res.body.totalTTC)).toBe(118000);

      factureId = res.body.id;
    });

    it('doit rejeter si la commande n\'est pas livrée', async () => {
      // Créer une commande en brouillon
      const prisma = getPrisma();
      const client = await prisma.client.findFirst({ where: { tenantId } });
      const produit = await prisma.produit.findFirst({ where: { tenantId } });

      const cmdBrouillon = await prisma.commande.create({
        data: {
          tenantId,
          clientId: client!.id,
          reference: `CMD-BR-${Date.now()}`,
          statut: 'brouillon',
          totalHT: 50000,
          tva: 9000,
          totalTTC: 59000,
          lignes: { create: [{ produitId: produit!.id, quantite: 5, prixUnitaire: 10000, montant: 50000 }] },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/depuis-commande/${cmdBrouillon.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('doit rejeter si une facture existe déjà pour cette commande', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/depuis-commande/${commandeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/facturation/factures', () => {
    it('doit retourner la liste des factures du tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/facturation/factures')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/facturation/factures/:id', () => {
    it('doit retourner le détail de la facture avec commande et paiements', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/facturation/factures/${factureId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(factureId);
      expect(res.body.commande).toBeDefined();
      expect(res.body.paiements).toBeDefined();
    });
  });

  describe('POST /api/v1/facturation/factures/:id/paiements', () => {
    it('doit enregistrer un paiement partiel', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/${factureId}/paiements`)
        .set('Authorization', `Bearer ${token}`)
        .send({ montant: 50000, mode: 'virement', reference: 'VIR-001' });

      expect(res.status).toBe(201);

      // Vérifier que la facture passe en "partiellement_payee"
      const facture = await getPrisma().facture.findFirst({ where: { id: factureId } });
      expect(facture?.statut).toBe('partiellement_payee');
    });

    it('doit solder la facture et la passer en "payee"', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/${factureId}/paiements`)
        .set('Authorization', `Bearer ${token}`)
        .send({ montant: 68000, mode: 'especes' }); // 118000 - 50000 = 68000

      expect(res.status).toBe(201);

      const facture = await getPrisma().facture.findFirst({ where: { id: factureId } });
      expect(facture?.statut).toBe('payee');
    });

    it('doit rejeter un paiement dépassant le restant dû', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/facturation/factures/${factureId}/paiements`)
        .set('Authorization', `Bearer ${token}`)
        .send({ montant: 1, mode: 'especes' }); // facture déjà soldée

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/facturation/factures/stats', () => {
    it('doit retourner les statistiques de facturation', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/facturation/factures/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('chiffreAffaires');
      expect(res.body).toHaveProperty('nombreImpayees');
      expect(res.body).toHaveProperty('montantImpaye');
      expect(Number(res.body.chiffreAffaires)).toBeGreaterThan(0);
    });
  });
});
