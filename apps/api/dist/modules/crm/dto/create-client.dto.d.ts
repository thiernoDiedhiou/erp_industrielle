export declare const TYPES_CLIENT: readonly ["industriel", "agricole", "alimentaire", "distributeur", "autre"];
export declare class CreateClientDto {
    nom: string;
    type?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    ninea?: string;
    statut?: string;
    contact?: string;
    commercialId?: string;
    plafondCredit?: number;
    delaiPaiement?: number;
}
