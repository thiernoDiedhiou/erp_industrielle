import { ProductionService } from './production.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class ProductionController {
    private productionService;
    constructor(productionService: ProductionService);
    getOFs(user: JwtPayload, page?: number, limite?: number, statut?: string): Promise<{
        items: ({
            machine: {
                nom: string;
                code: string;
            } | null;
            consommations: ({
                matierePremiere: {
                    unite: string;
                    nom: string;
                };
            } & {
                id: string;
                tenantId: string;
                quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
                ordreFabricationId: string;
                matierePremiereId: string;
            })[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            updatedAt: Date;
            statut: string;
            notes: string | null;
            produitId: string;
            commandeId: string | null;
            produitFini: string;
            quantitePrevue: import(".prisma/client/runtime/library").Decimal;
            quantiteProduite: import(".prisma/client/runtime/library").Decimal;
            machineId: string | null;
            dateDebut: Date | null;
            dateFin: Date | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOF(user: JwtPayload, id: string): Promise<{
        machine: {
            id: string;
            tenantId: string;
            type: string;
            unite: string | null;
            nom: string;
            actif: boolean;
            deletedAt: Date | null;
            code: string;
            statut: string;
            capacite: import(".prisma/client/runtime/library").Decimal | null;
        } | null;
        consommations: ({
            matierePremiere: {
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
            };
        } & {
            id: string;
            tenantId: string;
            quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
            ordreFabricationId: string;
            matierePremiereId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        notes: string | null;
        produitId: string;
        commandeId: string | null;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        machineId: string | null;
        dateDebut: Date | null;
        dateFin: Date | null;
    }>;
    creerOF(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        notes: string | null;
        produitId: string;
        commandeId: string | null;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        machineId: string | null;
        dateDebut: Date | null;
        dateFin: Date | null;
    }>;
    changerStatut(user: JwtPayload, id: string, body: {
        statut: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        notes: string | null;
        produitId: string;
        commandeId: string | null;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        machineId: string | null;
        dateDebut: Date | null;
        dateFin: Date | null;
    }>;
    enregistrerConsommation(user: JwtPayload, id: string, body: {
        matierePremiereId: string;
        quantiteConsommee: number;
    }): Promise<{
        id: string;
        tenantId: string;
        quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
        ordreFabricationId: string;
        matierePremiereId: string;
    }>;
    getMachines(user: JwtPayload): Promise<{
        id: string;
        tenantId: string;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
    }[]>;
    creerMachine(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
    }>;
    getMatieresPrmieres(user: JwtPayload, page?: number, limite?: number): Promise<{
        items: ({
            fournisseur: {
                nom: string;
            } | null;
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
