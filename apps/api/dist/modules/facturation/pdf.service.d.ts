interface LignePDF {
    designation: string;
    quantite: number;
    prixUnitaire: number;
    montant: number;
}
interface FacturePDF {
    reference: string;
    dateEmission: Date;
    dateEcheance: Date;
    client: {
        nom: string;
        adresse?: string | null;
        ville?: string | null;
        telephone?: string | null;
        email?: string | null;
        ninea?: string | null;
    };
    tenant: {
        nom: string;
        adresse?: string | null;
        ville?: string | null;
        telephone?: string | null;
    };
    lignes: LignePDF[];
    totalHT: number;
    tva: number;
    totalTTC: number;
    statut: string;
    notes?: string | null;
}
export declare class PdfService {
    genererFacturePdf(data: FacturePDF): Promise<Buffer>;
    private dessiner;
    private labelStatut;
    private fmt;
    private fmtDate;
    private sanitize;
}
export {};
