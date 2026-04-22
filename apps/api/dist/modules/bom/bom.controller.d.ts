import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
export declare class BomController {
    private readonly bomService;
    constructor(bomService: BomService);
    getListe(req: any, page?: string, limite?: string, search?: string, actif?: string): Promise<{
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
    getUn(req: any, id: string): Promise<{
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
    calculerCout(req: any, id: string, quantite: string): Promise<{
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
    creer(req: any, dto: CreateBomDto): Promise<{
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
    modifier(req: any, id: string, dto: Partial<CreateBomDto>): Promise<{
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
    toggleActif(req: any, id: string): Promise<{
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
    supprimer(req: any, id: string): Promise<{
        message: string;
    }>;
}
