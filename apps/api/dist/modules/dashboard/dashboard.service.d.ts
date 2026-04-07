import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getKpis(tenantId: string): Promise<{
        commandesMois: number;
        commandesParStatut: Record<string, number>;
        chiffreAffairesMois: number | import(".prisma/client/runtime/library").Decimal;
        ofsActifs: number;
        alertesStock: number;
        clientsTotal: number;
        recyclageCollectesMois: number;
    }>;
    getActiviteRecente(tenantId: string, limite?: number): Promise<{
        commandes: {
            client: {
                nom: string;
            };
            id: string;
            reference: string;
            updatedAt: Date;
            statut: string;
        }[];
        ordresFabrication: {
            id: string;
            reference: string;
            updatedAt: Date;
            statut: string;
            produitFini: string;
        }[];
    }>;
    getCaMensuel(tenantId: string): Promise<{
        mois: string;
        ca: number;
        nbFactures: number;
    }[]>;
    getStockCritique(tenantId: string): Promise<{
        nom: string;
        stockActuel: number;
        stockMinimum: number;
        unite: string;
        critique: boolean;
    }[]>;
    getCommandesParStatut(tenantId: string): Promise<{
        statut: string;
        count: number;
        couleur: string;
    }[]>;
    getTopClients(tenantId: string): Promise<{
        nom: string;
        ca: number;
    }[]>;
}
