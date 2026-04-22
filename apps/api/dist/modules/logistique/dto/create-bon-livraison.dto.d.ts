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
    chauffeur?: string;
    vehicule?: string;
    notes?: string;
    lignes?: LigneLivraisonDto[];
}
