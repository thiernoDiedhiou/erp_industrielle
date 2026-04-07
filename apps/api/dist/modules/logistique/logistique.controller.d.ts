import { LogistiqueService } from './logistique.service';
import { CreateBonLivraisonDto } from './dto/create-bon-livraison.dto';
import { JwtPayload } from '@saas-erp/shared';
export declare class LogistiqueController {
    private logistiqueService;
    constructor(logistiqueService: LogistiqueService);
    getStats(user: JwtPayload): Promise<{
        prepare: number;
        expedie: number;
        livre: number;
        annule: number;
    }>;
    getListe(user: JwtPayload, page?: number, limite?: number, search?: string, statut?: string): Promise<{
        items: ({
            client: {
                id: string;
                nom: string;
                ville: string | null;
            };
            commande: {
                id: string;
                reference: string;
            } | null;
            _count: {
                lignes: number;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            reference: string;
            updatedAt: Date;
            statut: string;
            clientId: string;
            dateLivraison: Date | null;
            notes: string | null;
            commandeId: string | null;
            adresseLivraison: string | null;
            transporteur: string | null;
            dateExpedition: Date | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUn(user: JwtPayload, id: string): Promise<{
        client: {
            id: string;
            tenantId: string;
            createdAt: Date;
            type: string;
            reference: string;
            nom: string;
            email: string | null;
            telephone: string | null;
            adresse: string | null;
            ville: string | null;
            updatedAt: Date;
            deletedAt: Date | null;
            ninea: string | null;
            statut: string;
        };
        commande: {
            id: string;
            reference: string;
        } | null;
        lignes: ({
            produit: {
                id: string;
                reference: string;
                unite: string;
                nom: string;
            };
        } & {
            id: string;
            description: string | null;
            produitId: string;
            quantite: import(".prisma/client/runtime/library").Decimal;
            bonLivraisonId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        clientId: string;
        dateLivraison: Date | null;
        notes: string | null;
        commandeId: string | null;
        adresseLivraison: string | null;
        transporteur: string | null;
        dateExpedition: Date | null;
    }>;
    creer(user: JwtPayload, dto: CreateBonLivraisonDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        clientId: string;
        dateLivraison: Date | null;
        notes: string | null;
        commandeId: string | null;
        adresseLivraison: string | null;
        transporteur: string | null;
        dateExpedition: Date | null;
    }>;
    modifier(user: JwtPayload, id: string, dto: Partial<CreateBonLivraisonDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        clientId: string;
        dateLivraison: Date | null;
        notes: string | null;
        commandeId: string | null;
        adresseLivraison: string | null;
        transporteur: string | null;
        dateExpedition: Date | null;
    }>;
    changerStatut(user: JwtPayload, id: string, statut: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        reference: string;
        updatedAt: Date;
        statut: string;
        clientId: string;
        dateLivraison: Date | null;
        notes: string | null;
        commandeId: string | null;
        adresseLivraison: string | null;
        transporteur: string | null;
        dateExpedition: Date | null;
    }>;
}
