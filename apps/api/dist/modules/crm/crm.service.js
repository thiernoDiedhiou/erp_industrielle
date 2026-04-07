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
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CrmService = class CrmService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClients(tenantId, opts) {
        const { page = 1, limite = 20, search } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.client.findMany({
                where,
                skip,
                take: limite,
                orderBy: { nom: 'asc' },
            }),
            this.prisma.client.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getClient(tenantId, id) {
        const client = await this.prisma.client.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                commandes: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, reference: true, statut: true, totalHT: true, createdAt: true },
                },
            },
        });
        if (!client)
            throw new common_1.NotFoundException('Client introuvable');
        return client;
    }
    async creerClient(tenantId, dto) {
        const reference = `CLI-${Date.now()}`;
        return this.prisma.client.create({
            data: { ...dto, tenantId, reference },
        });
    }
    async modifierClient(tenantId, id, dto) {
        const client = await this.prisma.client.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!client)
            throw new common_1.NotFoundException('Client introuvable');
        return this.prisma.client.update({ where: { id }, data: dto });
    }
    async supprimerClient(tenantId, id) {
        const client = await this.prisma.client.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!client)
            throw new common_1.NotFoundException('Client introuvable');
        const commandesActives = await this.prisma.commande.count({
            where: {
                clientId: id,
                tenantId,
                deletedAt: null,
                statut: { notIn: ['livree', 'facturee', 'annulee'] },
            },
        });
        if (commandesActives > 0) {
            throw new Error(`Impossible de supprimer : ${commandesActives} commande(s) en cours`);
        }
        await this.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Client archivé' };
    }
    async getProduits(tenantId, opts) {
        const { page = 1, limite = 20, search } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { reference: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.produit.findMany({
                where,
                skip,
                take: limite,
                orderBy: { nom: 'asc' },
            }),
            this.prisma.produit.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getProduit(tenantId, id) {
        const produit = await this.prisma.produit.findFirst({
            where: { id, tenantId, deletedAt: null },
        });
        if (!produit)
            throw new common_1.NotFoundException('Produit introuvable');
        return produit;
    }
    async creerProduit(tenantId, data) {
        return this.prisma.produit.create({
            data: { ...data, tenantId, categorie: data.categorie ?? 'general' },
        });
    }
    async modifierProduit(tenantId, id, data) {
        const produit = await this.prisma.produit.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!produit)
            throw new common_1.NotFoundException('Produit introuvable');
        return this.prisma.produit.update({ where: { id }, data });
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmService);
//# sourceMappingURL=crm.service.js.map