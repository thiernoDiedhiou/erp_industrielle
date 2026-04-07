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
exports.MatieresPremiereService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let MatieresPremiereService = class MatieresPremiereService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search, critique } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId, deletedAt: null };
        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.matierePremiere.findMany({
                where,
                skip,
                take: limite,
                orderBy: { nom: 'asc' },
                include: {
                    fournisseur: { select: { id: true, nom: true, reference: true } },
                },
            }),
            this.prisma.matierePremiere.count({ where }),
        ]);
        const itemsAvecAlerte = items.map((mp) => ({
            ...mp,
            critique: Number(mp.stockActuel) <= Number(mp.stockMinimum),
        }));
        const itemsFiltres = critique
            ? itemsAvecAlerte.filter((mp) => mp.critique)
            : itemsAvecAlerte;
        return { items: itemsFiltres, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUne(tenantId, id) {
        const mp = await this.prisma.matierePremiere.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                fournisseur: true,
                mouvements: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, type: true, quantite: true, motif: true, createdAt: true },
                },
            },
        });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        return { ...mp, critique: Number(mp.stockActuel) <= Number(mp.stockMinimum) };
    }
    async creer(tenantId, dto) {
        const existe = await this.prisma.matierePremiere.findFirst({
            where: { tenantId, reference: dto.reference, deletedAt: null },
        });
        if (existe)
            throw new common_1.BadRequestException(`Référence "${dto.reference}" déjà utilisée`);
        return this.prisma.matierePremiere.create({
            data: { ...dto, tenantId, stockActuel: 0 },
        });
    }
    async modifier(tenantId, id, dto) {
        const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        return this.prisma.matierePremiere.update({ where: { id }, data: dto });
    }
    async ajusterStock(tenantId, id, quantite, type, motif) {
        const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        const stockActuel = Number(mp.stockActuel);
        let nouveauStock;
        if (type === 'entree') {
            nouveauStock = stockActuel + quantite;
        }
        else if (type === 'sortie') {
            if (stockActuel < quantite) {
                throw new common_1.BadRequestException(`Stock insuffisant : ${stockActuel} ${mp.unite} disponibles`);
            }
            nouveauStock = stockActuel - quantite;
        }
        else {
            nouveauStock = quantite;
        }
        const [mpMiseAJour] = await this.prisma.$transaction([
            this.prisma.matierePremiere.update({
                where: { id },
                data: { stockActuel: nouveauStock },
            }),
            this.prisma.mouvementStock.create({
                data: {
                    tenantId,
                    type,
                    reference: `MVT-${Date.now()}`,
                    matierePremiereId: id,
                    quantite,
                    motif: motif ?? type,
                },
            }),
        ]);
        if (nouveauStock <= Number(mp.stockMinimum)) {
            this.queue.alerterStock({
                tenantId,
                matiereId: id,
                matierenom: mp.nom,
                stockActuel: nouveauStock,
                stockMinimum: Number(mp.stockMinimum),
                unite: mp.unite,
            });
        }
        return mpMiseAJour;
    }
    async supprimer(tenantId, id) {
        const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        if (Number(mp.stockActuel) > 0) {
            throw new common_1.BadRequestException("Impossible : stock actuel > 0. Ajuster d'abord le stock.");
        }
        await this.prisma.matierePremiere.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Matière première archivée' };
    }
};
exports.MatieresPremiereService = MatieresPremiereService;
exports.MatieresPremiereService = MatieresPremiereService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], MatieresPremiereService);
//# sourceMappingURL=matieres-premieres.service.js.map