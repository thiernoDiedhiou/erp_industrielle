import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        nbTenants: number;
        nbTenantActifs: number;
        nbUsers: number;
        nbCommandes: number;
        nbFactures: number;
        totalCA: number;
        modulesUsage: {
            code: string;
            nom: string;
            nbTenants: number;
        }[];
    }>;
    getTenants(): Promise<{
        id: string;
        slug: string;
        nom: string;
        secteur: string;
        plan: string;
        actif: boolean;
        ville: string | null;
        pays: string;
        createdAt: Date;
        nbUtilisateurs: number;
        modules: string[];
    }[]>;
    getTenant(id: string): Promise<{
        nbCommandes: number;
        nbClients: number;
        users: {
            id: string;
            createdAt: Date;
            prenom: string | null;
            nom: string;
            email: string;
            role: string;
            actif: boolean;
        }[];
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
        _count: {
            users: number;
        };
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
    toggleTenant(id: string, body: {
        actif: boolean;
    }): Promise<{
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
    toggleModule(tenantId: string, code: string, body: {
        actif: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        actif: boolean;
        moduleId: string;
        config: import(".prisma/client/runtime/library").JsonValue | null;
        activatedAt: Date;
    }>;
    getModules(): Promise<{
        id: string;
        description: string;
        nom: string;
        code: string;
        icon: string | null;
    }[]>;
}
