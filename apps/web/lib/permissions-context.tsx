'use client';

import { createContext, useContext } from 'react';

export interface PermissionModule { lire: boolean; ecrire: boolean; supprimer: boolean; }
export type PermissionsMap = Record<string, PermissionModule>;

export const PermissionsContext = createContext<PermissionsMap>({});

export function usePermissions(moduleCode: string) {
  const permissions = useContext(PermissionsContext);
  const p = permissions[moduleCode];
  return {
    peutLire:      p?.lire      ?? false,
    peutEcrire:    p?.ecrire    ?? false,
    peutSupprimer: p?.supprimer ?? false,
  };
}
