import { GroupesService, PermissionsMap } from './groupes.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class GroupesController {
    private groupesService;
    constructor(groupesService: GroupesService);
    getMesPermissions(user: JwtPayload): Promise<PermissionsMap>;
    getListe(user: JwtPayload): Promise<{
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
    getUn(user: JwtPayload, id: string): Promise<{
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
    creer(user: JwtPayload, body: {
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
    modifier(user: JwtPayload, id: string, body: {
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
    modifierPermissions(user: JwtPayload, id: string, body: {
        permissions: PermissionsMap;
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
    toggleActif(user: JwtPayload, id: string): Promise<{
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
