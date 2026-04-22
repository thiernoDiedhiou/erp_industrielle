import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class TenantsService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    getTenantCourant(tenantId: string): Promise<{
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
    getUtilisateurs(tenantId: string, page?: number, limite?: number): Promise<{
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
    toggleModule(tenantId: string, moduleCode: string, actif: boolean): Promise<{
        id: string;
        tenantId: string;
        actif: boolean;
        moduleId: string;
        config: import(".prisma/client/runtime/library").JsonValue | null;
        activatedAt: Date;
    }>;
    getSettings(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        type: string;
        cle: string;
        valeur: string;
        label: string | null;
    }[]>;
    upsertSetting(tenantId: string, cle: string, valeur: string): Promise<{
        id: string;
        tenantId: string;
        type: string;
        cle: string;
        valeur: string;
        label: string | null;
    }>;
    creerUtilisateur(tenantId: string, data: {
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
    toggleUtilisateur(tenantId: string, userId: string, actif: boolean): Promise<{
        id: string;
        nom: string;
        actif: boolean;
    }>;
    changerRole(tenantId: string, userId: string, role: string): Promise<{
        id: string;
        nom: string;
        role: string;
    }>;
    getBranding(slug: string): Promise<{
        nom: string;
        slug: string;
        logo: string | null;
        couleurPrimaire: string | null;
        couleurSecondaire: string | null;
    }>;
}
