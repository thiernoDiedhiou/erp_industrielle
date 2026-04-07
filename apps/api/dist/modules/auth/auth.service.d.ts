import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
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
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(userId: string): Promise<void>;
    profil(userId: string, tenantId: string): Promise<{
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
    private genererAccessToken;
    private genererRefreshToken;
}
