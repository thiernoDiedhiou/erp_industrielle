import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class FacturationService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private notifications: NotificationsService,
    private queue: QueueService,
  ) {}

  async getPaiements(tenantId: string, opts: { page?: number; limite?: number }) {
    const { page = 1, limite = 30 } = opts;
    const skip = (page - 1) * limite;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.paiement.findMany({
        where: { facture: { tenantId } },
        skip,
        take: limite,
        orderBy: { datePaiement: 'desc' },
        include: {
          facture: {
            select: {
              reference: true,
              commande: { select: { client: { select: { nom: true } } } },
            },
          },
        },
      }),
      this.prisma.paiement.count({ where: { facture: { tenantId } } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getFactures(tenantId: string, opts: { page?: number; limite?: number; statut?: string }) {
    const { page = 1, limite = 20, statut } = opts;
    const skip = (page - 1) * limite;

    const where = { tenantId, ...(statut ? { statut } : {}) };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.facture.findMany({
        where,
        skip,
        take: limite,
        include: {
          commande: {
            select: {
              reference: true,
              client: { select: { nom: true, email: true } },
            },
          },
          paiements: { select: { montant: true, datePaiement: true, mode: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.facture.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getFacture(tenantId: string, id: string) {
    const facture = await this.prisma.facture.findFirst({
      where: { id, tenantId },
      include: {
        commande: {
          include: {
            client: true,
            lignes: { include: { produit: true } },
          },
        },
        paiements: true,
      },
    });
    if (!facture) throw new NotFoundException('Facture introuvable');
    return facture;
  }

  // Génère une facture depuis une commande
  async creerDepuisCommande(tenantId: string, commandeId: string) {
    const commande = await this.prisma.commande.findFirst({
      where: { id: commandeId, tenantId },
    });

    if (!commande) throw new NotFoundException('Commande introuvable');
    if (commande.statut !== 'livree') {
      throw new BadRequestException('La commande doit être livrée avant facturation');
    }

    // Vérifier qu'il n'existe pas déjà une facture
    const factureExistante = await this.prisma.facture.findFirst({
      where: { commandeId, tenantId },
    });
    if (factureExistante) {
      throw new BadRequestException('Une facture existe déjà pour cette commande');
    }

    const reference = await this.genererReference(tenantId);
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30); // 30 jours

    return this.prisma.$transaction(async (tx) => {
      const facture = await tx.facture.create({
        data: {
          reference,
          tenantId,
          commandeId,
          statut: 'emise',
          totalHT: commande.totalHT,
          tva: commande.tva,
          totalTTC: commande.totalTTC,
          dateEcheance: echeance,
        },
      });

      // Passer la commande en "facturee"
      await tx.commande.update({
        where: { id: commandeId },
        data: { statut: 'facturee' },
      });

      // Charger le client pour l'email
      const commandeAvecClient = await tx.commande.findFirst({
        where: { id: commandeId },
        include: { client: true },
      });

      // Envoyer l'email de facture via RabbitMQ (asynchrone, ne bloque pas)
      if (commandeAvecClient?.client.email) {
        this.queue.envoyerEmail({
          to: commandeAvecClient.client.email,
          subject: `Facture ${reference} — GISAC`,
          template: 'facture',
          tenantId,
          data: {
            reference,
            montant: new Intl.NumberFormat('fr-SN').format(Number(commande.totalTTC)),
            echeance: echeance.toLocaleDateString('fr-SN'),
            client: commandeAvecClient.client.nom,
          },
        });
      }

      return facture;
    });
  }

  async enregistrerPaiement(tenantId: string, factureId: string, data: {
    montant: number;
    mode: string;
    reference?: string;
    notes?: string;
  }) {
    const facture = await this.prisma.facture.findFirst({
      where: { id: factureId, tenantId },
      include: { paiements: true },
    });
    if (!facture) throw new NotFoundException('Facture introuvable');
    if (facture.statut === 'payee') {
      throw new BadRequestException('Facture déjà entièrement payée');
    }

    const totalPaye = facture.paiements.reduce((sum: number, p: { montant: { toNumber(): number } | number }) => sum + Number(p.montant), 0);
    const restantDu = Number(facture.totalTTC) - totalPaye;

    if (data.montant > restantDu) {
      throw new BadRequestException(
        `Montant (${data.montant}) supérieur au restant dû (${restantDu})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const paiement = await tx.paiement.create({
        data: {
          factureId,
          tenantId,
          montant: data.montant,
          mode: data.mode,
          reference: data.reference,
          notes: data.notes,
          datePaiement: new Date(),
        },
      });

      // Passer la facture en "payee" si soldée
      const nouveauTotal = totalPaye + data.montant;
      if (nouveauTotal >= Number(facture.totalTTC)) {
        await tx.facture.update({
          where: { id: factureId },
          data: { statut: 'payee' },
        });
      } else {
        await tx.facture.update({
          where: { id: factureId },
          data: { statut: 'partiellement_payee' },
        });
      }

      // Notification async via RabbitMQ (pour futurs consommateurs : comptabilité, etc.)
      this.queue.notifier({
        tenantId,
        type: 'paiement_recu',
        titre: 'Paiement reçu',
        message: `Paiement de ${data.montant} FCFA sur ${facture.reference}`,
        data: { factureId, montant: data.montant, mode: data.mode },
      });

      return paiement;
    }).then((paiement) => {
      // Notification SSE hors transaction — fire-and-forget non bloquant
      this.notifications.paiementRecu(tenantId, facture.reference, data.montant, factureId).catch(() => {});
      return paiement;
    });
  }

  // Stats facturation pour reporting
  async getStats(tenantId: string) {
    const [chiffreAffaires, impayees, parStatut] = await Promise.all([
      this.prisma.facture.aggregate({
        where: { tenantId, statut: 'payee' },
        _sum: { totalTTC: true },
      }),
      this.prisma.facture.findMany({
        where: { tenantId, statut: { in: ['emise', 'partiellement_payee'] } },
        select: { id: true, reference: true, totalTTC: true, dateEcheance: true },
        orderBy: { dateEcheance: 'asc' },
      }),
      this.prisma.facture.groupBy({
        by: ['statut'],
        where: { tenantId },
        _count: { id: true },
        _sum: { totalTTC: true },
      }),
    ]);

    return {
      chiffreAffaires: chiffreAffaires._sum.totalTTC || 0,
      nombreImpayees: impayees.length,
      montantImpaye: impayees.reduce((sum: number, f: { totalTTC: { toNumber(): number } | number }) => sum + Number(f.totalTTC), 0),
      parStatut,
    };
  }

  async genererPdf(tenantId: string, factureId: string): Promise<Buffer> {
    const facture = await this.prisma.facture.findFirst({
      where: { id: factureId, tenantId },
      include: {
        commande: {
          include: {
            client: true,
            lignes: { include: { produit: true } },
          },
        },
      },
    });
    if (!facture) throw new NotFoundException('Facture introuvable');

    const tenant = await this.prisma.tenant.findFirst({ where: { id: tenantId } });

    return this.pdfService.genererFacturePdf({
      reference: facture.reference,
      dateEmission: facture.createdAt,
      dateEcheance: facture.dateEcheance,
      statut: facture.statut,
      notes: facture.commande?.notes,
      client: {
        nom: facture.commande.client.nom,
        adresse: facture.commande.client.adresse,
        ville: facture.commande.client.ville,
        telephone: facture.commande.client.telephone,
        email: facture.commande.client.email,
        ninea: facture.commande.client.ninea,
      },
      tenant: {
        nom: tenant?.nom ?? 'ERP Industriel',
        adresse: tenant?.adresse,
        ville: tenant?.ville,
        telephone: tenant?.telephone,
      },
      lignes: facture.commande.lignes.map((l) => ({
        designation: l.produit.nom,
        quantite: Number(l.quantite),
        prixUnitaire: Number(l.prixUnitaire),
        montant: Number(l.montant),
      })),
      totalHT: Number(facture.totalHT),
      tva: Number(facture.tva),
      totalTTC: Number(facture.totalTTC),
    });
  }

  private async genererReference(tenantId: string): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.facture.count({
      where: { tenantId, reference: { startsWith: `FAC-${annee}` } },
    });
    return `FAC-${annee}-${String(count + 1).padStart(4, '0')}`;
  }
}
