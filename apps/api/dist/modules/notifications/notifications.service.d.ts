export interface Notification {
    tenantId: string;
    type: 'alerte_stock' | 'statut_commande' | 'statut_of' | 'paiement_recu' | 'info';
    titre: string;
    message: string;
    data?: Record<string, unknown>;
    createdAt: Date;
}
export declare class NotificationsService {
    private readonly stream$;
    emit(notification: Omit<Notification, 'createdAt'>): void;
    getStreamForTenant(tenantId: string): import("rxjs").Observable<{
        data: string;
    }>;
    alerteStock(tenantId: string, matiere: string, stockActuel: number, unite: string): void;
    statutCommande(tenantId: string, reference: string, ancienStatut: string, nouveauStatut: string): void;
    statutOF(tenantId: string, reference: string, nouveauStatut: string): void;
    paiementRecu(tenantId: string, factureRef: string, montant: number): void;
}
