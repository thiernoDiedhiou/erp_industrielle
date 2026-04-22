import { TenantsService } from './tenants.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class TenantsController {
    private tenantsService;
    constructor(tenantsService: TenantsService);
    getTenantCourant(user: JwtPayload): Promise<{
        tenantModules: ({
            module: {
                id: string;
                description: string;
                nom: string;
                code: string;
                icon: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            actif: boolean;
            moduleId: string;
            config: import(".prisma/client/runtime/library").JsonValue | null;
            activatedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        telephone: string | null;
        actif: boolean;
        updatedAt: Date;
        slug: string;
        secteur: string;
        plan: string;
        logo: string | null;
        couleurPrimaire: string | null;
        couleurSecondaire: string | null;
        adresse: string | null;
        ville: string | null;
        pays: string;
    }>;
    getUtilisateurs(user: JwtPayload, page?: number, limite?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            nom: string;
            email: string;
            role: string;
            telephone: string | null;
            actif: boolean;
            derniereConnexion: Date | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    creerUtilisateur(user: JwtPayload, body: {
        nom: string;
        email: string;
        role: string;
        telephone?: string;
        motDePasse?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        role: string;
        actif: boolean;
    }>;
    toggleUtilisateur(user: JwtPayload, id: string, body: {
        actif: boolean;
    }): Promise<{
        id: string;
        nom: string;
        actif: boolean;
    }>;
    changerRole(user: JwtPayload, id: string, body: {
        role: string;
    }): Promise<{
        id: string;
        nom: string;
        role: string;
    }>;
    toggleModule(user: JwtPayload, code: string, body: {
        actif: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        actif: boolean;
        moduleId: string;
        config: import(".prisma/client/runtime/library").JsonValue | null;
        activatedAt: Date;
    }>;
    getSettings(user: JwtPayload): Promise<{
        id: string;
        tenantId: string;
        type: string;
        cle: string;
        valeur: string;
        label: string | null;
    }[]>;
    upsertSetting(user: JwtPayload, cle: string, body: {
        valeur: string;
    }): Promise<{
        id: string;
        tenantId: string;
        type: string;
        cle: string;
        valeur: string;
        label: string | null;
    }>;
}
