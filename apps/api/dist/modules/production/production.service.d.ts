import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductionService {
    private prisma;
    constructor(prisma: PrismaService);
    getOFs(tenantId: string, opts: {
        page?: number;
        limite?: number;
        statut?: string;
    }): Promise<{
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
    getOF(tenantId: string, id: string): Promise<{
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
    creerOF(tenantId: string, userId: string, data: {
        commandeId?: string;
        machineId?: string;
        produitId: string;
        produitFini: string;
        quantitePrevue: number;
        dateDebut?: string;
        dateFin?: string;
        notes?: string;
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
    changerStatutOF(tenantId: string, id: string, statut: string): Promise<{
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
    enregistrerConsommation(tenantId: string, ofId: string, data: {
        matierePremiereId: string;
        quantiteConsommee: number;
    }): Promise<{
        id: string;
        tenantId: string;
        ordreFabricationId: string;
        matierePremiereId: string;
        quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
    }>;
    getMachines(tenantId: string): Promise<{
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
    creerMachine(tenantId: string, data: {
        code: string;
        nom: string;
        type?: string;
        capacite?: number;
        unite?: string;
    }): Promise<{
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
    getMatieresPrmieres(tenantId: string, opts: {
        page?: number;
        limite?: number;
    }): Promise<{
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
    private genererReferenceOF;
}
