import { PrismaService } from '../../prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
export declare class FournisseursService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
    }): Promise<{
        items: ({
            _count: {
                matieresPrmieres: number;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            nom: string;
            email: string | null;
            telephone: string | null;
            actif: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
            pays: string;
            contact: string | null;
            delaiLivraisonMoyen: number | null;
            noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
            conditionsPaiement: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUn(tenantId: string, id: string): Promise<{
        matieresPrmieres: {
            id: string;
            reference: string;
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            nom: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        pays: string;
        contact: string | null;
        delaiLivraisonMoyen: number | null;
        noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
        conditionsPaiement: string | null;
    }>;
    creer(tenantId: string, dto: CreateFournisseurDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        pays: string;
        contact: string | null;
        delaiLivraisonMoyen: number | null;
        noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
        conditionsPaiement: string | null;
    }>;
    modifier(tenantId: string, id: string, dto: Partial<CreateFournisseurDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        pays: string;
        contact: string | null;
        delaiLivraisonMoyen: number | null;
        noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
        conditionsPaiement: string | null;
    }>;
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    toggleActif(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        pays: string;
        contact: string | null;
        delaiLivraisonMoyen: number | null;
        noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
        conditionsPaiement: string | null;
    }>;
}
