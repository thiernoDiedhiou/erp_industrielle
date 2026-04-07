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
exports.FacturationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdf_service_1 = require("./pdf.service");
const notifications_service_1 = require("../notifications/notifications.service");
const queue_service_1 = require("../queue/queue.service");
let FacturationService = class FacturationService {
    constructor(prisma, pdfService, notifications, queue) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.notifications = notifications;
        this.queue = queue;
    }
    async getPaiements(tenantId, opts) {
        const { page = 1, limite = 30 } = opts;
        const skip = (page - 1) * limite;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.paiement.findMany({
                where: { facture: { tenantId } },
                skip,
                take: limite,
                orderBy: { datePaiement: 'desc' },
                include: {
                    facture: {
                        select: {
                            reference: true,
                            commande: { select: { client: { select: { nom: true } } } },
                        },
                    },
                },
            }),
            this.prisma.paiement.count({ where: { facture: { tenantId } } }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getFactures(tenantId, opts) {
        const { page = 1, limite = 20, statut } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId, ...(statut ? { statut } : {}) };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.facture.findMany({
                where,
                skip,
                take: limite,
                include: {
                    commande: {
                        select: {
                            reference: true,
                            client: { select: { nom: true, email: true } },
                        },
                    },
                    paiements: { select: { montant: true, datePaiement: true, mode: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.facture.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getFacture(tenantId, id) {
        const facture = await this.prisma.facture.findFirst({
            where: { id, tenantId },
            include: {
                commande: {
                    include: {
                        client: true,
                        lignes: { include: { produit: true } },
                    },
                },
                paiements: true,
            },
        });
        if (!facture)
            throw new common_1.NotFoundException('Facture introuvable');
        return facture;
    }
    async creerDepuisCommande(tenantId, commandeId) {
        const commande = await this.prisma.commande.findFirst({
            where: { id: commandeId, tenantId },
        });
        if (!commande)
            throw new common_1.NotFoundException('Commande introuvable');
        if (commande.statut !== 'livree') {
            throw new common_1.BadRequestException('La commande doit être livrée avant facturation');
        }
        const factureExistante = await this.prisma.facture.findFirst({
            where: { commandeId, tenantId },
        });
        if (factureExistante) {
            throw new common_1.BadRequestException('Une facture existe déjà pour cette commande');
        }
        const reference = await this.genererReference(tenantId);
        const echeance = new Date();
        echeance.setDate(echeance.getDate() + 30);
        return this.prisma.$transaction(async (tx) => {
            const facture = await tx.facture.create({
                data: {
                    reference,
                    tenantId,
                    commandeId,
                    statut: 'emise',
                    totalHT: commande.totalHT,
                    tva: commande.tva,
                    totalTTC: commande.totalTTC,
                    dateEcheance: echeance,
                },
            });
            await tx.commande.update({
                where: { id: commandeId },
                data: { statut: 'facturee' },
            });
            const commandeAvecClient = await tx.commande.findFirst({
                where: { id: commandeId },
                include: { client: true },
            });
            if (commandeAvecClient?.client.email) {
                this.queue.envoyerEmail({
                    to: commandeAvecClient.client.email,
                    subject: `Facture ${reference} — GISAC`,
                    template: 'facture',
                    tenantId,
                    data: {
                        reference,
                        montant: new Intl.NumberFormat('fr-SN').format(Number(commande.totalTTC)),
                        echeance: echeance.toLocaleDateString('fr-SN'),
                        client: commandeAvecClient.client.nom,
                    },
                });
            }
            return facture;
        });
    }
    async enregistrerPaiement(tenantId, factureId, data) {
        const facture = await this.prisma.facture.findFirst({
            where: { id: factureId, tenantId },
            include: { paiements: true },
        });
        if (!facture)
            throw new common_1.NotFoundException('Facture introuvable');
        if (facture.statut === 'payee') {
            throw new common_1.BadRequestException('Facture déjà entièrement payée');
        }
        const totalPaye = facture.paiements.reduce((sum, p) => sum + Number(p.montant), 0);
        const restantDu = Number(facture.totalTTC) - totalPaye;
        if (data.montant > restantDu) {
            throw new common_1.BadRequestException(`Montant (${data.montant}) supérieur au restant dû (${restantDu})`);
        }
        return this.prisma.$transaction(async (tx) => {
            const paiement = await tx.paiement.create({
                data: {
                    factureId,
                    tenantId,
                    montant: data.montant,
                    mode: data.mode,
                    reference: data.reference,
                    notes: data.notes,
                    datePaiement: new Date(),
                },
            });
            const nouveauTotal = totalPaye + data.montant;
            if (nouveauTotal >= Number(facture.totalTTC)) {
                await tx.facture.update({
                    where: { id: factureId },
                    data: { statut: 'payee' },
                });
            }
            else {
                await tx.facture.update({
                    where: { id: factureId },
                    data: { statut: 'partiellement_payee' },
                });
            }
            this.notifications.paiementRecu(tenantId, facture.reference, data.montant);
            this.queue.notifier({
                tenantId,
                type: 'paiement_recu',
                titre: 'Paiement reçu',
                message: `Paiement de ${data.montant} FCFA sur ${facture.reference}`,
                data: { factureId, montant: data.montant, mode: data.mode },
            });
            return paiement;
        });
    }
    async getStats(tenantId) {
        const [chiffreAffaires, impayees, parStatut] = await Promise.all([
            this.prisma.facture.aggregate({
                where: { tenantId, statut: 'payee' },
                _sum: { totalTTC: true },
            }),
            this.prisma.facture.findMany({
                where: { tenantId, statut: { in: ['emise', 'partiellement_payee'] } },
                select: { id: true, reference: true, totalTTC: true, dateEcheance: true },
                orderBy: { dateEcheance: 'asc' },
            }),
            this.prisma.facture.groupBy({
                by: ['statut'],
                where: { tenantId },
                _count: { id: true },
                _sum: { totalTTC: true },
            }),
        ]);
        return {
            chiffreAffaires: chiffreAffaires._sum.totalTTC || 0,
            nombreImpayees: impayees.length,
            montantImpaye: impayees.reduce((sum, f) => sum + Number(f.totalTTC), 0),
            parStatut,
        };
    }
    async genererPdf(tenantId, factureId) {
        const facture = await this.prisma.facture.findFirst({
            where: { id: factureId, tenantId },
            include: {
                commande: {
                    include: {
                        client: true,
                        lignes: { include: { produit: true } },
                    },
                },
            },
        });
        if (!facture)
            throw new common_1.NotFoundException('Facture introuvable');
        const tenant = await this.prisma.tenant.findFirst({ where: { id: tenantId } });
        return this.pdfService.genererFacturePdf({
            reference: facture.reference,
            dateEmission: facture.createdAt,
            dateEcheance: facture.dateEcheance,
            statut: facture.statut,
            notes: facture.commande?.notes,
            client: {
                nom: facture.commande.client.nom,
                adresse: facture.commande.client.adresse,
                ville: facture.commande.client.ville,
                telephone: facture.commande.client.telephone,
                email: facture.commande.client.email,
                ninea: facture.commande.client.ninea,
            },
            tenant: {
                nom: tenant?.nom ?? 'ERP Industriel',
                adresse: tenant?.adresse,
                ville: tenant?.ville,
                telephone: tenant?.telephone,
            },
            lignes: facture.commande.lignes.map((l) => ({
                designation: l.produit.nom,
                quantite: Number(l.quantite),
                prixUnitaire: Number(l.prixUnitaire),
                montant: Number(l.montant),
            })),
            totalHT: Number(facture.totalHT),
            tva: Number(facture.tva),
            totalTTC: Number(facture.totalTTC),
        });
    }
    async genererReference(tenantId) {
        const annee = new Date().getFullYear();
        const count = await this.prisma.facture.count({
            where: { tenantId, reference: { startsWith: `FAC-${annee}` } },
        });
        return `FAC-${annee}-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.FacturationService = FacturationService;
exports.FacturationService = FacturationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        notifications_service_1.NotificationsService,
        queue_service_1.QueueService])
], FacturationService);
//# sourceMappingURL=facturation.service.js.map