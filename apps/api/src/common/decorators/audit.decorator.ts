import { SetMetadata } from '@nestjs/common';

export const AUDIT_META = 'audit_meta';

export interface AuditMeta {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUT' | 'EXPORT';
  entite: string;
}

// Décorateur à placer sur les méthodes de contrôleur à auditer
// Exemple : @Audit({ action: 'CREATE', entite: 'Client' })
export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_META, meta);
