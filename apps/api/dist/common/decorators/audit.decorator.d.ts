export declare const AUDIT_META = "audit_meta";
export interface AuditMeta {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUT' | 'EXPORT';
    entite: string;
}
export declare const Audit: (meta: AuditMeta) => import("@nestjs/common").CustomDecorator<string>;
