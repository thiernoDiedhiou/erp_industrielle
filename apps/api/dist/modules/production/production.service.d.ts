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
    getOF(tenantId: string, id: string): Promise<{
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
        produitId: string;
        commandeId: string | null;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
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
        produitId: string;
        commandeId: string | null;
        produitFini: string;
        quantitePrevue: import(".prisma/client/runtime/library").Decimal;
        quantiteProduite: import(".prisma/client/runtime/library").Decimal;
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
        quantiteConsommee: import(".prisma/client/runtime/library").Decimal;
        ordreFabricationId: string;
        matierePremiereId: string;
    }>;
    getMachines(tenantId: string): Promise<{
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
    creerMachine(tenantId: string, data: {
        code: string;
        nom: string;
        type?: string;
        capacite?: number;
        unite?: string;
    }): Promise<{
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
            deletedAt: Date | null;
            fournisseurId: string | null;
            prixAchat: import(".prisma/client/runtime/library").Decimal;
            isRecycle: boolean;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    private genererReferenceOF;
}
