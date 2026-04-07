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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductionService = class ProductionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOFs(tenantId, opts) {
        const { page = 1, limite = 20, statut } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId, ...(statut ? { statut } : {}) };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.ordreFabrication.findMany({
                where,
                skip,
                take: limite,
                include: {
                    machine: { select: { nom: true, code: true } },
                    consommations: {
                        include: { matierePremiere: { select: { nom: true, unite: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.ordreFabrication.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getOF(tenantId, id) {
        const of = await this.prisma.ordreFabrication.findFirst({
            where: { id, tenantId },
            include: {
                machine: true,
                consommations: {
                    include: { matierePremiere: true },
                },
            },
        });
        if (!of)
            throw new common_1.NotFoundException('Ordre de fabrication introuvable');
        return of;
    }
    async creerOF(tenantId, userId, data) {
        const reference = await this.genererReferenceOF(tenantId);
        return this.prisma.ordreFabrication.create({
            data: {
                reference,
                tenantId,
                statut: 'planifie',
                produitId: data.produitId,
                produitFini: data.produitFini,
                quantitePrevue: data.quantitePrevue,
                ...(data.commandeId ? { commandeId: data.commandeId } : {}),
                ...(data.machineId ? { machineId: data.machineId } : {}),
                ...(data.notes ? { notes: data.notes } : {}),
                dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
                dateFin: data.dateFin ? new Date(data.dateFin) : null,
            },
        });
    }
    async changerStatutOF(tenantId, id, statut) {
        const of = await this.prisma.ordreFabrication.findFirst({ where: { id, tenantId } });
        if (!of)
            throw new common_1.NotFoundException('OF introuvable');
        const transitionsValides = {
            planifie: ['en_cours', 'annule'],
            en_cours: ['termine', 'en_pause'],
            en_pause: ['en_cours', 'annule'],
        };
        if (!transitionsValides[of.statut]?.includes(statut)) {
            throw new common_1.BadRequestException(`Transition "${of.statut}" → "${statut}" invalide`);
        }
        const data = { statut };
        if (statut === 'en_cours' && !of.dateDebut) {
            data.dateDebut = new Date();
        }
        if (statut === 'termine') {
            data.dateFin = new Date();
        }
        return this.prisma.ordreFabrication.update({ where: { id }, data });
    }
    async enregistrerConsommation(tenantId, ofId, data) {
        const of = await this.prisma.ordreFabrication.findFirst({ where: { id: ofId, tenantId } });
        if (!of)
            throw new common_1.NotFoundException('OF introuvable');
        const mp = await this.prisma.matierePremiere.findFirst({
            where: { id: data.matierePremiereId, tenantId },
        });
        if (!mp)
            throw new common_1.NotFoundException('Matière première introuvable');
        if (Number(mp.stockActuel) < data.quantiteConsommee) {
            throw new common_1.BadRequestException(`Stock insuffisant : ${mp.stockActuel} ${mp.unite} disponible, ${data.quantiteConsommee} demandé`);
        }
        return this.prisma.$transaction(async (tx) => {
            const consommation = await tx.consommationMP.create({
                data: {
                    ordreFabricationId: ofId,
                    matierePremiereId: data.matierePremiereId,
                    tenantId,
                    quantiteConsommee: data.quantiteConsommee,
                },
            });
            await tx.matierePremiere.update({
                where: { id: data.matierePremiereId },
                data: { stockActuel: { decrement: data.quantiteConsommee } },
            });
            await tx.mouvementStock.create({
                data: {
                    tenantId,
                    type: 'sortie',
                    reference: `OF-${of.reference}`,
                    matierePremiereId: data.matierePremiereId,
                    quantite: data.quantiteConsommee,
                    motif: `Consommation OF ${of.reference}`,
                },
            });
            return consommation;
        });
    }
    async getMachines(tenantId) {
        return this.prisma.machine.findMany({
            where: { tenantId },
            orderBy: { nom: 'asc' },
        });
    }
    async creerMachine(tenantId, data) {
        return this.prisma.machine.create({
            data: {
                code: data.code,
                nom: data.nom,
                type: data.type ?? 'autre',
                tenantId,
                statut: 'disponible',
                ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
                ...(data.unite ? { unite: data.unite } : {}),
            },
        });
    }
    async getMatieresPrmieres(tenantId, opts) {
        const { page = 1, limite = 20 } = opts;
        const skip = (page - 1) * limite;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.matierePremiere.findMany({
                where: { tenantId },
                skip,
                take: limite,
                include: { fournisseur: { select: { nom: true } } },
                orderBy: { nom: 'asc' },
            }),
            this.prisma.matierePremiere.count({ where: { tenantId } }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async genererReferenceOF(tenantId) {
        const annee = new Date().getFullYear();
        const count = await this.prisma.ordreFabrication.count({
            where: { tenantId, reference: { startsWith: `OF-${annee}` } },
        });
        return `OF-${annee}-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map