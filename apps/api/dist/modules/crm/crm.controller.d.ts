import { CrmService } from './crm.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtPayload } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CrmController {
    private crmService;
    constructor(crmService: CrmService);
    getClients(user: JwtPayload, query: PaginationQueryDto): Promise<{
        items: {
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            reference: string;
            nom: string;
            email: string | null;
            telephone: string | null;
            adresse: string | null;
            ville: string | null;
            updatedAt: Date;
            deletedAt: Date | null;
            ninea: string | null;
            statut: string;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getClient(user: JwtPayload, id: string): Promise<{
        commandes: {
            id: string;
            createdAt: Date;
            reference: string;
            statut: string;
            totalHT: import(".prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        adresse: string | null;
        ville: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        ninea: string | null;
        statut: string;
    }>;
    creerClient(user: JwtPayload, dto: CreateClientDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        adresse: string | null;
        ville: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        ninea: string | null;
        statut: string;
    }>;
    modifierClient(user: JwtPayload, id: string, dto: Partial<CreateClientDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        nom: string;
        email: string | null;
        telephone: string | null;
        adresse: string | null;
        ville: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        ninea: string | null;
        statut: string;
    }>;
    supprimerClient(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
    getProduits(user: JwtPayload, query: PaginationQueryDto): Promise<{
        items: {
            id: string;
            tenantId: string;
            createdAt: Date;
            description: string | null;
            reference: string;
            unite: string;
            nom: string;
            actif: boolean;
            deletedAt: Date | null;
            categorie: string;
            prixUnitaire: import(".prisma/client/runtime/library").Decimal;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getProduit(user: JwtPayload, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        reference: string;
        unite: string;
        nom: string;
        actif: boolean;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
    }>;
    creerProduit(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        reference: string;
        unite: string;
        nom: string;
        actif: boolean;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
    }>;
    modifierProduit(user: JwtPayload, id: string, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        reference: string;
        unite: string;
        nom: string;
        actif: boolean;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
    }>;
}
