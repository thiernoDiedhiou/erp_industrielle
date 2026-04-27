import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

// Transitions par défaut — utilisées si aucun workflow n'est configuré en BDD pour ce tenant
const TRANSITIONS_RECYCLAGE_DEFAUT: Record<string, string[]> = {
  collecte:   ['traitement', 'rejete'],
  traitement: ['valorise', 'rejete'],
  valorise:   [],
  rejete:     [],
};

@Injectable()
export class RecyclageService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getCollectes(tenantId: string, opts: { page?: number; limite?: number }) {
    const { page = 1, limite = 20 } = opts;
    const skip = (page - 1) * limite;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recyclageCollecte.findMany({
        where: { tenantId, deletedAt: null },
        skip,
        take: limite,
        orderBy: { dateCollecte: 'desc' },
        include: {
          matierePremiereCible: { select: { id: true, nom: true, unite: true } },
        },
      }),
      this.prisma.recyclageCollecte.count({ where: { tenantId, deletedAt: null } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async creerCollecte(tenantId: string, data: {
    typeDechet: string;
    quantite: number;
    unite?: string;
    sourceAdresse?: string;
    collecteur?: string;
    notes?: string;
    matierePremiereCibleId?: string;
  }) {
    return this.prisma.recyclageCollecte.create({
      data: {
        ...data,
        tenantId,
        statut: 'collecte',
        dateCollecte: new Date(),
      },
    });
  }

  async changerStatut(tenantId: string, id: string, statut: string) {
    const collecte = await this.prisma.recyclageCollecte.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!collecte) throw new NotFoundException('Collecte introuvable');

    // Validation de la transition (bloque aussi la double-valorisation : valorise → [] )
    const transitionsAutorisees = TRANSITIONS_RECYCLAGE_DEFAUT[collecte.statut] ?? [];
    if (!transitionsAutorisees.includes(statut)) {
      throw new BadRequestException(`Transition "${collecte.statut}" → "${statut}" non autorisée`);
    }

    // ── Valorisation : entrée stock MP recyclée ───────────────────────────────
    if (statut === 'valorise') {
      // 1. Lien explicite en priorité, fallback sur matching par nom
      let mpCible = collecte.matierePremiereCibleId
        ? await this.prisma.matierePremiere.findFirst({
            where: { id: collecte.matierePremiereCibleId, tenantId },
          })
        : await this.prisma.matierePremiere.findFirst({
            where: {
              tenantId,
              isRecycle: true,
              nom: { contains: collecte.typeDechet, mode: 'insensitive' },
            },
          });

      if (mpCible) {
        return this.prisma.$transaction(async (tx) => {
          const updated = await tx.recyclageCollecte.update({
            where: { id },
            data: { statut },
          });

          await tx.matierePremiere.update({
            where: { id: mpCible!.id },
            data: { stockActuel: { increment: Number(collecte.quantite) } },
          });

          await tx.mouvementStock.create({
            data: {
              tenantId,
              type: 'entree_recyclage',
              reference: `REC-${id.slice(-8).toUpperCase()}`,
              matierePremiereId: mpCible!.id,
              quantite: collecte.quantite,
              motif: `Valorisation recyclage — ${collecte.typeDechet}`,
            },
          });

          return updated;
        }).then((updated) => {
          this.notifications.emit({
            tenantId,
            type: 'info',
            titre: 'Recyclage valorisé',
            message: `${Number(collecte.quantite)} ${collecte.unite} de ${collecte.typeDechet} → stock ${mpCible!.nom} mis à jour`,
            data: { collecteId: id, mpId: mpCible!.id },
          }).catch(() => {});
          return updated;
        });
      }
    }

    const updated = await this.prisma.recyclageCollecte.update({
      where: { id },
      data: { statut },
    });

    // Notification pour les autres changements de statut
    this.notifications.emit({
      tenantId,
      type: 'info',
      titre: 'Collecte mise à jour',
      message: `Collecte ${collecte.typeDechet} : statut → ${statut}`,
      data: { collecteId: id, statut },
    }).catch(() => {});

    return updated;
  }

  async supprimerCollecte(tenantId: string, id: string) {
    const collecte = await this.prisma.recyclageCollecte.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!collecte) throw new NotFoundException('Collecte introuvable');

    // Soft delete — historique conservé
    await this.prisma.recyclageCollecte.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Collecte archivée' };
  }

  async getStats(tenantId: string) {
    const [totalCollectes, parType, parStatut] = await Promise.all([
      this.prisma.recyclageCollecte.aggregate({
        where: { tenantId, deletedAt: null },
        _sum: { quantite: true },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.groupBy({
        by: ['typeDechet'],
        where: { tenantId, deletedAt: null },
        _sum: { quantite: true },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.groupBy({
        by: ['statut'],
        where: { tenantId, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    return {
      totalCollectes: totalCollectes._count.id,
      totalQuantite: totalCollectes._sum.quantite || 0,
      parType,
      parStatut,
    };
  }
}
