import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';
export declare class FacturationService {
    private prisma;
    private pdfService;
    private notifications;
    private queue;
    constructor(prisma: PrismaService, pdfService: PdfService, notifications: NotificationsService, queue: QueueService);
    getPaiements(tenantId: string, opts: {
        page?: number;
        limite?: number;
    }): Promise<{
        items: ({
            facture: {
                commande: {
                    client: {
                        nom: string;
                    };
                };
                reference: string;
            };
        } & {
            id: string;
            tenantId: string;
            reference: string | null;
            montant: import(".prisma/client/runtime/library").Decimal;
            notes: string | null;
            factureId: string;
            mode: string;
            datePaiement: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFactures(tenantId: string, opts: {
        page?: number;
        limite?: number;
        statut?: string;
    }): Promise<{
        items: ({
            commande: {
                client: {
                    nom: string;
                    email: string | null;
                };
                reference: string;
            };
            paiements: {
                montant: import(".prisma/client/runtime/library").Decimal;
                mode: string;
                datePaiement: Date;
            }[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            deletedAt: Date | null;
            statut: string;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            tva: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
            commandeId: string;
            dateEcheance: Date;
            pdfUrl: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFacture(tenantId: string, id: string): Promise<{
        commande: {
            client: {
                id: string;
                tenantId: string;
                createdAt: Date;
                type: string;
                reference: string;
                nom: string;
                email: string | null;
                telephone: string | null;
                adresse: string | null;
                ville: string | null;
                updatedAt: Date;
                deletedAt: Date | null;
                ninea: string | null;
                statut: string;
            };
            lignes: ({
                produit: {
                    id: string;
                    tenantId: string;
                    createdAt: Date;
                    description: string | null;
                    reference: string;
                    unite: string;
                    nom: string;
                    actif: boolean;
                    deletedAt: Date | null;
                    categorie: string;
                    prixUnitaire: import(".prisma/client/runtime/library").Decimal;
                };
            } & {
                id: string;
                description: string | null;
                montant: import(".prisma/client/runtime/library").Decimal;
                prixUnitaire: import(".prisma/client/runtime/library").Decimal;
                produitId: string;
                quantite: import(".prisma/client/runtime/library").Decimal;
                commandeId: string;
            })[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            updatedAt: Date;
            deletedAt: Date | null;
            statut: string;
            clientId: string;
            dateLivraison: Date | null;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            tva: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
            notes: string | null;
        };
        paiements: {
            id: string;
            tenantId: string;
            reference: string | null;
            montant: import(".prisma/client/runtime/library").Decimal;
            notes: string | null;
            factureId: string;
            mode: string;
            datePaiement: Date;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        deletedAt: Date | null;
        statut: string;
        totalHT: import(".prisma/client/runtime/library").Decimal;
        tva: import(".prisma/client/runtime/library").Decimal;
        totalTTC: import(".prisma/client/runtime/library").Decimal;
        commandeId: string;
        dateEcheance: Date;
        pdfUrl: string | null;
    }>;
    creerDepuisCommande(tenantId: string, commandeId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        deletedAt: Date | null;
        statut: string;
        totalHT: import(".prisma/client/runtime/library").Decimal;
        tva: import(".prisma/client/runtime/library").Decimal;
        totalTTC: import(".prisma/client/runtime/library").Decimal;
        commandeId: string;
        dateEcheance: Date;
        pdfUrl: string | null;
    }>;
    enregistrerPaiement(tenantId: string, factureId: string, data: {
        montant: number;
        mode: string;
        reference?: string;
        notes?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        reference: string | null;
        montant: import(".prisma/client/runtime/library").Decimal;
        notes: string | null;
        factureId: string;
        mode: string;
        datePaiement: Date;
    }>;
    getStats(tenantId: string): Promise<{
        chiffreAffaires: number | import(".prisma/client/runtime/library").Decimal;
        nombreImpayees: number;
        montantImpaye: number;
        parStatut: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.FactureGroupByOutputType, "statut"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                totalTTC: import(".prisma/client/runtime/library").Decimal | null;
            };
        })[];
    }>;
    genererPdf(tenantId: string, factureId: string): Promise<Buffer>;
    private genererReference;
}
