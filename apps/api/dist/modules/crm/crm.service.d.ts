import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class CrmService {
    private prisma;
    constructor(prisma: PrismaService);
    getClients(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
    }): Promise<{
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
    getClient(tenantId: string, id: string): Promise<{
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
    creerClient(tenantId: string, dto: CreateClientDto): Promise<{
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
    modifierClient(tenantId: string, id: string, dto: Partial<CreateClientDto>): Promise<{
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
    supprimerClient(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    getProduits(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
    }): Promise<{
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
    getProduit(tenantId: string, id: string): Promise<{
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
    creerProduit(tenantId: string, data: {
        reference: string;
        nom: string;
        description?: string;
        unite?: string;
        prixUnitaire?: number;
        categorie?: string;
    }): Promise<{
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
    modifierProduit(tenantId: string, id: string, data: object): Promise<{
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
