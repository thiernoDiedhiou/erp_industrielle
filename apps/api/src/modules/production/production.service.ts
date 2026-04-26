import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BomService } from '../bom/bom.service';
import { ConfigEngineService } from '../config-engine/config-engine.service';
import { NotificationsService } from '../notifications/notifications.service';

// Transitions par défaut — utilisées si aucun workflow n'est configuré en BDD pour ce tenant
const TRANSITIONS_OF_DEFAUT: Record<string, string[]> = {
  planifie: ['en_cours', 'annule'],
  en_cours: ['termine', 'en_pause'],
  en_pause: ['en_cours', 'annule'],
};

@Injectable()
export class ProductionService {
  constructor(
    private prisma: PrismaService,
    private bomService: BomService,
    private configEngine: ConfigEngineService,
    private notifications: NotificationsService,
  ) {}

  // ─── Ordres de fabrication ──────────────────────────────────────────────────

  async getOFs(tenantId: string, opts: { page?: number; limite?: number; statut?: string }) {
    const { page = 1, limite = 20, statut } = opts;
    const skip = (page - 1) * limite;

    const where = { tenantId, ...(statut ? { statut } : {}) };

    const [items, total, compteurs] = await this.prisma.$transaction([
      this.prisma.ordreFabrication.findMany({
        where,
        skip,
        take: limite,
        include: {
          machine: { select: { nom: true, code: true } },
          commande: { select: { id: true, reference: true, client: { select: { nom: true } } } },
          consommations: {
            include: { matierePremiere: { select: { nom: true, unite: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ordreFabrication.count({ where }),
      this.prisma.ordreFabrication.groupBy({
        by: ['statut'],
        where: { tenantId },
        _count: { statut: true },
        orderBy: { statut: 'asc' },
      }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite), compteurs };
  }

  async getOF(tenantId: string, id: string) {
    const of = await this.prisma.ordreFabrication.findFirst({
      where: { id, tenantId },
      include: {
        machine: true,
        commande: { select: { id: true, reference: true, client: { select: { nom: true } } } },
        consommations: {
          include: { matierePremiere: true },
        },
      },
    });
    if (!of) throw new NotFoundException('Ordre de fabrication introuvable');
    return of;
  }

  async creerOF(tenantId: string, _userId: string, data: {
    commandeId?: string;
    machineId?: string;
    produitId: string;
    produitFini: string;
    quantitePrevue: number;
    dateDebutPrevue?: string;
    dateFinPrevue?: string;
    notes?: string;
  }) {
    const reference = await this.genererReferenceOF(tenantId);

    const of = await this.prisma.ordreFabrication.create({
      data: {
        reference,
        tenantId,
        statut: 'planifie',
        produitId: data.produitId,
        produitFini: data.produitFini,
        quantitePrevue: data.quantitePrevue,
        ...(data.commandeId ? { commandeId: data.commandeId } : {}),
        ...(data.machineId  ? { machineId:  data.machineId  } : {}),
        ...(data.notes      ? { notes:      data.notes      } : {}),
        dateDebutPrevue: data.dateDebutPrevue ? new Date(data.dateDebutPrevue) : null,
        dateFinPrevue:   data.dateFinPrevue   ? new Date(data.dateFinPrevue)   : null,
      },
      include: {
        machine: { select: { nom: true, code: true } },
        commande: { select: { id: true, reference: true } },
      },
    });

    // Joindre la nomenclature active du produit pour pré-remplissage UI
    let bomSuggeree: Awaited<ReturnType<BomService['getPourProduit']>> | null = null;
    try {
      bomSuggeree = await this.bomService.getPourProduit(tenantId, data.produitId);
    } catch {
      // Aucune BOM active — non bloquant à la création
    }

    return { ...of, bomSuggeree };
  }

  async changerStatutOF(
    tenantId: string,
    id: string,
    statut: string,
    quantiteProduite?: number,
    role = 'admin',
  ) {
    const of = await this.prisma.ordreFabrication.findFirst({
      where: { id, tenantId },
    });
    if (!of) throw new NotFoundException('OF introuvable');

    const workflowAutorise = await this.configEngine.verifierTransition(
      tenantId,
      'ordre_fabrication',
      of.statut,
      statut,
      role,
    );

    if (workflowAutorise === false) {
      // Workflow configuré mais transition refusée — on ne passe pas par le fallback
      throw new ForbiddenException(`Transition "${of.statut}" → "${statut}" non autorisée`);
    } else if (workflowAutorise === null) {
      // Aucun workflow configuré — fallback sur les transitions par défaut
      const transitionsDefaut = TRANSITIONS_OF_DEFAUT[of.statut] ?? [];
      if (!transitionsDefaut.includes(statut)) {
        throw new ForbiddenException(`Transition "${of.statut}" → "${statut}" non autorisée`);
      }
    }

    // ── Lancement : vérifier stocks MP via BOM avant de démarrer ─────────────
    if (statut === 'en_cours' && of.statut === 'planifie') {
      let bom: Awaited<ReturnType<BomService['getPourProduit']>> | null = null;
      try {
        bom = await this.bomService.getPourProduit(tenantId, of.produitId);
      } catch {
        // Pas de BOM active — vérification ignorée, l'opérateur saisira manuellement
      }

      if (bom && bom.items.length > 0) {
        const manquants: string[] = [];
        for (const item of bom.items) {
          if (!item.matierePremiere) continue;
          // Quantité nécessaire = quantité BOM × (1 + pertes%) × quantité OF prévue
          const qteNecessaire =
            Number(item.quantite) *
            (1 + Number(item.pertes) / 100) *
            Number(of.quantitePrevue);
          const stockDispo = Number(item.matierePremiere.stockActuel);
          if (stockDispo < qteNecessaire) {
            manquants.push(
              `${item.matierePremiere.nom} : ${stockDispo} ${item.matierePremiere.unite} disponible, ` +
              `${qteNecessaire.toFixed(3)} ${item.matierePremiere.unite} nécessaire`,
            );
          }
        }
        if (manquants.length > 0) {
          throw new BadRequestException(
            `Stocks matières premières insuffisants pour lancer l'OF :\n${manquants.join('\n')}`,
          );
        }
      }
    }

    const updateData: Record<string, unknown> = { statut };
    if (statut === 'en_cours' && !of.dateDebut) {
      updateData.dateDebut = new Date();
    }
    if (statut === 'termine') {
      updateData.dateFin = new Date();
      if (quantiteProduite !== undefined) updateData.quantiteProduite = quantiteProduite;
    }

    return this.prisma.$transaction(async (tx) => {
      const ofUpdated = await tx.ordreFabrication.update({
        where: { id },
        data: updateData,
      });

      // ── Statut machine lié à l'OF ─────────────────────────────────────────────
      if (of.machineId) {
        if (statut === 'en_cours') {
          await tx.machine.update({
            where: { id: of.machineId },
            data: { statut: 'en_production' },
          });
        } else if (statut === 'termine' || statut === 'annule') {
          await tx.machine.update({
            where: { id: of.machineId },
            data: { statut: 'disponible' },
          });
        }
      }

      // ── Clôture OF : impacts stock produit fini ──────────────────────────────
      if (statut === 'termine' && quantiteProduite && quantiteProduite > 0) {
        // 1. Incrémenter le stock du produit fini
        await tx.produit.update({
          where: { id: of.produitId },
          data: { stockActuel: { increment: quantiteProduite } },
        });

        // 2. Enregistrer le mouvement d'entrée en stock
        await tx.mouvementStock.create({
          data: {
            tenantId,
            type: 'entree_production',
            reference: `OF-${of.reference}`,
            produitId: of.produitId,
            quantite: quantiteProduite,
            motif: `Production OF ${of.reference}`,
          },
        });

        // 3. Vérifier si la commande liée peut passer à "prête"
        if (of.commandeId) {
          await this.verifierCommandePrete(tx, tenantId, of.commandeId);
        }
      }

      return ofUpdated;
    }).then((ofUpdated) => {
      // Notification SSE hors transaction (opération non bloquante)
      this.notifications.statutOF(tenantId, of.reference, of.statut, statut, id).catch(() => {});
      return ofUpdated;
    });
  }

  // ─── Consommation matières premières ───────────────────────────────────────

  async enregistrerConsommation(
    tenantId: string,
    ofId: string,
    data: { matierePremiereId: string; quantiteConsommee: number },
  ) {
    const of = await this.prisma.ordreFabrication.findFirst({ where: { id: ofId, tenantId } });
    if (!of) throw new NotFoundException('OF introuvable');

    const mp = await this.prisma.matierePremiere.findFirst({
      where: { id: data.matierePremiereId, tenantId },
    });
    if (!mp) throw new NotFoundException('Matière première introuvable');

    if (Number(mp.stockActuel) < data.quantiteConsommee) {
      throw new BadRequestException(
        `Stock insuffisant : ${mp.stockActuel} ${mp.unite} disponible, ${data.quantiteConsommee} demandé`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const consommation = await tx.consommationMP.create({
        data: {
          ordreFabricationId: ofId,
          matierePremiereId: data.matierePremiereId,
          tenantId,
          quantiteConsommee: data.quantiteConsommee,
        },
      });

      await tx.matierePremiere.update({
        where: { id: data.matierePremiereId },
        data: { stockActuel: { decrement: data.quantiteConsommee } },
      });

      await tx.mouvementStock.create({
        data: {
          tenantId,
          type: 'sortie',
          reference: `OF-${of.reference}`,
          matierePremiereId: data.matierePremiereId,
          quantite: data.quantiteConsommee,
          motif: `Consommation OF ${of.reference}`,
        },
      });

      return consommation;
    });
  }

  // ─── Machines ───────────────────────────────────────────────────────────────

  async getMachines(tenantId: string) {
    return this.prisma.machine.findMany({
      where: { tenantId },
      orderBy: { nom: 'asc' },
    });
  }

  async creerMachine(tenantId: string, data: {
    code: string;
    nom: string;
    type?: string;
    capacite?: number;
    unite?: string;
  }) {
    return this.prisma.machine.create({
      data: {
        code: data.code,
        nom: data.nom,
        type: data.type ?? 'autre',
        tenantId,
        statut: 'disponible',
        ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
        ...(data.unite ? { unite: data.unite } : {}),
      },
    });
  }

  // ─── Matières premières ─────────────────────────────────────────────────────

  async getMatieresPrmieres(tenantId: string, opts: { page?: number; limite?: number }) {
    const { page = 1, limite = 20 } = opts;
    const skip = (page - 1) * limite;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.matierePremiere.findMany({
        where: { tenantId },
        skip,
        take: limite,
        include: { fournisseur: { select: { nom: true } } },
        orderBy: { nom: 'asc' },
      }),
      this.prisma.matierePremiere.count({ where: { tenantId } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  // ─── Logique interne ────────────────────────────────────────────────────────

  // Vérifie si toutes les lignes de la commande sont couvertes par des OFs terminés
  // et fait passer la commande en "prête" automatiquement
  private async verifierCommandePrete(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    tenantId: string,
    commandeId: string,
  ) {
    const commande = await tx.commande.findFirst({
      where: { id: commandeId, tenantId, statut: 'en_production' },
      include: { lignes: true },
    });
    if (!commande) return;

    const ofsTermines = await tx.ordreFabrication.findMany({
      where: { commandeId, tenantId, statut: 'termine' },
      select: { produitId: true, quantiteProduite: true },
    });

    // Cumul par produit parmi les OFs terminés
    const produitMap: Record<string, number> = {};
    for (const of_ of ofsTermines) {
      produitMap[of_.produitId] = (produitMap[of_.produitId] ?? 0) + Number(of_.quantiteProduite);
    }

    const toutCouvert = commande.lignes.every(
      (l) => (produitMap[l.produitId] ?? 0) >= Number(l.quantite),
    );

    if (toutCouvert) {
      await tx.commande.update({
        where: { id: commandeId },
        data: { statut: 'prete' },
      });
    }
  }

  private async genererReferenceOF(tenantId: string): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.ordreFabrication.count({
      where: { tenantId, reference: { startsWith: `OF-${annee}` } },
    });
    return `OF-${annee}-${String(count + 1).padStart(4, '0')}`;
  }
}
