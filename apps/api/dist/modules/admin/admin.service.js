"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let AdminService = class AdminService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getTenants() {
        const tenants = await this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tenantModules: { include: { module: { select: { code: true, nom: true } } } },
                _count: { select: { users: true } },
            },
        });
        return tenants.map((t) => ({
            id: t.id,
            slug: t.slug,
            nom: t.nom,
            secteur: t.secteur,
            plan: t.plan,
            actif: t.actif,
            ville: t.ville,
            pays: t.pays,
            createdAt: t.createdAt,
            nbUtilisateurs: t._count.users,
            modules: t.tenantModules
                .filter((tm) => tm.actif)
                .map((tm) => tm.module.code),
        }));
    }
    async getTenant(id) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id },
            include: {
                tenantModules: { include: { module: true } },
                users: { select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true } },
                _count: { select: { users: true } },
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        const [nbCommandes, nbClients] = await Promise.all([
            this.prisma.commande.count({ where: { tenantId: id } }),
            this.prisma.client.count({ where: { tenantId: id } }),
        ]);
        return { ...tenant, nbCommandes, nbClients };
    }
    async toggleTenant(id, actif) {
        const tenant = await this.prisma.tenant.findFirst({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        return this.prisma.tenant.update({ where: { id }, data: { actif } });
    }
    async toggleModule(tenantId, moduleCode, actif) {
        const module = await this.prisma.module.findFirst({ where: { code: moduleCode } });
        if (!module)
            throw new common_1.NotFoundException('Module introuvable');
        const result = await this.prisma.tenantModule.upsert({
            where: { tenantId_moduleId: { tenantId, moduleId: module.id } },
            update: { actif },
            create: { tenantId, moduleId: module.id, actif },
        });
        await this.redis.invalidateModulesActifs(tenantId);
        return result;
    }
    async getStatsPlateforme() {
        const [nbTenants, nbTenantActifs, nbUsers, nbCommandes, nbFactures, totalCA] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { actif: true } }),
            this.prisma.user.count({ where: { actif: true } }),
            this.prisma.commande.count(),
            this.prisma.facture.count(),
            this.prisma.facture.aggregate({
                where: { statut: 'payee' },
                _sum: { totalTTC: true },
            }),
        ]);
        const modules = await this.prisma.module.findMany({
            include: { _count: { select: { tenantModules: true } } },
        });
        return {
            nbTenants,
            nbTenantActifs,
            nbUsers,
            nbCommandes,
            nbFactures,
            totalCA: Number(totalCA._sum.totalTTC ?? 0),
            modulesUsage: modules.map((m) => ({
                code: m.code,
                nom: m.nom,
                nbTenants: m._count.tenantModules,
            })),
        };
    }
    async getModules() {
        return this.prisma.module.findMany({ orderBy: { code: 'asc' } });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AdminService);
//# sourceMappingURL=admin.service.js.map