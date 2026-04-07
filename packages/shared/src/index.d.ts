export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}
export declare const UserRole: {
    readonly ADMIN: "admin";
    readonly DIRECTION: "direction";
    readonly COMMERCIAL: "commercial";
    readonly PRODUCTION: "production";
    readonly MAGASINIER: "magasinier";
    readonly COMPTABLE: "comptable";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare const ModuleCode: {
    readonly CRM: "crm";
    readonly COMMANDES: "commandes";
    readonly PRODUCTION: "production";
    readonly STOCK: "stock";
    readonly FACTURATION: "facturation";
    readonly RECYCLAGE: "recyclage";
    readonly REPORTING: "reporting";
    readonly FOURNISSEURS: "fournisseurs";
    readonly MACHINES: "machines";
    readonly MATIERES_PREMIERES: "matieres-premieres";
    readonly LOGISTIQUE: "logistique";
};
export type ModuleCode = typeof ModuleCode[keyof typeof ModuleCode];
export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    role: string;
    tenantSlug: string;
    iat?: number;
    exp?: number;
}
