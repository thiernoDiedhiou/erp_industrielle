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
exports.LogistiqueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LogistiqueService = class LogistiqueService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search, statut } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId };
        if (statut)
            where.statut = statut;
        if (search) {
            where.OR = [
                { reference: { contains: search, mode: 'insensitive' } },
                { client: { nom: { contains: search, mode: 'insensitive' } } },
                { transporteur: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bonLivraison.findMany({
                where,
                skip,
                take: limite,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: { select: { id: true, nom: true, ville: true } },
                    commande: { select: { id: true, reference: true } },
                    _count: { select: { lignes: true } },
                },
            }),
            this.prisma.bonLivraison.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUn(tenantId, id) {
        const bl = await this.prisma.bonLivraison.findFirst({
            where: { id, tenantId },
            include: {
                client: true,
                commande: { select: { id: true, reference: true } },
                lignes: {
                    include: {
                        produit: { select: { id: true, nom: true, reference: true, unite: true } },
                    },
                },
            },
        });
        if (!bl)
            throw new common_1.NotFoundException('Bon de livraison introuvable');
        return bl;
    }
    async creer(tenantId, dto) {
        const reference = `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        return this.prisma.$transaction(async (tx) => {
            const bl = await tx.bonLivraison.create({
                data: {
                    tenantId,
                    reference,
                    clientId: dto.clientId,
                    commandeId: dto.commandeId,
                    adresseLivraison: dto.adresseLivraison,
                    transporteur: dto.transporteur,
                    chauffeur: dto.chauffeur,
                    vehicule: dto.vehicule,
                    dateExpedition: dto.dateExpedition ? new Date(dto.dateExpedition) : null,
                    notes: dto.notes,
                    statut: 'prepare',
                },
            });
            if (dto.lignes && dto.lignes.length > 0) {
                await tx.ligneLivraison.createMany({
                    data: dto.lignes.map((l) => ({
                        bonLivraisonId: bl.id,
                        produitId: l.produitId,
                        quantite: l.quantite,
                        description: l.description,
                    })),
                });
            }
            return bl;
        });
    }
    async changerStatut(tenantId, id, statut) {
        const bl = await this.prisma.bonLivraison.findFirst({ where: { id, tenantId } });
        if (!bl)
            throw new common_1.NotFoundException('Bon de livraison introuvable');
        const transitions = {
            prepare: ['expedie', 'annule'],
            expedie: ['livre', 'annule'],
            livre: [],
            annule: [],
        };
        if (!transitions[bl.statut]?.includes(statut)) {
            throw new common_1.BadRequestException(`Transition ${bl.statut} → ${statut} non autorisée`);
        }
        const data = { statut };
        if (statut === 'expedie')
            data.dateExpedition = new Date();
        if (statut === 'livre')
            data.dateLivraison = new Date();
        return this.prisma.bonLivraison.update({ where: { id }, data });
    }
    async modifier(tenantId, id, dto) {
        const bl = await this.prisma.bonLivraison.findFirst({ where: { id, tenantId } });
        if (!bl)
            throw new common_1.NotFoundException('Bon de livraison introuvable');
        if (bl.statut === 'livre' || bl.statut === 'annule') {
            throw new common_1.BadRequestException('Impossible de modifier un BL livré ou annulé');
        }
        const { lignes, ...data } = dto;
        return this.prisma.bonLivraison.update({ where: { id }, data });
    }
    async getStats(tenantId) {
        const [prepare, expedie, livre, annule] = await this.prisma.$transaction([
            this.prisma.bonLivraison.count({ where: { tenantId, statut: 'prepare' } }),
            this.prisma.bonLivraison.count({ where: { tenantId, statut: 'expedie' } }),
            this.prisma.bonLivraison.count({ where: { tenantId, statut: 'livre' } }),
            this.prisma.bonLivraison.count({ where: { tenantId, statut: 'annule' } }),
        ]);
        return { prepare, expedie, livre, annule };
    }
};
exports.LogistiqueService = LogistiqueService;
exports.LogistiqueService = LogistiqueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogistiqueService);
//# sourceMappingURL=logistique.service.js.map