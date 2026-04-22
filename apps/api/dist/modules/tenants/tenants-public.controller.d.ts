import { TenantsService } from './tenants.service';
export declare class TenantsPublicController {
    private tenantsService;
    constructor(tenantsService: TenantsService);
    getBranding(slug: string): Promise<{
        nom: string;
        slug: string;
        logo: string | null;
        couleurPrimaire: string | null;
        couleurSecondaire: string | null;
    }>;
}
