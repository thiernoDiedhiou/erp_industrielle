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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let TenantsService = class TenantsService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getTenantCourant(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                tenantModules: {
                    where: { actif: true },
                    include: { module: true },
                },
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        return tenant;
    }
    async getUtilisateurs(tenantId, page = 1, limite = 20) {
        const skip = (page - 1) * limite;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where: { tenantId },
                skip,
                take: limite,
                select: {
                    id: true,
                    nom: true,
                    email: true,
                    role: true,
                    telephone: true,
                    actif: true,
                    derniereConnexion: true,
                    createdAt: true,
                },
                orderBy: { nom: 'asc' },
            }),
            this.prisma.user.count({ where: { tenantId } }),
        ]);
        return {
            items,
            total,
            page,
            totalPages: Math.ceil(total / limite),
        };
    }
    async toggleModule(tenantId, moduleCode, actif) {
        const module = await this.prisma.module.findUnique({
            where: { code: moduleCode },
        });
        if (!module)
            throw new common_1.NotFoundException(`Module "${moduleCode}" introuvable`);
        const tenantModule = await this.prisma.tenantModule.findFirst({
            where: { tenantId, moduleId: module.id },
        });
        if (!tenantModule) {
            throw new common_1.NotFoundException(`Module non associé à ce tenant`);
        }
        const updated = await this.prisma.tenantModule.update({
            where: { id: tenantModule.id },
            data: { actif },
        });
        await this.redis.invalidateModulesActifs(tenantId);
        return updated;
    }
    async getSettings(tenantId) {
        return this.prisma.setting.findMany({
            where: { tenantId },
            orderBy: { cle: 'asc' },
        });
    }
    async upsertSetting(tenantId, cle, valeur) {
        return this.prisma.setting.upsert({
            where: { tenantId_cle: { tenantId, cle } },
            create: { tenantId, cle, valeur },
            update: { valeur },
        });
    }
    async creerUtilisateur(tenantId, data) {
        const existe = await this.prisma.user.findFirst({
            where: { email: data.email, tenantId },
        });
        if (existe)
            throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
        const mdp = data.motDePasse ?? 'Bienvenue2025!';
        const hash = await bcrypt.hash(mdp, 10);
        return this.prisma.user.create({
            data: {
                tenantId,
                nom: data.nom,
                email: data.email,
                role: data.role,
                telephone: data.telephone,
                passwordHash: hash,
                actif: true,
            },
            select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
        });
    }
    async toggleUtilisateur(tenantId, userId, actif) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return this.prisma.user.update({
            where: { id: userId },
            data: { actif },
            select: { id: true, nom: true, actif: true },
        });
    }
    async changerRole(tenantId, userId, role) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, nom: true, role: true },
        });
    }
    async getBranding(slug) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: { nom: true, slug: true, logo: true, couleurPrimaire: true, couleurSecondaire: true },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        return tenant;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map