import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

export interface Notification {
  id: string;
  tenantId: string;
  type: 'alerte_stock' | 'statut_commande' | 'statut_of' | 'paiement_recu' | 'info';
  titre: string;
  message: string;
  data?: Record<string, unknown>;
  lue: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly stream$ = new Subject<Notification>();

  constructor(private prisma: PrismaService) {}

  // Émettre une notification — persiste en BDD puis diffuse via SSE
  async emit(notification: Omit<Notification, 'id' | 'lue' | 'createdAt'>) {
    const saved = await this.prisma.notification.create({
      data: {
        tenantId: notification.tenantId,
        type:     notification.type,
        titre:    notification.titre,
        message:  notification.message,
        data:     (notification.data ?? undefined) as object | undefined,
      },
    });

    this.stream$.next({
      id:        saved.id,
      tenantId:  saved.tenantId,
      type:      saved.type as Notification['type'],
      titre:     saved.titre,
      message:   saved.message,
      data:      (saved.data as Record<string, unknown>) ?? undefined,
      lue:       saved.lue,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  // SSE stream filtré par tenant
  getStreamForTenant(tenantId: string) {
    return this.stream$.pipe(
      filter((n) => n.tenantId === tenantId),
      map((n) => ({
        data: JSON.stringify({
          id:        n.id,
          type:      n.type,
          titre:     n.titre,
          message:   n.message,
          data:      n.data,
          lue:       false,
          createdAt: n.createdAt,
        }),
      })),
    );
  }

  // Historique des 50 dernières notifications persistées
  async getHistorique(tenantId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, type: true, titre: true, message: true, lue: true, createdAt: true },
    });
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesLues(tenantId: string) {
    await this.prisma.notification.updateMany({
      where: { tenantId, lue: false },
      data: { lue: true },
    });
  }

  // ─── Helpers métier ────────────────────────────────────────────────────────

  alerteStock(tenantId: string, matiere: string, stockActuel: number, unite: string, entityId?: string) {
    return this.emit({
      tenantId,
      type: 'alerte_stock',
      titre: 'Alerte stock',
      message: `Stock bas : ${matiere} — ${stockActuel} ${unite} restant(s)`,
      data: { matiere, stockActuel, unite, entityId },
    });
  }

  statutCommande(tenantId: string, reference: string, ancienStatut: string, nouveauStatut: string, entityId?: string) {
    return this.emit({
      tenantId,
      type: 'statut_commande',
      titre: 'Commande mise à jour',
      message: `Commande ${reference} : ${ancienStatut} → ${nouveauStatut}`,
      data: { reference, ancienStatut, nouveauStatut, entityId },
    });
  }

  statutOF(tenantId: string, reference: string, ancienStatut: string, nouveauStatut: string, entityId?: string) {
    return this.emit({
      tenantId,
      type: 'statut_of',
      titre: 'Ordre de fabrication mis à jour',
      message: `OF ${reference} : ${ancienStatut} → ${nouveauStatut}`,
      data: { reference, ancienStatut, nouveauStatut, entityId },
    });
  }

  paiementRecu(tenantId: string, factureRef: string, montant: number, entityId?: string) {
    return this.emit({
      tenantId,
      type: 'paiement_recu',
      titre: 'Paiement reçu',
      message: `Paiement de ${new Intl.NumberFormat('fr-SN').format(montant)} FCFA sur ${factureRef}`,
      data: { factureRef, montant, entityId },
    });
  }
}
