// Types partagés entre le backend et le frontend

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

export const UserRole = {
  ADMIN: 'admin',
  DIRECTION: 'direction',
  COMMERCIAL: 'commercial',
  PRODUCTION: 'production',
  MAGASINIER: 'magasinier',
  COMPTABLE: 'comptable',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ModuleCode = {
  CRM: 'crm',
  COMMANDES: 'commandes',
  PRODUCTION: 'production',
  STOCK: 'stock',
  FACTURATION: 'facturation',
  RECYCLAGE: 'recyclage',
  REPORTING: 'reporting',
  FOURNISSEURS: 'fournisseurs',
  MACHINES: 'machines',
  MATIERES_PREMIERES: 'matieres-premieres',
  LOGISTIQUE: 'logistique',
} as const;
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
