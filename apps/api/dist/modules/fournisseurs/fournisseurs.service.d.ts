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
            reference: string;
            nom: string;
            email: string | null;
            actif: boolean;
            telephone: string | null;
            pays: string;
            deletedAt: Date | null;
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
        reference: string;
        nom: string;
        email: string | null;
        actif: boolean;
        telephone: string | null;
        pays: string;
        deletedAt: Date | null;
    }>;
    creer(tenantId: string, dto: CreateFournisseurDto): Promise<{
        id: string;
        tenantId: string;
        reference: string;
        nom: string;
        email: string | null;
        actif: boolean;
        telephone: string | null;
        pays: string;
        deletedAt: Date | null;
    }>;
    modifier(tenantId: string, id: string, dto: Partial<CreateFournisseurDto>): Promise<{
        id: string;
        tenantId: string;
        reference: string;
        nom: string;
        email: string | null;
        actif: boolean;
        telephone: string | null;
        pays: string;
        deletedAt: Date | null;
    }>;
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    toggleActif(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        reference: string;
        nom: string;
        email: string | null;
        actif: boolean;
        telephone: string | null;
        pays: string;
        deletedAt: Date | null;
    }>;
}
