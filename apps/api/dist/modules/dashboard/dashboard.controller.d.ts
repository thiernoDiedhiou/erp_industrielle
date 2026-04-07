import { DashboardService } from './dashboard.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getKpis(user: JwtPayload): Promise<{
        commandesMois: number;
        commandesParStatut: Record<string, number>;
        chiffreAffairesMois: number | import(".prisma/client/runtime/library").Decimal;
        ofsActifs: number;
        alertesStock: number;
        clientsTotal: number;
        recyclageCollectesMois: number;
    }>;
    getActiviteRecente(user: JwtPayload, limite?: number): Promise<{
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
    getCaMensuel(user: JwtPayload): Promise<{
        mois: string;
        ca: number;
        nbFactures: number;
    }[]>;
    getStockCritique(user: JwtPayload): Promise<{
        nom: string;
        stockActuel: number;
        stockMinimum: number;
        unite: string;
        critique: boolean;
    }[]>;
    getCommandesParStatut(user: JwtPayload): Promise<{
        statut: string;
        count: number;
        couleur: string;
    }[]>;
    getTopClients(user: JwtPayload): Promise<{
        nom: string;
        ca: number;
    }[]>;
}
