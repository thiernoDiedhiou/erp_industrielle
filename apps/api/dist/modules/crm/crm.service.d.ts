import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class CrmService {
    private prisma;
    constructor(prisma: PrismaService);
    getClients(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
        type?: string;
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
            updatedAt: Date;
            deletedAt: Date | null;
            adresse: string | null;
            ville: string | null;
            ninea: string | null;
            statut: string;
            contact: string | null;
            commercialId: string | null;
            plafondCredit: import(".prisma/client/runtime/library").Decimal | null;
            delaiPaiement: number | null;
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
        updatedAt: Date;
        deletedAt: Date | null;
        adresse: string | null;
        ville: string | null;
        ninea: string | null;
        statut: string;
        contact: string | null;
        commercialId: string | null;
        plafondCredit: import(".prisma/client/runtime/library").Decimal | null;
        delaiPaiement: number | null;
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
        updatedAt: Date;
        deletedAt: Date | null;
        adresse: string | null;
        ville: string | null;
        ninea: string | null;
        statut: string;
        contact: string | null;
        commercialId: string | null;
        plafondCredit: import(".prisma/client/runtime/library").Decimal | null;
        delaiPaiement: number | null;
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
        updatedAt: Date;
        deletedAt: Date | null;
        adresse: string | null;
        ville: string | null;
        ninea: string | null;
        statut: string;
        contact: string | null;
        commercialId: string | null;
        plafondCredit: import(".prisma/client/runtime/library").Decimal | null;
        delaiPaiement: number | null;
    }>;
    supprimerClient(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    getClientCommandes(tenantId: string, clientId: string, opts: {
        page?: number;
        limite?: number;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            reference: string;
            _count: {
                lignes: number;
            };
            statut: string;
            dateLivraisonPrevue: Date | null;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
        }[];
        total: number;
        page: number;
        totalPages: number;
        totalCA: number;
    }>;
    getClientFactures(tenantId: string, clientId: string, opts: {
        page?: number;
        limite?: number;
    }): Promise<{
        items: {
            montantPaye: number;
            montantHT: number;
            montantTTC: number;
            paiements: undefined;
            id: string;
            createdAt: Date;
            reference: string;
            statut: string;
            totalHT: import(".prisma/client/runtime/library").Decimal;
            totalTTC: import(".prisma/client/runtime/library").Decimal;
            dateEcheance: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
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
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            nom: string;
            actif: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
            categorie: string;
            prixUnitaire: import(".prisma/client/runtime/library").Decimal;
            coutProduction: import(".prisma/client/runtime/library").Decimal | null;
            poidsUnite: import(".prisma/client/runtime/library").Decimal | null;
            stockMin: import(".prisma/client/runtime/library").Decimal;
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
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
        coutProduction: import(".prisma/client/runtime/library").Decimal | null;
        poidsUnite: import(".prisma/client/runtime/library").Decimal | null;
        stockMin: import(".prisma/client/runtime/library").Decimal;
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
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
        coutProduction: import(".prisma/client/runtime/library").Decimal | null;
        poidsUnite: import(".prisma/client/runtime/library").Decimal | null;
        stockMin: import(".prisma/client/runtime/library").Decimal;
    }>;
    modifierProduit(tenantId: string, id: string, data: object): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        categorie: string;
        prixUnitaire: import(".prisma/client/runtime/library").Decimal;
        coutProduction: import(".prisma/client/runtime/library").Decimal | null;
        poidsUnite: import(".prisma/client/runtime/library").Decimal | null;
        stockMin: import(".prisma/client/runtime/library").Decimal;
    }>;
}
