import * as request from 'supertest';
import {
  creerApp,
  fermerApp,
  preparerDonneesTest,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
  TEST_TENANT_SLUG,
} from './test-helpers';
import { INestApplication } from '@nestjs/common';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await creerApp();
    await preparerDonneesTest();
  });

  afterAll(async () => {
    await fermerApp();
  });

  describe('POST /api/v1/auth/login', () => {
    it('doit connecter un utilisateur valide', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          tenantSlug: TEST_TENANT_SLUG,
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(TEST_ADMIN_EMAIL);
      expect(res.body.user).not.toHaveProperty('passwordHash');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('doit rejeter un mauvais mot de passe (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          tenantSlug: TEST_TENANT_SLUG,
          email: TEST_ADMIN_EMAIL,
          password: 'MauvaisMotDePasse!',
        });

      expect(res.status).toBe(401);
    });

    it('doit rejeter un tenant inexistant (404)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          tenantSlug: 'tenant-inexistant',
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD,
        });

      expect(res.status).toBe(404);
    });

    it('doit rejeter une requête sans corps (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('doit retourner le profil avec un token valide', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(TEST_ADMIN_EMAIL);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('doit rejeter sans token (401)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('doit rejeter avec un token invalide (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token.invalide.ici');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('doit renouveler les tokens avec un refresh token valide', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      // Le nouveau refresh token doit être différent (rotation)
      expect(res.body.refreshToken).not.toBe(refreshToken);
    });

    it('doit rejeter un refresh token invalide (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token.faux.ici' });

      expect(res.status).toBe(401);
    });
  });

  describe('Isolation tenant', () => {
    it('ne doit pas permettre de se connecter avec l\'email d\'un autre tenant', async () => {
      // Essayer de se connecter sur le tenant gisac avec les credentials du tenant test
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          tenantSlug: 'gisac',
          email: TEST_ADMIN_EMAIL, // email valide mais sur tenant test, pas gisac
          password: TEST_ADMIN_PASSWORD,
        });

      // Doit échouer : email n'existe pas dans le tenant gisac
      expect([401, 404]).toContain(res.status);
    });
  });
});
