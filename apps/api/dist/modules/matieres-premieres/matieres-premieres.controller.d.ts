import { MatieresPremiereService } from './matieres-premieres.service';
import { CreateMatierePremiereDto } from './dto/create-matiere-premiere.dto';
import { JwtPayload } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class MatieresPremiereController {
    private mpService;
    constructor(mpService: MatieresPremiereService);
    getListe(user: JwtPayload, query: PaginationQueryDto, critique?: string): Promise<{
        items: {
            critique: boolean;
            fournisseur: {
                id: string;
                reference: string;
                nom: string;
            } | null;
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            reference: string;
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            stockMinimum: import(".prisma/client/runtime/library").Decimal;
            nom: string;
            deletedAt: Date | null;
            fournisseurId: string | null;
            prixAchat: import(".prisma/client/runtime/library").Decimal;
            isRecycle: boolean;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUne(user: JwtPayload, id: string): Promise<{
        critique: boolean;
        fournisseur: {
            id: string;
            tenantId: string;
            reference: string;
            nom: string;
            email: string | null;
            actif: boolean;
            telephone: string | null;
            pays: string;
            deletedAt: Date | null;
        } | null;
        mouvements: {
            id: string;
            createdAt: Date;
            type: string;
            quantite: import(".prisma/client/runtime/library").Decimal;
            motif: string | null;
        }[];
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        isRecycle: boolean;
    }>;
    creer(user: JwtPayload, dto: CreateMatierePremiereDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        isRecycle: boolean;
    }>;
    modifier(user: JwtPayload, id: string, dto: Partial<CreateMatierePremiereDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        isRecycle: boolean;
    }>;
    ajusterStock(user: JwtPayload, id: string, body: {
        quantite: number;
        type: 'entree' | 'sortie' | 'ajustement';
        motif?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        isRecycle: boolean;
    }>;
    supprimer(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
