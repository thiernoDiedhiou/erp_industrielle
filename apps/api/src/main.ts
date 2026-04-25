import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { buildWinstonConfig } from './common/logger/winston.config';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  // ── Sentry : initialiser avant tout le reste ──────────────────────────────
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [nodeProfilingIntegration()],
      // Échantillonner 20 % des traces de performance
      tracesSampleRate: 0.2,
      // Profiler 100 % des transactions échantillonnées
      profilesSampleRate: 1.0,
    });
  }

  // ── Application NestJS avec Winston comme logger système ──────────────────
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(buildWinstonConfig()),
  });

  // Remplacer le logger NestJS par Winston (logs contextualisés)
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Filtre global : capture les 5xx dans Sentry + renvoie une réponse propre
  app.useGlobalFilters(new SentryExceptionFilter());

  // ── Sécurité HTTP : headers de protection (Helmet) ────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // nécessaire pour Swagger UI en dev
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],   // requis pour Swagger UI
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // Préfixe global API
  app.setGlobalPrefix('api/v1');

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS strict : exige FRONTEND_URL en production ────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL;

  if (isProd && !frontendUrl) {
    throw new Error('FRONTEND_URL est obligatoire en production (variable d\'environnement manquante)');
  }

  app.enableCors({
    origin: frontendUrl || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Swagger : désactivé en production ────────────────────────────────────
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('SaaS ERP API')
      .setDescription('API plateforme ERP industrielle multi-tenant')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`API démarrée sur http://localhost:${port}/api/v1`, 'Bootstrap');
  if (!isProd) {
    logger.log(`Swagger sur http://localhost:${port}/api/docs`, 'Bootstrap');
  }
  if (process.env.SENTRY_DSN) {
    logger.log('Sentry activé', 'Bootstrap');
  }
}

bootstrap();
