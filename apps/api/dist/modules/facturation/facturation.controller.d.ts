import { Response } from 'express';
import { FacturationService } from './facturation.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class FacturationController {
    private facturationService;
    constructor(facturationService: FacturationService);
    getPaiements(user: JwtPayload, page?: number, limite?: number): Promise<{
        items: ({
            facture: {
                reference: string;
                commande: {
                    client: {
                        nom: string;
                    };
                };
            };
        } & {
            id: string;
            factureId: string;
            tenantId: string;
            montant: import(".prisma/client/runtime/library").Decimal;
            mode: string;
            reference: string | null;
            notes: string | null;
            datePaiement: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFactures(user: JwtPayload, page?: number, limite?: number, statut?: string): Promise<{
        items: ({
            commande: {
                reference: string;
                client: {
                    nom: string;
                    email: string | null;
                };
            };
            paiements: {
                montant: import(".prisma/client/runtime/library").Decimal;
                mode: string;
                datePaiement: Date;
            }[];
        } & {
            id: string;
            tenantId: string;
            reference: string;
            commandeId: string;
            statut: string;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            tva: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
            dateEcheance: Date;
            pdfUrl: string | null;
            createdAt: Date;
            deletedAt: Date | null;
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
                reference: string;
                statut: string;
                createdAt: Date;
                deletedAt: Date | null;
                commercialId: string | null;
                updatedAt: Date;
                nom: string;
                type: string;
                ninea: string | null;
                adresse: string | null;
                ville: string | null;
                telephone: string | null;
                email: string | null;
                contact: string | null;
                plafondCredit: import(".prisma/client/runtime/library").Decimal | null;
                delaiPaiement: number | null;
            };
            lignes: ({
                produit: {
                    id: string;
                    tenantId: string;
                    reference: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    updatedAt: Date;
                    nom: string;
                    prixUnitaire: import(".prisma/client/runtime/library").Decimal;
                    description: string | null;
                    categorie: string;
                    unite: string;
                    coutProduction: import(".prisma/client/runtime/library").Decimal | null;
                    poidsUnite: import(".prisma/client/runtime/library").Decimal | null;
                    stockMin: import(".prisma/client/runtime/library").Decimal;
                    stockActuel: import(".prisma/client/runtime/library").Decimal;
                    actif: boolean;
                };
            } & {
                id: string;
                montant: import(".prisma/client/runtime/library").Decimal;
                commandeId: string;
                produitId: string;
                quantite: import(".prisma/client/runtime/library").Decimal;
                prixUnitaire: import(".prisma/client/runtime/library").Decimal;
                remise: import(".prisma/client/runtime/library").Decimal;
                description: string | null;
            })[];
        } & {
            id: string;
            tenantId: string;
            reference: string;
            notes: string | null;
            statut: string;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            tva: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
            createdAt: Date;
            deletedAt: Date | null;
            clientId: string;
            dateLivraison: Date | null;
            dateLivraisonPrevue: Date | null;
            adresseLivraison: string | null;
            commercialId: string | null;
            updatedAt: Date;
        };
        paiements: {
            id: string;
            factureId: string;
            tenantId: string;
            montant: import(".prisma/client/runtime/library").Decimal;
            mode: string;
            reference: string | null;
            notes: string | null;
            datePaiement: Date;
        }[];
    } & {
        id: string;
        tenantId: string;
        reference: string;
        commandeId: string;
        statut: string;
        totalHT: import(".prisma/client/runtime/library").Decimal;
        tva: import(".prisma/client/runtime/library").Decimal;
        totalTTC: import(".prisma/client/runtime/library").Decimal;
        dateEcheance: Date;
        pdfUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    creerDepuisCommande(user: JwtPayload, commandeId: string): Promise<{
        id: string;
        tenantId: string;
        reference: string;
        commandeId: string;
        statut: string;
        totalHT: import(".prisma/client/runtime/library").Decimal;
        tva: import(".prisma/client/runtime/library").Decimal;
        totalTTC: import(".prisma/client/runtime/library").Decimal;
        dateEcheance: Date;
        pdfUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    getPdf(user: JwtPayload, id: string, res: Response): Promise<void>;
    enregistrerPaiement(user: JwtPayload, id: string, body: {
        montant: number;
        mode: string;
        reference?: string;
        notes?: string;
    }): Promise<{
        id: string;
        factureId: string;
        tenantId: string;
        montant: import(".prisma/client/runtime/library").Decimal;
        mode: string;
        reference: string | null;
        notes: string | null;
        datePaiement: Date;
    }>;
}
