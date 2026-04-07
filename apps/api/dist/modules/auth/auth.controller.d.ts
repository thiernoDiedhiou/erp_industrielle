import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from '@saas-erp/shared';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            nom: string;
            email: string;
            role: string;
            tenant: {
                id: string;
                nom: string;
                slug: string;
                couleurPrimaire: string | null;
                couleurSecondaire: string | null;
                logo: string | null;
            };
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(user: JwtPayload): Promise<void>;
    profil(user: JwtPayload): Promise<{
        tenant: {
            id: string;
            nom: string;
            slug: string;
            plan: string;
            logo: string | null;
            couleurPrimaire: string | null;
            couleurSecondaire: string | null;
        };
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        derniereConnexion: Date | null;
    }>;
}
