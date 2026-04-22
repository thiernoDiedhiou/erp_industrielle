import { PrismaService } from '../../prisma/prisma.service';
import { CreateBomDto } from './dto/create-bom.dto';
export declare class BomService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
        actif?: boolean;
    }): Promise<{
        items: ({
            _count: {
                items: number;
            };
            produitFini: {
                id: string;
                reference: string;
                nom: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            version: string;
            nom: string;
            actif: boolean;
            updatedAt: Date;
            notes: string | null;
            produitFiniId: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUn(tenantId: string, id: string): Promise<{
        items: ({
            produit: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
            } | null;
            matierePremiere: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
                prixAchat: import(".prisma/client/runtime/library").Decimal;
            } | null;
        } & {
            id: string;
            unite: string;
            notes: string | null;
            produitId: string | null;
            quantite: import(".prisma/client/runtime/library").Decimal;
            matierePremiereId: string | null;
            pertes: import(".prisma/client/runtime/library").Decimal;
            bomId: string;
        })[];
        produitFini: {
            id: string;
            reference: string;
            nom: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        version: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        notes: string | null;
        produitFiniId: string;
    }>;
    creer(tenantId: string, dto: CreateBomDto): Promise<{
        items: ({
            produit: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
            } | null;
            matierePremiere: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
                prixAchat: import(".prisma/client/runtime/library").Decimal;
            } | null;
        } & {
            id: string;
            unite: string;
            notes: string | null;
            produitId: string | null;
            quantite: import(".prisma/client/runtime/library").Decimal;
            matierePremiereId: string | null;
            pertes: import(".prisma/client/runtime/library").Decimal;
            bomId: string;
        })[];
        produitFini: {
            id: string;
            reference: string;
            nom: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        version: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        notes: string | null;
        produitFiniId: string;
    }>;
    modifier(tenantId: string, id: string, dto: Partial<CreateBomDto>): Promise<{
        items: ({
            produit: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
            } | null;
            matierePremiere: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
                prixAchat: import(".prisma/client/runtime/library").Decimal;
            } | null;
        } & {
            id: string;
            unite: string;
            notes: string | null;
            produitId: string | null;
            quantite: import(".prisma/client/runtime/library").Decimal;
            matierePremiereId: string | null;
            pertes: import(".prisma/client/runtime/library").Decimal;
            bomId: string;
        })[];
        produitFini: {
            id: string;
            reference: string;
            nom: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        version: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        notes: string | null;
        produitFiniId: string;
    }>;
    toggleActif(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        version: string;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        notes: string | null;
        produitFiniId: string;
    }>;
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    calculerCout(tenantId: string, bomId: string, quantite: number): Promise<{
        bom: {
            id: string;
            nom: string;
            version: string;
        };
        quantite: number;
        coutUnitaire: number;
        coutTotal: number;
        details: {
            nom: string;
            quantite: number;
            prixUnit: number;
            sousTotal: number;
        }[];
    }>;
}
