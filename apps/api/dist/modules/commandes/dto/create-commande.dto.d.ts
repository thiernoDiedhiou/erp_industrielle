export declare class LigneCommandeDto {
    produitId: string;
    quantite: number;
    prixUnitaire: number;
    description?: string;
}
export declare class CreateCommandeDto {
    clientId: string;
    dateLivraison?: string;
    notes?: string;
    lignes: LigneCommandeDto[];
}
