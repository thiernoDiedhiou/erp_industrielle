import { PrismaService } from '../../prisma/prisma.service';
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
    getTableauBord(tenantId: string): Promise<{
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
    getMouvements(tenantId: string, opts: {
        page?: number;
        limite?: number;
        type?: string;
        matiereId?: string;
    }): Promise<{
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
    entreeStock(tenantId: string, data: {
        matierePremiereId: string;
        quantite: number;
        reference?: string;
        motif?: string;
        fournisseurId?: string;
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
    ajustementInventaire(tenantId: string, matiereId: string, stockReel: number, motif: string): Promise<{
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
