import { PrismaService } from '../../prisma/prisma.service';
export declare class ConfigEngineService {
    private prisma;
    constructor(prisma: PrismaService);
    getEnums(tenantId: string, entite?: string): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }[]>;
    creerEnum(tenantId: string, data: {
        entite: string;
        code: string;
        libelle: string;
        couleur?: string;
        ordre?: number;
    }): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }>;
    modifierEnum(tenantId: string, id: string, data: {
        libelle?: string;
        couleur?: string;
        ordre?: number;
        actif?: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }>;
    getChamps(tenantId: string, entite?: string): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        type: string;
        options: import(".prisma/client/runtime/library").JsonValue | null;
        nom: string;
        actif: boolean;
        label: string;
        ordre: number;
        obligatoire: boolean;
    }[]>;
    creerChamp(tenantId: string, data: {
        entite: string;
        nom: string;
        type: string;
        label: string;
        obligatoire?: boolean;
        ordre?: number;
        options?: object;
    }): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        type: string;
        options: import(".prisma/client/runtime/library").JsonValue | null;
        nom: string;
        actif: boolean;
        label: string;
        ordre: number;
        obligatoire: boolean;
    }>;
    modifierChamp(tenantId: string, id: string, data: {
        label?: string;
        obligatoire?: boolean;
        ordre?: number;
        actif?: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        type: string;
        options: import(".prisma/client/runtime/library").JsonValue | null;
        nom: string;
        actif: boolean;
        label: string;
        ordre: number;
        obligatoire: boolean;
    }>;
    getValeursChamps(tenantId: string, entite: string, entiteId: string): Promise<({
        champ: {
            type: string;
            nom: string;
            label: string;
        };
    } & {
        id: string;
        tenantId: string;
        entite: string;
        entiteId: string;
        valeur: string;
        champId: string;
    })[]>;
    upsertValeurChamp(tenantId: string, entite: string, entiteId: string, champId: string, valeur: string): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        entiteId: string;
        valeur: string;
        champId: string;
    }>;
    getWorkflows(tenantId: string): Promise<({
        etats: {
            id: string;
            code: string;
            libelle: string;
            couleur: string | null;
            ordre: number;
            workflowId: string;
            etapInitiale: boolean;
            etapFinale: boolean;
        }[];
        transitions: {
            id: string;
            libelle: string;
            workflowId: string;
            etatSourceId: string;
            etatCibleId: string;
            rolesAutorises: string[];
            needsApproval: boolean;
        }[];
    } & {
        id: string;
        tenantId: string;
        entite: string;
        createdAt: Date;
        nom: string;
        actif: boolean;
    })[]>;
    getWorkflow(tenantId: string, entite: string): Promise<{
        [x: string]: ({
            id: string;
            code: string;
            libelle: string;
            couleur: string | null;
            ordre: number;
            workflowId: string;
            etapInitiale: boolean;
            etapFinale: boolean;
        } | {
            id: string;
            code: string;
            libelle: string;
            couleur: string | null;
            ordre: number;
            workflowId: string;
            etapInitiale: boolean;
            etapFinale: boolean;
        })[] | ({
            id: string;
            libelle: string;
            workflowId: string;
            etatSourceId: string;
            etatCibleId: string;
            rolesAutorises: string[];
            needsApproval: boolean;
        } | {
            id: string;
            libelle: string;
            workflowId: string;
            etatSourceId: string;
            etatCibleId: string;
            rolesAutorises: string[];
            needsApproval: boolean;
        })[] | {
            id: string;
            code: string;
            libelle: string;
            couleur: string | null;
            ordre: number;
            workflowId: string;
            etapInitiale: boolean;
            etapFinale: boolean;
        }[] | {
            id: string;
            libelle: string;
            workflowId: string;
            etatSourceId: string;
            etatCibleId: string;
            rolesAutorises: string[];
            needsApproval: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        tenantId: string;
        entite: string;
        createdAt: Date;
        nom: string;
        actif: boolean;
    }>;
    verifierTransition(tenantId: string, entite: string, etatSourceCode: string, etatCibleCode: string, role: string): Promise<boolean>;
}
