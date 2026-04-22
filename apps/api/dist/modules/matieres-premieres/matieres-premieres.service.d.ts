import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatierePremiereDto } from './dto/create-matiere-premiere.dto';
import { QueueService } from '../queue/queue.service';
export declare class MatieresPremiereService {
    private prisma;
    private queue;
    constructor(prisma: PrismaService, queue: QueueService);
    getListe(tenantId: string, opts: {
        page?: number;
        limite?: number;
        search?: string;
        critique?: boolean;
    }): Promise<{
        items: {
            critique: boolean;
            fournisseur: {
                id: string;
                reference: string;
                nom: string;
            } | null;
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            reference: string;
            stockActuel: import(".prisma/client/runtime/library").Decimal;
            unite: string;
            stockMinimum: import(".prisma/client/runtime/library").Decimal;
            nom: string;
            updatedAt: Date;
            deletedAt: Date | null;
            fournisseurId: string | null;
            prixAchat: import(".prisma/client/runtime/library").Decimal;
            delaiApprovisionnement: number | null;
            isRecycle: boolean;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUne(tenantId: string, id: string): Promise<{
        critique: boolean;
        fournisseur: {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            nom: string;
            email: string | null;
            telephone: string | null;
            actif: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
            pays: string;
            contact: string | null;
            delaiLivraisonMoyen: number | null;
            noteEvaluation: import(".prisma/client/runtime/library").Decimal | null;
            conditionsPaiement: string | null;
        } | null;
        mouvements: {
            id: string;
            createdAt: Date;
            type: string;
            quantite: import(".prisma/client/runtime/library").Decimal;
            motif: string | null;
        }[];
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        updatedAt: Date;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        delaiApprovisionnement: number | null;
        isRecycle: boolean;
    }>;
    creer(tenantId: string, dto: CreateMatierePremiereDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        updatedAt: Date;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        delaiApprovisionnement: number | null;
        isRecycle: boolean;
    }>;
    modifier(tenantId: string, id: string, dto: Partial<CreateMatierePremiereDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        updatedAt: Date;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        delaiApprovisionnement: number | null;
        isRecycle: boolean;
    }>;
    ajusterStock(tenantId: string, id: string, quantite: number, type: 'entree' | 'sortie' | 'ajustement', motif?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: string;
        reference: string;
        stockActuel: import(".prisma/client/runtime/library").Decimal;
        unite: string;
        stockMinimum: import(".prisma/client/runtime/library").Decimal;
        nom: string;
        updatedAt: Date;
        deletedAt: Date | null;
        fournisseurId: string | null;
        prixAchat: import(".prisma/client/runtime/library").Decimal;
        delaiApprovisionnement: number | null;
        isRecycle: boolean;
    }>;
    supprimer(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
