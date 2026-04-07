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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StockService = class StockService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTableauBord(tenantId) {
        const matieres = await this.prisma.matierePremiere.findMany({
            where: { tenantId },
            select: {
                id: true,
                nom: true,
                reference: true,
                stockActuel: true,
                stockMinimum: true,
                unite: true,
                fournisseur: { select: { nom: true } },
            },
            orderBy: { nom: 'asc' },
        });
        const alertes = matieres.filter((m) => {
            const actuel = Number(m.stockActuel);
            const minimum = Number(m.stockMinimum ?? 0);
            return actuel <= minimum;
        });
        return { matieres, alertes };
    }
    async getMouvements(tenantId, opts) {
        const { page = 1, limite = 30, type, matiereId } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            ...(type ? { type } : {}),
            ...(matiereId ? { matierePremiereId: matiereId } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.mouvementStock.findMany({
                where,
                skip,
                take: limite,
                include: {
                    matierePremiere: { select: { nom: true, unite: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.mouvementStock.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async entreeStock(tenantId, data) {
        const mp = await this.prisma.matierePremiere.findFirst({
            where: { id: data.matierePremiereId, tenantId },
        });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        return this.prisma.$transaction(async (tx) => {
            await tx.matierePremiere.update({
                where: { id: data.matierePremiereId },
                data: { stockActuel: { increment: data.quantite } },
            });
            return tx.mouvementStock.create({
                data: {
                    tenantId,
                    type: 'entree',
                    reference: data.reference || `ENT-${Date.now()}`,
                    matierePremiereId: data.matierePremiereId,
                    quantite: data.quantite,
                    motif: data.motif || 'Réception fournisseur',
                    fournisseurId: data.fournisseurId,
                },
            });
        });
    }
    async ajustementInventaire(tenantId, matiereId, stockReel, motif) {
        const mp = await this.prisma.matierePremiere.findFirst({
            where: { id: matiereId, tenantId },
        });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        const difference = stockReel - Number(mp.stockActuel);
        const type = difference >= 0 ? 'ajustement_positif' : 'ajustement_negatif';
        return this.prisma.$transaction(async (tx) => {
            await tx.matierePremiere.update({
                where: { id: matiereId },
                data: { stockActuel: stockReel },
            });
            return tx.mouvementStock.create({
                data: {
                    tenantId,
                    type,
                    reference: `INV-${Date.now()}`,
                    matierePremiereId: matiereId,
                    quantite: Math.abs(difference),
                    motif,
                },
            });
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockService);
//# sourceMappingURL=stock.service.js.map