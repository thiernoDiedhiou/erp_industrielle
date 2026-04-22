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
                ordreFabricationId: string;
                matierePremiereId: string;
                quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            updatedAt: Date;
            statut: string;
            notes: string | null;
            commandeId: string | null;
            produitId: string;
            produitFini: string;
            quantitePrevue: import(".prisma/client/runtime/library").Decimal;
            quantiteProduite: import(".prisma/client/runtime/library").Decimal;
            quantiteRebut: import(".prisma/client/runtime/library").Decimal;
            dateDebutPrevue: Date | null;
            dateFinPrevue: Date | null;
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
            createdAt: Date;
            type: string;
            unite: string | null;
            nom: string;
            actif: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            statut: string;
            capacite: import(".prisma/client/runtime/library").Decimal | null;
            localisation: string | null;
            dateDerniereMaintenance: Date | null;
            prochaineMaintenanceDate: Date | null;
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
                updatedAt: Date;
                deletedAt: Date | null;
                fournisseurId: string | null;
                prixAchat: import(".prisma/client/runtime/library").Decimal;
                delaiApprovisionnement: number | null;
                isRecycle: boolean;
            };
        } & {
            id: string;
            tenantId: string;
            ordreFabricationId: string;
            matierePremiereId: string;
            quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        notes: string | null;
        commandeId: string | null;
        produitId: string;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        quantiteRebut: import(".prisma/client/runtime/library").Decimal;
        dateDebutPrevue: Date | null;
        dateFinPrevue: Date | null;
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
        commandeId: string | null;
        produitId: string;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        quantiteRebut: import(".prisma/client/runtime/library").Decimal;
        dateDebutPrevue: Date | null;
        dateFinPrevue: Date | null;
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
        commandeId: string | null;
        produitId: string;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
        quantiteRebut: import(".prisma/client/runtime/library").Decimal;
        dateDebutPrevue: Date | null;
        dateFinPrevue: Date | null;
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
        ordreFabricationId: string;
        matierePremiereId: string;
        quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
    }>;
    getMachines(user: JwtPayload): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
    }[]>;
    creerMachine(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
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
            updatedAt: Date;
            deletedAt: Date | null;
            fournisseurId: string | null;
            prixAchat: import(".prisma/client/runtime/library").Decimal;
            delaiApprovisionnement: number | null;
            isRecycle: boolean;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
