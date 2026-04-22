import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
        role?: string;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            prenom: string | null;
            nom: string;
            email: string;
            role: string;
            telephone: string | null;
            actif: boolean;
            derniereConnexion: Date | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUn(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        derniereConnexion: Date | null;
    }>;
    creer(tenantId: string, dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        actif: boolean;
    }>;
    modifier(tenantId: string, id: string, dto: Partial<CreateUserDto>): Promise<{
        id: string;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        actif: boolean;
    }>;
    toggleActif(tenantId: string, id: string): Promise<{
        id: string;
        actif: boolean;
    }>;
    reinitialiserMotDePasse(tenantId: string, id: string): Promise<{
        temporaryPassword: string;
    }>;
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
