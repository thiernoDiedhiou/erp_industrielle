import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { JwtPayload } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class MachinesController {
    private machinesService;
    constructor(machinesService: MachinesService);
    getListe(user: JwtPayload, query: PaginationQueryDto, statut?: string): Promise<{
        items: ({
            _count: {
                ofs: number;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            unite: string | null;
            nom: string;
            actif: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            statut: string;
            capacite: import(".prisma/client/runtime/library").Decimal | null;
            localisation: string | null;
            dateDerniereMaintenance: Date | null;
            prochaineMaintenanceDate: Date | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUne(user: JwtPayload, id: string): Promise<{
        ofs: {
            id: string;
            createdAt: Date;
            reference: string;
            statut: string;
            produitFini: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
    }>;
    creer(user: JwtPayload, dto: CreateMachineDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
    }>;
    modifier(user: JwtPayload, id: string, dto: Partial<CreateMachineDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
    }>;
    changerStatut(user: JwtPayload, id: string, statut: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        unite: string | null;
        nom: string;
        actif: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        statut: string;
        capacite: import(".prisma/client/runtime/library").Decimal | null;
        localisation: string | null;
        dateDerniereMaintenance: Date | null;
        prochaineMaintenanceDate: Date | null;
    }>;
    supprimer(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
