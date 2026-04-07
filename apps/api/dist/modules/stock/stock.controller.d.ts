import { StockService } from './stock.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class StockController {
    private stockService;
    constructor(stockService: StockService);
    getTableauBord(user: JwtPayload): Promise<{
        matieres: {
            fournisseur: {
                nom: string;
            } | null;
            id: string;
            reference: string;
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            stockMinimum: import(".prisma/client/runtime/library").Decimal;
            nom: string;
        }[];
        alertes: {
            fournisseur: {
                nom: string;
            } | null;
            id: string;
            reference: string;
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            stockMinimum: import(".prisma/client/runtime/library").Decimal;
            nom: string;
        }[];
    }>;
    getMouvements(user: JwtPayload, page?: number, limite?: number, type?: string, matiereId?: string): Promise<{
        items: ({
            matierePremiere: {
                unite: string;
                nom: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            reference: string;
            quantite: import(".prisma/client/runtime/library").Decimal;
            fournisseurId: string | null;
            matierePremiereId: string | null;
            motif: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    entreeStock(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        quantite: import(".prisma/client/runtime/library").Decimal;
        fournisseurId: string | null;
        matierePremiereId: string | null;
        motif: string | null;
    }>;
    ajustement(user: JwtPayload, id: string, body: {
        stockReel: number;
        motif: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        quantite: import(".prisma/client/runtime/library").Decimal;
        fournisseurId: string | null;
        matierePremiereId: string | null;
        motif: string | null;
    }>;
}
