import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@saas-erp/shared';

export const ROLES_KEY = 'roles';

// Déclare les rôles autorisés sur un endpoint
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
