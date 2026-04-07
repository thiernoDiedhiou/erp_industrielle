import { AuditService } from './audit.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    getLogs(user: JwtPayload, page?: number, limite?: number, entite?: string, entiteId?: string, userId?: string, action?: string): Promise<{
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
    getHistorique(user: JwtPayload, entite: string, entiteId: string): Promise<{
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
