export declare class CreateMachineDto {
    code: string;
    nom: string;
    type: string;
    capacite?: number;
    unite?: string;
    actif?: boolean;
    localisation?: string;
    dateDerniereMaintenance?: string;
    prochaineMaintenanceDate?: string;
}
