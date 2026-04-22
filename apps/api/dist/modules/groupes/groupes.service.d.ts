import { PrismaService } from '../../prisma/prisma.service';
export interface PermissionModule {
    lire: boolean;
    ecrire: boolean;
    supprimer: boolean;
}
export type PermissionsMap = Record<string, PermissionModule>;
export declare class GroupesService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }[]>;
    getUn(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }>;
    getParCode(tenantId: string, code: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    } | null>;
    getMesPermissions(tenantId: string, role: string): Promise<PermissionsMap>;
    creer(tenantId: string, data: {
        code: string;
        nom: string;
        description?: string;
        permissions?: PermissionsMap;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }>;
    modifierPermissions(tenantId: string, id: string, permissions: PermissionsMap): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }>;
    modifier(tenantId: string, id: string, data: {
        nom?: string;
        description?: string;
        permissions?: PermissionsMap;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }>;
    toggleActif(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        code: string;
        permissions: import(".prisma/client/runtime/library").JsonValue;
    }>;
}
