import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface Notification {
  tenantId: string;
  type: 'alerte_stock' | 'statut_commande' | 'statut_of' | 'paiement_recu' | 'info';
  titre: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly stream$ = new Subject<Notification>();

  // Émettre une notification (appelé par les autres services)
  emit(notification: Omit<Notification, 'createdAt'>) {
    this.stream$.next({ ...notification, createdAt: new Date() });
  }

  // SSE stream filtré par tenant
  getStreamForTenant(tenantId: string) {
    return this.stream$.pipe(
      filter((n) => n.tenantId === tenantId),
      map((n) => ({
        data: JSON.stringify({
          type: n.type,
          titre: n.titre,
          message: n.message,
          data: n.data,
          createdAt: n.createdAt,
        }),
      })),
    );
  }

  // Vérification périodique des alertes stock (appelé via cron ou manuellement)
  alerteStock(tenantId: string, matiere: string, stockActuel: number, unite: string) {
    this.emit({
      tenantId,
      type: 'alerte_stock',
      titre: 'Alerte stock',
      message: `Stock bas : ${matiere} — ${stockActuel} ${unite} restant(s)`,
      data: { matiere, stockActuel, unite },
    });
  }

  statutCommande(tenantId: string, reference: string, ancienStatut: string, nouveauStatut: string) {
    this.emit({
      tenantId,
      type: 'statut_commande',
      titre: 'Commande mise à jour',
      message: `Commande ${reference} : ${ancienStatut} → ${nouveauStatut}`,
      data: { reference, ancienStatut, nouveauStatut },
    });
  }

  statutOF(tenantId: string, reference: string, nouveauStatut: string) {
    this.emit({
      tenantId,
      type: 'statut_of',
      titre: 'OF mis à jour',
      message: `OF ${reference} est maintenant : ${nouveauStatut}`,
      data: { reference, nouveauStatut },
    });
  }

  paiementRecu(tenantId: string, factureRef: string, montant: number) {
    this.emit({
      tenantId,
      type: 'paiement_recu',
      titre: 'Paiement reçu',
      message: `Paiement de ${new Intl.NumberFormat('fr-SN').format(montant)} FCFA sur ${factureRef}`,
      data: { factureRef, montant },
    });
  }
}
