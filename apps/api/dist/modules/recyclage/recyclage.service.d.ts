import { PrismaService } from '../../prisma/prisma.service';
export declare class RecyclageService {
    private prisma;
    constructor(prisma: PrismaService);
    getCollectes(tenantId: string, opts: {
        page?: number;
        limite?: number;
    }): Promise<{
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
    creerCollecte(tenantId: string, data: {
        typeDechet: string;
        quantite: number;
        unite?: string;
        sourceAdresse?: string;
        collecteur?: string;
        notes?: string;
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
    changerStatut(tenantId: string, id: string, statut: string): Promise<{
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
    getStats(tenantId: string): Promise<{
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
}
