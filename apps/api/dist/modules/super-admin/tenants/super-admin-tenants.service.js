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
exports.SuperAdminTenantsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SuperAdminTenantsService = class SuperAdminTenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(search) {
        const tenants = await this.prisma.tenant.findMany({
            where: search
                ? { OR: [{ nom: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] }
                : undefined,
            include: {
                _count: { select: { users: true, tenantModules: true } },
                tenantModules: { where: { actif: true }, include: { module: { select: { code: true, nom: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return tenants.map((t) => ({
            id: t.id,
            slug: t.slug,
            nom: t.nom,
            secteur: t.secteur,
            plan: t.plan,
            actif: t.actif,
            pays: t.pays,
            ville: t.ville,
            telephone: t.telephone,
            createdAt: t.createdAt,
            nbUsers: t._count.users,
            nbModules: t._count.tenantModules,
            modules: t.tenantModules.map((tm) => tm.module.code),
        }));
    }
    async getUn(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                users: {
                    where: { deletedAt: null },
                    select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, derniereConnexion: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                },
                tenantModules: {
                    include: { module: true },
                    orderBy: { activatedAt: 'asc' },
                },
                _count: { select: { users: true } },
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        const statsCommandes = await this.prisma.commande.count({ where: { tenantId: id } });
        const statsFactures = await this.prisma.facture.count({ where: { tenantId: id } });
        return { ...tenant, statsCommandes, statsFactures };
    }
    async creer(data) {
        const existe = await this.prisma.tenant.findUnique({ where: { slug: data.slug } });
        if (existe)
            throw new common_1.ConflictException(`Le slug "${data.slug}" est déjà utilisé`);
        const allModules = await this.prisma.module.findMany();
        const selectedCodes = data.moduleCodes ?? allModules.map((m) => m.code);
        const tenant = await this.prisma.$transaction(async (tx) => {
            const t = await tx.tenant.create({
                data: {
                    slug: data.slug,
                    nom: data.nom,
                    secteur: data.secteur,
                    plan: data.plan,
                    pays: data.pays ?? 'SN',
                    ville: data.ville,
                    telephone: data.telephone,
                    adresse: data.adresse,
                },
            });
            const modulesChoisis = allModules.filter((m) => selectedCodes.includes(m.code));
            await tx.tenantModule.createMany({
                data: modulesChoisis.map((m) => ({ tenantId: t.id, moduleId: m.id })),
            });
            const hash = await bcrypt.hash(data.adminPassword, 12);
            await tx.user.create({
                data: {
                    tenantId: t.id,
                    nom: data.adminNom,
                    email: data.adminEmail,
                    passwordHash: hash,
                    role: 'admin',
                },
            });
            await tx.groupe.create({
                data: {
                    tenantId: t.id,
                    code: 'admin',
                    nom: 'Administrateur',
                    description: 'Accès complet à tous les modules',
                    permissions: {},
                },
            });
            return t;
        });
        return this.getUn(tenant.id);
    }
    async modifier(id, data) {
        await this.prisma.tenant.findUniqueOrThrow({ where: { id } }).catch(() => {
            throw new common_1.NotFoundException('Tenant introuvable');
        });
        return this.prisma.tenant.update({ where: { id }, data });
    }
    async toggleActif(id) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        return this.prisma.tenant.update({
            where: { id },
            data: { actif: !tenant.actif },
        });
    }
    async modifierModules(id, moduleCodes) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        const allModules = await this.prisma.module.findMany();
        const modulesChoisis = allModules.filter((m) => moduleCodes.includes(m.code));
        await this.prisma.$transaction(async (tx) => {
            await tx.tenantModule.deleteMany({ where: { tenantId: id } });
            await tx.tenantModule.createMany({
                data: modulesChoisis.map((m) => ({ tenantId: id, moduleId: m.id })),
            });
        });
        return this.getUn(id);
    }
    async creerUser(tenantId, data) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant introuvable');
        const existe = await this.prisma.user.findFirst({ where: { tenantId, email: data.email, deletedAt: null } });
        if (existe)
            throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
        const hash = await bcrypt.hash(data.password, 12);
        return this.prisma.user.create({
            data: {
                tenantId,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                passwordHash: hash,
                role: data.role,
                telephone: data.telephone,
            },
            select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true },
        });
    }
    async getStats() {
        const [totalTenants, tenantsActifs, totalUsers, usersActifs, parPlan] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { actif: true } }),
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { actif: true, deletedAt: null } }),
            this.prisma.tenant.groupBy({ by: ['plan'], _count: { id: true } }),
        ]);
        const commandes = await this.prisma.commande.count();
        const factures = await this.prisma.facture.count();
        return {
            totalTenants,
            tenantsActifs,
            tenantsSuspendus: totalTenants - tenantsActifs,
            totalUsers,
            usersActifs,
            commandes,
            factures,
            parPlan: parPlan.reduce((acc, p) => ({ ...acc, [p.plan]: p._count.id }), {}),
        };
    }
};
exports.SuperAdminTenantsService = SuperAdminTenantsService;
exports.SuperAdminTenantsService = SuperAdminTenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuperAdminTenantsService);
//# sourceMappingURL=super-admin-tenants.service.js.map