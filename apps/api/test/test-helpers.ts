import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Instance unique de l'app partagée entre tous les tests
let app: INestApplication;
let prisma: PrismaService;

// Données de test fixes
export const TEST_TENANT_SLUG = 'test-tenant';
export const TEST_ADMIN_EMAIL = 'admin@test-erp.sn';
export const TEST_ADMIN_PASSWORD = 'TestPassword123!';

export async function creerApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  prisma = app.get(PrismaService);

  return app;
}

export function getPrisma(): PrismaService {
  return prisma;
}

export function getApp(): INestApplication {
  return app;
}

// Préparer les données de test (tenant + admin)
export async function preparerDonneesTest() {
  // Nettoyer l'éventuel tenant de test précédent
  await nettoyerTenantTest();

  // Créer le tenant de test
  const tenant = await prisma.tenant.create({
    data: {
      slug: TEST_TENANT_SLUG,
      nom: 'Tenant Test ERP',
      secteur: 'test',
      plan: 'pro',
      actif: true,
      pays: 'SN',
    },
  });

  // Créer l'utilisateur admin de test
  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 12);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      nom: 'Admin',
      prenom: 'Test',
      email: TEST_ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      actif: true,
    },
  });

  return { tenant, admin };
}

// Nettoyer toutes les données du tenant de test
export async function nettoyerTenantTest() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TEST_TENANT_SLUG },
  });
  if (!tenant) return;

  const tenantId = tenant.id;

  // Supprimer dans l'ordre (clés étrangères)
  await prisma.auditLog.deleteMany({ where: { tenantId } });
  await prisma.paiement.deleteMany({ where: { tenantId } });
  await prisma.facture.deleteMany({ where: { tenantId } });
  await prisma.bonLivraison.deleteMany({ where: { tenantId } });
  await prisma.ligneCommande.deleteMany({ where: { commande: { tenantId } } });
  await prisma.commandeHistorique.deleteMany({ where: { tenantId } });
  await prisma.commande.deleteMany({ where: { tenantId } });
  await prisma.consommationMP.deleteMany({ where: { tenantId } });
  await prisma.ordreFabrication.deleteMany({ where: { tenantId } });
  await prisma.mouvementStock.deleteMany({ where: { tenantId } });
  await prisma.matierePremiere.deleteMany({ where: { tenantId } });
  await prisma.fournisseur.deleteMany({ where: { tenantId } });
  await prisma.machine.deleteMany({ where: { tenantId } });
  await prisma.produit.deleteMany({ where: { tenantId } });
  await prisma.client.deleteMany({ where: { tenantId } });
  await prisma.user.deleteMany({ where: { tenantId } });
  await prisma.tenantModule.deleteMany({ where: { tenantId } });
  await prisma.setting.deleteMany({ where: { tenantId } });
  await prisma.tenant.delete({ where: { id: tenantId } });
}

export async function fermerApp() {
  await nettoyerTenantTest();
  await app?.close();
}
