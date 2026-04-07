import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEngineService } from '../config-engine/config-engine.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommandeDto } from './dto/create-commande.dto';

@Injectable()
export class CommandesService {
  constructor(
    private prisma: PrismaService,
    private configEngine: ConfigEngineService,
    private notifications: NotificationsService,
  ) {}

  async getCommandes(
    tenantId: string,
    opts: { page?: number; limite?: number; statut?: string; clientId?: string },
  ) {
    const { page = 1, limite = 20, statut, clientId } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      ...(statut ? { statut } : {}),
      ...(clientId ? { clientId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.commande.findMany({
        where,
        skip,
        take: limite,
        include: {
          client: { select: { id: true, nom: true } },
          lignes: { include: { produit: { select: { nom: true, reference: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.commande.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getCommande(tenantId: string, id: string) {
    const commande = await this.prisma.commande.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        lignes: { include: { produit: true } },
        historique: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!commande) throw new NotFoundException('Commande introuvable');
    return commande;
  }

  async creerCommande(tenantId: string, userId: string, dto: CreateCommandeDto) {
    // Vérifier le client
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, tenantId },
    });
    if (!client) throw new NotFoundException('Client introuvable');

    // Calculer les montants
    let totalHT = 0;
    const lignesData: Array<{
      produitId: string;
      quantite: number;
      prixUnitaire: number;
      montant: number;
      description?: string;
    }> = [];

    for (const ligne of dto.lignes) {
      const produit = await this.prisma.produit.findFirst({
        where: { id: ligne.produitId, tenantId },
      });
      if (!produit) throw new NotFoundException(`Produit ${ligne.produitId} introuvable`);

      const montantLigne = ligne.quantite * ligne.prixUnitaire;
      totalHT += montantLigne;

      lignesData.push({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        montant: montantLigne,
        description: ligne.description,
      });
    }

    const tva = totalHT * 0.18; // TVA Sénégal 18%
    const totalTTC = totalHT + tva;

    // Générer une référence unique
    const reference = await this.genererReference(tenantId);

    // Créer la commande avec ses lignes en transaction
    return this.prisma.$transaction(async (tx) => {
      const commande = await tx.commande.create({
        data: {
          reference,
          tenantId,
          clientId: dto.clientId,
          statut: 'brouillon',
          dateLivraison: dto.dateLivraison ? new Date(dto.dateLivraison) : null,
          notes: dto.notes,
          totalHT,
          tva,
          totalTTC,
          lignes: { create: lignesData },
        },
        include: {
          client: { select: { nom: true } },
          lignes: { include: { produit: { select: { nom: true } } } },
        },
      });

      // Enregistrer l'historique
      await tx.commandeHistorique.create({
        data: {
          commandeId: commande.id,
          tenantId,
          userId,
          ancienStatut: null,
          nouveauStatut: 'brouillon',
          commentaire: 'Commande créée',
        },
      });

      return commande;
    });
  }

  async changerStatut(
    tenantId: string,
    id: string,
    userId: string,
    role: string,
    nouveauStatut: string,
    commentaire?: string,
  ) {
    const commande = await this.prisma.commande.findFirst({
      where: { id, tenantId },
    });
    if (!commande) throw new NotFoundException('Commande introuvable');

    // Vérifier la transition via le Config Engine
    const transitionAutorisee = await this.configEngine.verifierTransition(
      tenantId,
      'commande',
      commande.statut,
      nouveauStatut,
      role,
    );

    if (!transitionAutorisee) {
      throw new ForbiddenException(
        `Transition "${commande.statut}" → "${nouveauStatut}" non autorisée pour le rôle ${role}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.commande.update({
        where: { id },
        data: { statut: nouveauStatut },
      });

      await tx.commandeHistorique.create({
        data: {
          commandeId: id,
          tenantId,
          userId,
          ancienStatut: commande.statut,
          nouveauStatut,
          commentaire: commentaire || `Statut changé vers ${nouveauStatut}`,
        },
      });

      this.notifications.statutCommande(tenantId, commande.reference, commande.statut, nouveauStatut);

      return updated;
    });
  }

  async supprimerCommande(tenantId: string, id: string) {
    const commande = await this.prisma.commande.findFirst({
      where: { id, tenantId },
    });
    if (!commande) throw new NotFoundException('Commande introuvable');

    if (commande.statut !== 'brouillon') {
      throw new BadRequestException('Seules les commandes en brouillon peuvent être supprimées');
    }

    await this.prisma.$transaction([
      this.prisma.ligneCommande.deleteMany({ where: { commandeId: id } }),
      this.prisma.commandeHistorique.deleteMany({ where: { commandeId: id } }),
      this.prisma.commande.delete({ where: { id } }),
    ]);

    return { message: 'Commande supprimée' };
  }

  private async genererReference(tenantId: string): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.commande.count({
      where: { tenantId, reference: { startsWith: `CMD-${annee}` } },
    });
    const seq = String(count + 1).padStart(4, '0');
    return `CMD-${annee}-${seq}`;
  }
}
