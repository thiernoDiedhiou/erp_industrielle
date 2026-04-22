export declare class BomItemDto {
    matierePremiereId?: string;
    produitId?: string;
    quantite: number;
    unite?: string;
    pertes?: number;
    notes?: string;
}
export declare class CreateBomDto {
    nom: string;
    produitFiniId: string;
    version?: string;
    actif?: boolean;
    notes?: string;
    items?: BomItemDto[];
}
