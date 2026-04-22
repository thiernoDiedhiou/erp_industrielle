import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class SuperAdminAuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    login(email: string, password: string): Promise<{
        access_token: string;
        superAdmin: {
            id: string;
            email: string;
            nom: string;
        };
    }>;
}
