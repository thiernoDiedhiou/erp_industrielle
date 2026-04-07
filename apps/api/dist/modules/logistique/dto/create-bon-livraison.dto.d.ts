export declare class LigneLivraisonDto {
    produitId: string;
    quantite: number;
    description?: string;
}
export declare class CreateBonLivraisonDto {
    commandeId?: string;
    clientId: string;
    adresseLivraison?: string;
    transporteur?: string;
    dateExpedition?: string;
    notes?: string;
    lignes?: LigneLivraisonDto[];
}
