import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEngineService } from '../config-engine/config-engine.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
export declare class CommandesService {
    private prisma;
    private configEngine;
    private notifications;
    constructor(prisma: PrismaService, configEngine: ConfigEngineService, notifications: NotificationsService);
    getCommandes(tenantId: string, opts: {
        page?: number;
        limite?: number;
        statut?: string;
        clientId?: string;
    }): Promise<{
        items: ({
            client: {
                id: string;
                nom: string;
            };
            lignes: ({
                produit: {
                    reference: string;
                    nom: string;
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getCommande(tenantId: string, id: string): Promise<{
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
        historique: {
            id: string;
            tenantId: string;
            userId: string;
            createdAt: Date;
            ancienStatut: string | null;
            nouveauStatut: string;
            commandeId: string;
            commentaire: string | null;
        }[];
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
    }>;
    creerCommande(tenantId: string, userId: string, dto: CreateCommandeDto): Promise<{
        client: {
            nom: string;
        };
        lignes: ({
            produit: {
                nom: string;
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
    }>;
    changerStatut(tenantId: string, id: string, userId: string, role: string, nouveauStatut: string, commentaire?: string): Promise<{
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
    }>;
    supprimerCommande(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    private genererReference;
}
