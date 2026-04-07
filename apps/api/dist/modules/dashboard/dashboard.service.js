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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpis(tenantId) {
        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);
        const [commandesMois, commandesParStatut, chiffreAffairesMois, ofsActifs, alertesStock, clientsTotal, recyclageTotal,] = await Promise.all([
            this.prisma.commande.count({
                where: { tenantId, createdAt: { gte: debutMois } },
            }),
            this.prisma.commande.groupBy({
                by: ['statut'],
                where: { tenantId },
                _count: { id: true },
            }),
            this.prisma.facture.aggregate({
                where: { tenantId, statut: 'payee', createdAt: { gte: debutMois } },
                _sum: { totalTTC: true },
            }),
            this.prisma.ordreFabrication.count({
                where: { tenantId, statut: 'en_cours' },
            }),
            this.prisma.matierePremiere.count({
                where: {
                    tenantId,
                    stockActuel: { lte: 0 },
                },
            }),
            this.prisma.client.count({ where: { tenantId } }),
            this.prisma.recyclageCollecte.count({
                where: { tenantId, dateCollecte: { gte: debutMois } },
            }),
        ]);
        return {
            commandesMois,
            commandesParStatut: commandesParStatut.reduce((acc, g) => ({ ...acc, [g.statut]: g._count.id }), {}),
            chiffreAffairesMois: chiffreAffairesMois._sum.totalTTC || 0,
            ofsActifs,
            alertesStock,
            clientsTotal,
            recyclageCollectesMois: recyclageTotal,
        };
    }
    async getActiviteRecente(tenantId, limite = 10) {
        const [dernieresCommandes, derniersOfs] = await Promise.all([
            this.prisma.commande.findMany({
                where: { tenantId },
                take: Math.ceil(limite / 2),
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    reference: true,
                    statut: true,
                    updatedAt: true,
                    client: { select: { nom: true } },
                },
            }),
            this.prisma.ordreFabrication.findMany({
                where: { tenantId },
                take: Math.floor(limite / 2),
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    reference: true,
                    statut: true,
                    produitFini: true,
                    updatedAt: true,
                },
            }),
        ]);
        return {
            commandes: dernieresCommandes,
            ordresFabrication: derniersOfs,
        };
    }
    async getCaMensuel(tenantId) {
        const mois = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const agg = await this.prisma.facture.aggregate({
                where: {
                    tenantId,
                    statut: 'payee',
                    createdAt: { gte: debut, lte: fin },
                },
                _sum: { totalTTC: true },
                _count: { id: true },
            });
            mois.push({
                mois: debut.toLocaleDateString('fr-SN', { month: 'short', year: '2-digit' }),
                ca: Number(agg._sum.totalTTC ?? 0),
                nbFactures: agg._count.id,
            });
        }
        return mois;
    }
    async getStockCritique(tenantId) {
        const matieres = await this.prisma.matierePremiere.findMany({
            where: { tenantId },
            select: {
                id: true,
                nom: true,
                stockActuel: true,
                stockMinimum: true,
                unite: true,
            },
            orderBy: { stockActuel: 'asc' },
            take: 10,
        });
        return matieres.map((m) => ({
            nom: m.nom.length > 15 ? m.nom.substring(0, 15) + '…' : m.nom,
            stockActuel: Number(m.stockActuel),
            stockMinimum: Number(m.stockMinimum),
            unite: m.unite,
            critique: Number(m.stockActuel) <= Number(m.stockMinimum),
        }));
    }
    async getCommandesParStatut(tenantId) {
        const groupes = await this.prisma.commande.groupBy({
            by: ['statut'],
            where: { tenantId },
            _count: { id: true },
        });
        const COULEURS = {
            brouillon: '#94a3b8',
            confirmee: '#3b82f6',
            en_production: '#f59e0b',
            livree: '#10b981',
            facturee: '#8b5cf6',
            annulee: '#ef4444',
        };
        return groupes.map((g) => ({
            statut: g.statut,
            count: g._count.id,
            couleur: COULEURS[g.statut] ?? '#6b7280',
        }));
    }
    async getTopClients(tenantId) {
        const commandes = await this.prisma.commande.groupBy({
            by: ['clientId'],
            where: { tenantId, statut: { notIn: ['annulee', 'brouillon'] } },
            _sum: { totalTTC: true },
            orderBy: { _sum: { totalTTC: 'desc' } },
            take: 5,
        });
        const clientIds = commandes.map((c) => c.clientId);
        const clients = await this.prisma.client.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, nom: true },
        });
        const nomMap = Object.fromEntries(clients.map((c) => [c.id, c.nom]));
        return commandes.map((c) => ({
            nom: (nomMap[c.clientId] ?? 'Inconnu').substring(0, 18),
            ca: Number(c._sum.totalTTC ?? 0),
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map