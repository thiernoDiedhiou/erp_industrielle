import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
export declare class MachinesService {
    private prisma;
    constructor(prisma: PrismaService);
    getListe(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
        statut?: string;
    }): Promise<{
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
    getUne(tenantId: string, id: string): Promise<{
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
    creer(tenantId: string, dto: CreateMachineDto): Promise<{
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
    modifier(tenantId: string, id: string, dto: Partial<CreateMachineDto>): Promise<{
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
    changerStatut(tenantId: string, id: string, statut: string): Promise<{
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
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
