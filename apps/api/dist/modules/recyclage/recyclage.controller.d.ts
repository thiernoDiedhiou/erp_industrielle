import { RecyclageService } from './recyclage.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class RecyclageController {
    private recyclageService;
    constructor(recyclageService: RecyclageService);
    getCollectes(user: JwtPayload, page?: number, limite?: number): Promise<{
        items: {
            id: string;
            tenantId: string;
            createdAt: Date;
            unite: string;
            statut: string;
            notes: string | null;
            quantite: import(".prisma/client/runtime/library").Decimal;
            typeDechet: string;
            sourceAdresse: string | null;
            collecteur: string | null;
            dateCollecte: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(user: JwtPayload): Promise<{
        totalCollectes: number;
        totalQuantite: number | import(".prisma/client/runtime/library").Decimal;
        parType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecyclageCollecteGroupByOutputType, "typeDechet"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                quantite: import(".prisma/client/runtime/library").Decimal | null;
            };
        })[];
        parStatut: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecyclageCollecteGroupByOutputType, "statut"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    creerCollecte(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        unite: string;
        statut: string;
        notes: string | null;
        quantite: import(".prisma/client/runtime/library").Decimal;
        typeDechet: string;
        sourceAdresse: string | null;
        collecteur: string | null;
        dateCollecte: Date;
    }>;
    changerStatut(user: JwtPayload, id: string, body: {
        statut: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        unite: string;
        statut: string;
        notes: string | null;
        quantite: import(".prisma/client/runtime/library").Decimal;
        typeDechet: string;
        sourceAdresse: string | null;
        collecteur: string | null;
        dateCollecte: Date;
    }>;
}
