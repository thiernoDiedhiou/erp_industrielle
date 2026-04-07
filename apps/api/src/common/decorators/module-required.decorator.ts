import { SetMetadata } from '@nestjs/common';
import { ModuleCode } from '@saas-erp/shared';

export const MODULE_KEY = 'module';

// Vérifie que le tenant a activé ce module avant d'accéder à l'endpoint
export const ModuleRequired = (module: ModuleCode) => SetMetadata(MODULE_KEY, module);
