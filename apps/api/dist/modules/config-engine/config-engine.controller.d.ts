import { ConfigEngineService } from './config-engine.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class ConfigEngineController {
    private configService;
    constructor(configService: ConfigEngineService);
    getEnums(user: JwtPayload, entite?: string): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }[]>;
    creerEnum(user: JwtPayload, body: any): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }>;
    modifierEnum(user: JwtPayload, id: string, body: any): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        actif: boolean;
        code: string;
        libelle: string;
        couleur: string | null;
        ordre: number;
    }>;
    getChamps(user: JwtPayload, entite?: string): Promise<{
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
    creerChamp(user: JwtPayload, body: any): Promise<{
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
    modifierChamp(user: JwtPayload, id: string, body: any): Promise<{
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
    getValeurs(user: JwtPayload, entite: string, entiteId: string): Promise<({
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
    upsertValeur(user: JwtPayload, entite: string, entiteId: string, body: {
        champId: string;
        valeur: string;
    }): Promise<{
        id: string;
        tenantId: string;
        entite: string;
        entiteId: string;
        valeur: string;
        champId: string;
    }>;
    getWorkflows(user: JwtPayload): Promise<({
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
    getWorkflow(user: JwtPayload, entite: string): Promise<{
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
}
