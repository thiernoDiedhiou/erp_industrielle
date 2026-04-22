import { PrismaService } from '../../../prisma/prisma.service';
export declare class SuperAdminTenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(search?: string): Promise<{
        id: string;
        slug: string;
        nom: string;
        secteur: string;
        plan: string;
        actif: boolean;
        pays: string;
        ville: string | null;
        telephone: string | null;
        createdAt: Date;
        nbUsers: number;
        nbModules: number;
        modules: string[];
    }[]>;
    getUn(id: string): Promise<{
        statsCommandes: number;
        statsFactures: number;
        users: {
            id: string;
            createdAt: Date;
            prenom: string | null;
            nom: string;
            email: string;
            role: string;
            actif: boolean;
            derniereConnexion: Date | null;
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
    creer(data: {
        slug: string;
        nom: string;
        secteur: string;
        plan: string;
        pays?: string;
        ville?: string;
        telephone?: string;
        adresse?: string;
        adminEmail: string;
        adminNom: string;
        adminPassword: string;
        moduleCodes?: string[];
    }): Promise<{
        statsCommandes: number;
        statsFactures: number;
        users: {
            id: string;
            createdAt: Date;
            prenom: string | null;
            nom: string;
            email: string;
            role: string;
            actif: boolean;
            derniereConnexion: Date | null;
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
    modifier(id: string, data: {
        nom?: string;
        secteur?: string;
        plan?: string;
        pays?: string;
        ville?: string;
        telephone?: string;
        adresse?: string;
        couleurPrimaire?: string;
        couleurSecondaire?: string;
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
    toggleActif(id: string): Promise<{
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
    modifierModules(id: string, moduleCodes: string[]): Promise<{
        statsCommandes: number;
        statsFactures: number;
        users: {
            id: string;
            createdAt: Date;
            prenom: string | null;
            nom: string;
            email: string;
            role: string;
            actif: boolean;
            derniereConnexion: Date | null;
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
    creerUser(tenantId: string, data: {
        nom: string;
        prenom?: string;
        email: string;
        password: string;
        role: string;
        telephone?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        actif: boolean;
    }>;
    getStats(): Promise<{
        totalTenants: number;
        tenantsActifs: number;
        tenantsSuspendus: number;
        totalUsers: number;
        usersActifs: number;
        commandes: number;
        factures: number;
        parPlan: Record<string, number>;
    }>;
}
