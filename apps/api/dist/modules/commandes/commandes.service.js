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
exports.CommandesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_engine_service_1 = require("../config-engine/config-engine.service");
const notifications_service_1 = require("../notifications/notifications.service");
let CommandesService = class CommandesService {
    constructor(prisma, configEngine, notifications) {
        this.prisma = prisma;
        this.configEngine = configEngine;
        this.notifications = notifications;
    }
    async getCommandes(tenantId, opts) {
        const { page = 1, limite = 20, statut, clientId } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            ...(statut ? { statut } : {}),
            ...(clientId ? { clientId } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.commande.findMany({
                where,
                skip,
                take: limite,
                include: {
                    client: { select: { id: true, nom: true } },
                    lignes: { include: { produit: { select: { nom: true, reference: true } } } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.commande.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getCommande(tenantId, id) {
        const commande = await this.prisma.commande.findFirst({
            where: { id, tenantId },
            include: {
                client: true,
                lignes: { include: { produit: true } },
                historique: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!commande)
            throw new common_1.NotFoundException('Commande introuvable');
        return commande;
    }
    async creerCommande(tenantId, userId, dto) {
        const client = await this.prisma.client.findFirst({
            where: { id: dto.clientId, tenantId },
        });
        if (!client)
            throw new common_1.NotFoundException('Client introuvable');
        let totalHT = 0;
        const lignesData = [];
        for (const ligne of dto.lignes) {
            const produit = await this.prisma.produit.findFirst({
                where: { id: ligne.produitId, tenantId },
            });
            if (!produit)
                throw new common_1.NotFoundException(`Produit ${ligne.produitId} introuvable`);
            const montantLigne = ligne.quantite * ligne.prixUnitaire;
            totalHT += montantLigne;
            lignesData.push({
                produitId: ligne.produitId,
                quantite: ligne.quantite,
                prixUnitaire: ligne.prixUnitaire,
                montant: montantLigne,
                description: ligne.description,
            });
        }
        const tva = totalHT * 0.18;
        const totalTTC = totalHT + tva;
        const reference = await this.genererReference(tenantId);
        return this.prisma.$transaction(async (tx) => {
            const commande = await tx.commande.create({
                data: {
                    reference,
                    tenantId,
                    clientId: dto.clientId,
                    statut: 'brouillon',
                    dateLivraison: dto.dateLivraison ? new Date(dto.dateLivraison) : null,
                    notes: dto.notes,
                    totalHT,
                    tva,
                    totalTTC,
                    lignes: { create: lignesData },
                },
                include: {
                    client: { select: { nom: true } },
                    lignes: { include: { produit: { select: { nom: true } } } },
                },
            });
            await tx.commandeHistorique.create({
                data: {
                    commandeId: commande.id,
                    tenantId,
                    userId,
                    ancienStatut: null,
                    nouveauStatut: 'brouillon',
                    commentaire: 'Commande créée',
                },
            });
            return commande;
        });
    }
    async changerStatut(tenantId, id, userId, role, nouveauStatut, commentaire) {
        const commande = await this.prisma.commande.findFirst({
            where: { id, tenantId },
        });
        if (!commande)
            throw new common_1.NotFoundException('Commande introuvable');
        const transitionAutorisee = await this.configEngine.verifierTransition(tenantId, 'commande', commande.statut, nouveauStatut, role);
        if (!transitionAutorisee) {
            throw new common_1.ForbiddenException(`Transition "${commande.statut}" → "${nouveauStatut}" non autorisée pour le rôle ${role}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.commande.update({
                where: { id },
                data: { statut: nouveauStatut },
            });
            await tx.commandeHistorique.create({
                data: {
                    commandeId: id,
                    tenantId,
                    userId,
                    ancienStatut: commande.statut,
                    nouveauStatut,
                    commentaire: commentaire || `Statut changé vers ${nouveauStatut}`,
                },
            });
            this.notifications.statutCommande(tenantId, commande.reference, commande.statut, nouveauStatut);
            return updated;
        });
    }
    async supprimerCommande(tenantId, id) {
        const commande = await this.prisma.commande.findFirst({
            where: { id, tenantId },
        });
        if (!commande)
            throw new common_1.NotFoundException('Commande introuvable');
        if (commande.statut !== 'brouillon') {
            throw new common_1.BadRequestException('Seules les commandes en brouillon peuvent être supprimées');
        }
        await this.prisma.$transaction([
            this.prisma.ligneCommande.deleteMany({ where: { commandeId: id } }),
            this.prisma.commandeHistorique.deleteMany({ where: { commandeId: id } }),
            this.prisma.commande.delete({ where: { id } }),
        ]);
        return { message: 'Commande supprimée' };
    }
    async genererReference(tenantId) {
        const annee = new Date().getFullYear();
        const count = await this.prisma.commande.count({
            where: { tenantId, reference: { startsWith: `CMD-${annee}` } },
        });
        const seq = String(count + 1).padStart(4, '0');
        return `CMD-${annee}-${seq}`;
    }
};
exports.CommandesService = CommandesService;
exports.CommandesService = CommandesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_engine_service_1.ConfigEngineService,
        notifications_service_1.NotificationsService])
], CommandesService);
//# sourceMappingURL=commandes.service.js.map