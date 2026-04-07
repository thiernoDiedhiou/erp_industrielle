import { PrismaService } from '../../prisma/prisma.service';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'STATUT';
export interface AuditContext {
    tenantId: string;
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(ctx: AuditContext, action: AuditAction, entite: string, entiteId?: string, avant?: object | null, apres?: object | null): Promise<void>;
    getLogs(tenantId: string, opts: {
        page?: number;
        limite?: number;
        entite?: string;
        entiteId?: string;
        userId?: string;
        action?: string;
    }): Promise<{
        items: {
            id: string;
            tenantId: string;
            userId: string | null;
            userEmail: string | null;
            action: string;
            entite: string;
            entiteId: string | null;
            avant: import(".prisma/client/runtime/library").JsonValue | null;
            apres: import(".prisma/client/runtime/library").JsonValue | null;
            ip: string | null;
            userAgent: string | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getHistoriqueEntite(tenantId: string, entite: string, entiteId: string): Promise<{
        id: string;
        tenantId: string;
        userId: string | null;
        userEmail: string | null;
        action: string;
        entite: string;
        entiteId: string | null;
        avant: import(".prisma/client/runtime/library").JsonValue | null;
        apres: import(".prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
}
