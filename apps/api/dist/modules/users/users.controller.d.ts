import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getListe(user: JwtPayload, query: PaginationQueryDto, role?: string): Promise<{
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
    getUn(user: JwtPayload, id: string): Promise<{
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
    creer(user: JwtPayload, dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        actif: boolean;
    }>;
    modifier(user: JwtPayload, id: string, dto: Partial<CreateUserDto>): Promise<{
        id: string;
        prenom: string | null;
        nom: string;
        email: string;
        role: string;
        telephone: string | null;
        actif: boolean;
    }>;
    toggleActif(user: JwtPayload, id: string): Promise<{
        id: string;
        actif: boolean;
    }>;
    reinitialiserMotDePasse(user: JwtPayload, id: string): Promise<{
        temporaryPassword: string;
    }>;
    supprimer(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
