import { SuperAdminAuthService } from './super-admin-auth.service';
export declare class SuperAdminAuthController {
    private auth;
    constructor(auth: SuperAdminAuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        superAdmin: {
            id: string;
            email: string;
            nom: string;
        };
    }>;
}
