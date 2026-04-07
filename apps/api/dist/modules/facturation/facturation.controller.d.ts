import { Response } from 'express';
import { FacturationService } from './facturation.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class FacturationController {
    private facturationService;
    constructor(facturationService: FacturationService);
    getPaiements(user: JwtPayload, page?: number, limite?: number): Promise<{
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
    getFactures(user: JwtPayload, page?: number, limite?: number, statut?: string): Promise<{
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
    getStats(user: JwtPayload): Promise<{
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
    getFacture(user: JwtPayload, id: string): Promise<{
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
    creerDepuisCommande(user: JwtPayload, commandeId: string): Promise<{
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
    getPdf(user: JwtPayload, id: string, res: Response): Promise<void>;
    enregistrerPaiement(user: JwtPayload, id: string, body: {
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
}
