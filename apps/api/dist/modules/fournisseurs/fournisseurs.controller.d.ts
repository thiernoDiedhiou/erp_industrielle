import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { JwtPayload } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class FournisseursController {
    private fournisseursService;
    constructor(fournisseursService: FournisseursService);
    getListe(user: JwtPayload, query: PaginationQueryDto): Promise<{
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
    getUn(user: JwtPayload, id: string): Promise<{
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
    creer(user: JwtPayload, dto: CreateFournisseurDto): Promise<{
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
    modifier(user: JwtPayload, id: string, dto: Partial<CreateFournisseurDto>): Promise<{
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
    supprimer(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
    toggle(user: JwtPayload, id: string): Promise<{
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
