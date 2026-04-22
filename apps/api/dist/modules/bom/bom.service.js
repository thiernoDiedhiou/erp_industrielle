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
exports.BomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BomService = class BomService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search, actif } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId };
        if (actif !== undefined)
            where.actif = actif;
        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { version: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bom.findMany({
                where,
                skip,
                take: limite,
                orderBy: { createdAt: 'desc' },
                include: {
                    produitFini: { select: { id: true, nom: true, reference: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.bom.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUn(tenantId, id) {
        const bom = await this.prisma.bom.findFirst({
            where: { id, tenantId },
            include: {
                produitFini: { select: { id: true, nom: true, reference: true } },
                items: {
                    include: {
                        matierePremiere: { select: { id: true, nom: true, reference: true, unite: true, prixAchat: true } },
                        produit: { select: { id: true, nom: true, reference: true, unite: true } },
                    },
                },
            },
        });
        if (!bom)
            throw new common_1.NotFoundException('Nomenclature introuvable');
        return bom;
    }
    async creer(tenantId, dto) {
        const existe = await this.prisma.bom.findFirst({
            where: {
                tenantId,
                produitFiniId: dto.produitFiniId,
                version: dto.version ?? '1.0',
            },
        });
        if (existe) {
            throw new common_1.ConflictException(`Une nomenclature version ${dto.version ?? '1.0'} existe déjà pour ce produit`);
        }
        const { items, ...bomData } = dto;
        return this.prisma.$transaction(async (tx) => {
            const bom = await tx.bom.create({
                data: {
                    tenantId,
                    nom: bomData.nom,
                    produitFiniId: bomData.produitFiniId,
                    version: bomData.version ?? '1.0',
                    actif: bomData.actif ?? true,
                    notes: bomData.notes,
                },
            });
            if (items && items.length > 0) {
                await tx.bomItem.createMany({
                    data: items.map((item) => ({
                        bomId: bom.id,
                        matierePremiereId: item.matierePremiereId,
                        produitId: item.produitId,
                        quantite: item.quantite,
                        unite: item.unite ?? 'kg',
                        pertes: item.pertes ?? 0,
                        notes: item.notes,
                    })),
                });
            }
            return this.getUn(tenantId, bom.id);
        });
    }
    async modifier(tenantId, id, dto) {
        const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
        if (!bom)
            throw new common_1.NotFoundException('Nomenclature introuvable');
        const { items, ...bomData } = dto;
        return this.prisma.$transaction(async (tx) => {
            await tx.bom.update({
                where: { id },
                data: {
                    ...(bomData.nom ? { nom: bomData.nom } : {}),
                    ...(bomData.version ? { version: bomData.version } : {}),
                    ...(bomData.actif !== undefined ? { actif: bomData.actif } : {}),
                    ...(bomData.notes !== undefined ? { notes: bomData.notes } : {}),
                },
            });
            if (items !== undefined) {
                await tx.bomItem.deleteMany({ where: { bomId: id } });
                if (items.length > 0) {
                    await tx.bomItem.createMany({
                        data: items.map((item) => ({
                            bomId: id,
                            matierePremiereId: item.matierePremiereId,
                            produitId: item.produitId,
                            quantite: item.quantite,
                            unite: item.unite ?? 'kg',
                            pertes: item.pertes ?? 0,
                            notes: item.notes,
                        })),
                    });
                }
            }
            return this.getUn(tenantId, id);
        });
    }
    async toggleActif(tenantId, id) {
        const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
        if (!bom)
            throw new common_1.NotFoundException('Nomenclature introuvable');
        return this.prisma.bom.update({
            where: { id },
            data: { actif: !bom.actif },
        });
    }
    async supprimer(tenantId, id) {
        const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
        if (!bom)
            throw new common_1.NotFoundException('Nomenclature introuvable');
        await this.prisma.bom.delete({ where: { id } });
        return { message: 'Nomenclature supprimée' };
    }
    async calculerCout(tenantId, bomId, quantite) {
        const bom = await this.getUn(tenantId, bomId);
        let coutUnitaire = 0;
        const details = [];
        for (const item of bom.items) {
            const qteAvecPertes = Number(item.quantite) * (1 + Number(item.pertes) / 100);
            const prixUnit = item.matierePremiere?.prixAchat
                ? Number(item.matierePremiere.prixAchat)
                : 0;
            const sousTotal = qteAvecPertes * prixUnit;
            coutUnitaire += sousTotal;
            details.push({
                nom: item.matierePremiere?.nom ?? item.produit?.nom ?? 'Inconnu',
                quantite: qteAvecPertes,
                prixUnit,
                sousTotal,
            });
        }
        return {
            bom: { id: bom.id, nom: bom.nom, version: bom.version },
            quantite,
            coutUnitaire,
            coutTotal: coutUnitaire * quantite,
            details,
        };
    }
};
exports.BomService = BomService;
exports.BomService = BomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BomService);
//# sourceMappingURL=bom.service.js.map