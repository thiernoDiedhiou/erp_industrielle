import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  // ─── Ordres de fabrication ──────────────────────────────────────────────────

  async getOFs(tenantId: string, opts: { page?: number; limite?: number; statut?: string }) {
    const { page = 1, limite = 20, statut } = opts;
    const skip = (page - 1) * limite;

    const where = { tenantId, ...(statut ? { statut } : {}) };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ordreFabrication.findMany({
        where,
        skip,
        take: limite,
        include: {
          machine: { select: { nom: true, code: true } },
          consommations: {
            include: { matierePremiere: { select: { nom: true, unite: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ordreFabrication.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getOF(tenantId: string, id: string) {
    const of = await this.prisma.ordreFabrication.findFirst({
      where: { id, tenantId },
      include: {
        machine: true,
        consommations: {
          include: { matierePremiere: true },
        },
      },
    });
    if (!of) throw new NotFoundException('Ordre de fabrication introuvable');
    return of;
  }

  async creerOF(tenantId: string, userId: string, data: {
    commandeId?: string;
    machineId?: string;
    produitId: string;
    produitFini: string;
    quantitePrevue: number;
    dateDebut?: string;
    dateFin?: string;
    notes?: string;
  }) {
    const reference = await this.genererReferenceOF(tenantId);

    return this.prisma.ordreFabrication.create({
      data: {
        reference,
        tenantId,
        statut: 'planifie',
        produitId: data.produitId,
        produitFini: data.produitFini,
        quantitePrevue: data.quantitePrevue,
        ...(data.commandeId ? { commandeId: data.commandeId } : {}),
        ...(data.machineId ? { machineId: data.machineId } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
      },
    });
  }

  async changerStatutOF(tenantId: string, id: string, statut: string) {
    const of = await this.prisma.ordreFabrication.findFirst({ where: { id, tenantId } });
    if (!of) throw new NotFoundException('OF introuvable');

    const transitionsValides: Record<string, string[]> = {
      planifie: ['en_cours', 'annule'],
      en_cours: ['termine', 'en_pause'],
      en_pause: ['en_cours', 'annule'],
    };

    if (!transitionsValides[of.statut]?.includes(statut)) {
      throw new BadRequestException(
        `Transition "${of.statut}" → "${statut}" invalide`,
      );
    }

    const data: Record<string, unknown> = { statut };
    if (statut === 'en_cours' && !of.dateDebut) {
      data.dateDebut = new Date();
    }
    if (statut === 'termine') {
      data.dateFin = new Date();
    }

    return this.prisma.ordreFabrication.update({ where: { id }, data });
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
      // Enregistrer la consommation
      const consommation = await tx.consommationMP.create({
        data: {
          ordreFabricationId: ofId,
          matierePremiereId: data.matierePremiereId,
          tenantId,
          quantiteConsommee: data.quantiteConsommee,
        },
      });

      // Décrémenter le stock de la MP
      await tx.matierePremiere.update({
        where: { id: data.matierePremiereId },
        data: { stockActuel: { decrement: data.quantiteConsommee } },
      });

      // Enregistrer le mouvement de stock
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

  private async genererReferenceOF(tenantId: string): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.ordreFabrication.count({
      where: { tenantId, reference: { startsWith: `OF-${annee}` } },
    });
    return `OF-${annee}-${String(count + 1).padStart(4, '0')}`;
  }
}
