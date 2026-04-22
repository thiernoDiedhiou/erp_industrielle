import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { buildWinstonConfig } from './common/logger/winston.config';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { QueueModule } from './modules/queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ConfigEngineModule } from './modules/config-engine/config-engine.module';
import { CrmModule } from './modules/crm/crm.module';
import { CommandesModule } from './modules/commandes/commandes.module';
import { ProductionModule } from './modules/production/production.module';
import { StockModule } from './modules/stock/stock.module';
import { FacturationModule } from './modules/facturation/facturation.module';
import { RecyclageModule } from './modules/recyclage/recyclage.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { FournisseursModule } from './modules/fournisseurs/fournisseurs.module';
import { MachinesModule } from './modules/machines/machines.module';
import { MatieresPremiereModule } from './modules/matieres-premieres/matieres-premieres.module';
import { LogistiqueModule } from './modules/logistique/logistique.module';
import { BomModule } from './modules/bom/bom.module';
import { UsersModule } from './modules/users/users.module';
import { GroupesModule } from './modules/groupes/groupes.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';

@Module({
  imports: [
    // Configuration globale depuis .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // Logger structuré Winston (JSON prod, pretty dev)
    WinstonModule.forRoot(buildWinstonConfig()),

    // Rate limiting : 100 req/minute par IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Modules infrastructure
    PrismaModule,
    RedisModule,
    NotificationsModule,

    // Modules fonctionnels
    AuthModule,
    TenantsModule,
    ConfigEngineModule,
    CrmModule,
    CommandesModule,
    ProductionModule,
    StockModule,
    FacturationModule,
    RecyclageModule,
    DashboardModule,
    AdminModule,
    FournisseursModule,
    MachinesModule,
    MatieresPremiereModule,
    LogistiqueModule,
    BomModule,
    UsersModule,
    GroupesModule,
    SuperAdminModule,
    AuditModule,
    QueueModule,
  ],
  providers: [
    // Guard global : applique le rate limiting sur toutes les routes
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Intercepteur global : journalise automatiquement les routes décorées @Audit
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
