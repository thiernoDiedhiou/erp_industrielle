"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const nest_winston_1 = require("nest-winston");
const winston_config_1 = require("./common/logger/winston.config");
const audit_module_1 = require("./modules/audit/audit.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const queue_module_1 = require("./modules/queue/queue.module");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const config_engine_module_1 = require("./modules/config-engine/config-engine.module");
const crm_module_1 = require("./modules/crm/crm.module");
const commandes_module_1 = require("./modules/commandes/commandes.module");
const production_module_1 = require("./modules/production/production.module");
const stock_module_1 = require("./modules/stock/stock.module");
const facturation_module_1 = require("./modules/facturation/facturation.module");
const recyclage_module_1 = require("./modules/recyclage/recyclage.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const admin_module_1 = require("./modules/admin/admin.module");
const fournisseurs_module_1 = require("./modules/fournisseurs/fournisseurs.module");
const machines_module_1 = require("./modules/machines/machines.module");
const matieres_premieres_module_1 = require("./modules/matieres-premieres/matieres-premieres.module");
const logistique_module_1 = require("./modules/logistique/logistique.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env',
            }),
            nest_winston_1.WinstonModule.forRoot((0, winston_config_1.buildWinstonConfig)()),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            config_engine_module_1.ConfigEngineModule,
            crm_module_1.CrmModule,
            commandes_module_1.CommandesModule,
            production_module_1.ProductionModule,
            stock_module_1.StockModule,
            facturation_module_1.FacturationModule,
            recyclage_module_1.RecyclageModule,
            dashboard_module_1.DashboardModule,
            admin_module_1.AdminModule,
            fournisseurs_module_1.FournisseursModule,
            machines_module_1.MachinesModule,
            matieres_premieres_module_1.MatieresPremiereModule,
            logistique_module_1.LogistiqueModule,
            audit_module_1.AuditModule,
            queue_module_1.QueueModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map