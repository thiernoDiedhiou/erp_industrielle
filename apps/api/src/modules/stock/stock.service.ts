import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // Tableau de bord produits finis avec alertes
  async getProduitsFinis(tenantId: string) {
    const produits = await this.prisma.produit.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        nom: true,
        reference: true,
        stockActuel: true,
        stockMin: true,
        unite: true,
      },
      orderBy: { nom: 'asc' },
    });

    const alertes = produits.filter(
      (p) => Number(p.stockActuel) <= Number(p.stockMin ?? 0),
    );

    return { produits, alertes };
  }

  // Ajustement inventaire produit fini
  async ajustementInventairePF(
    tenantId: string,
    produitId: string,
    stockReel: number,
    motif: string,
  ) {
    const produit = await this.prisma.produit.findFirst({
      where: { id: produitId, tenantId },
    });
    if (!produit) throw new NotFoundException('Produit introuvable');

    const difference = stockReel - Number(produit.stockActuel);
    const type = difference >= 0 ? 'ajustement_positif' : 'ajustement_negatif';

    return this.prisma.$transaction(async (tx) => {
      await tx.produit.update({
        where: { id: produitId },
        data: { stockActuel: stockReel },
      });

      return tx.mouvementStock.create({
        data: {
          tenantId,
          type,
          reference: `INV-${Date.now()}`,
          produitId,
          quantite: Math.abs(difference),
          motif,
        },
      });
    });
  }

  // CRUD Produits finis ──────────────────────────────────────────────────────

  async creerProduit(tenantId: string, dto: {
    nom: string; reference?: string; unite?: string;
    stockMin?: number; prixUnitaire?: number; categorie?: string; description?: string;
  }) {
    const reference = dto.reference?.trim() || `PROD-${Date.now()}`;
    const existant = await this.prisma.produit.findFirst({ where: { tenantId, reference } });
    if (existant) throw new BadRequestException(`Référence "${reference}" déjà utilisée`);
    return this.prisma.produit.create({
      data: {
        tenantId,
        nom: dto.nom,
        reference,
        unite: dto.unite ?? 'pce',
        stockMin: dto.stockMin ?? 0,
        prixUnitaire: dto.prixUnitaire ?? 0,
        categorie: dto.categorie ?? 'standard',
        description: dto.description,
      },
    });
  }

  async modifierProduit(tenantId: string, id: string, dto: {
    nom?: string; unite?: string; stockMin?: number;
    prixUnitaire?: number; categorie?: string; description?: string;
  }) {
    const produit = await this.prisma.produit.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!produit) throw new NotFoundException('Produit introuvable');
    return this.prisma.produit.update({ where: { id }, data: dto });
  }

  async supprimerProduit(tenantId: string, id: string) {
    const produit = await this.prisma.produit.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!produit) throw new NotFoundException('Produit introuvable');
    const enCommande = await this.prisma.ligneCommande.count({ where: { produitId: id } });
    if (enCommande > 0) throw new BadRequestException('Impossible : produit lié à des commandes');
    return this.prisma.produit.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // Tableau de bord stock avec alertes
  async getTableauBord(tenantId: string) {
    const matieres = await this.prisma.matierePremiere.findMany({
      where: { tenantId },
      select: {
        id: true,
        nom: true,
        reference: true,
        stockActuel: true,
        stockMinimum: true,
        unite: true,
        fournisseur: { select: { nom: true } },
      },
      orderBy: { nom: 'asc' },
    });

    // Calculer les alertes côté application
    const alertes = matieres.filter((m: typeof matieres[0]) => {
      const actuel = Number(m.stockActuel);
      const minimum = Number(m.stockMinimum ?? 0);
      return actuel <= minimum;
    });

    return { matieres, alertes };
  }

  // Mouvements de stock avec pagination
  async getMouvements(
    tenantId: string,
    opts: { page?: number; limite?: number; type?: string; matiereId?: string },
  ) {
    const { page = 1, limite = 30, type, matiereId } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      ...(type ? { type } : {}),
      ...(matiereId ? { matierePremiereId: matiereId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mouvementStock.findMany({
        where,
        skip,
        take: limite,
        include: {
          matierePremiere: { select: { nom: true, unite: true } },
          produit: { select: { nom: true, reference: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mouvementStock.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  // Entrée de stock (réception fournisseur)
  async entreeStock(tenantId: string, data: {
    matierePremiereId: string;
    quantite: number;
    reference?: string;
    motif?: string;
    fournisseurId?: string;
  }) {
    const mp = await this.prisma.matierePremiere.findFirst({
      where: { id: data.matierePremiereId, tenantId },
    });
    if (!mp) throw new NotFoundException('Matière première introuvable');

    return this.prisma.$transaction(async (tx) => {
      await tx.matierePremiere.update({
        where: { id: data.matierePremiereId },
        data: { stockActuel: { increment: data.quantite } },
      });

      return tx.mouvementStock.create({
        data: {
          tenantId,
          type: 'entree',
          reference: data.reference || `ENT-${Date.now()}`,
          matierePremiereId: data.matierePremiereId,
          quantite: data.quantite,
          motif: data.motif || 'Réception fournisseur',
          fournisseurId: data.fournisseurId,
        },
      });
    });
  }

  // Inventaire : ajuster le stock à une valeur réelle
  async ajustementInventaire(tenantId: string, matiereId: string, stockReel: number, motif: string) {
    const mp = await this.prisma.matierePremiere.findFirst({
      where: { id: matiereId, tenantId },
    });
    if (!mp) throw new NotFoundException('Matière première introuvable');

    const difference = stockReel - Number(mp.stockActuel);
    const type = difference >= 0 ? 'ajustement_positif' : 'ajustement_negatif';

    return this.prisma.$transaction(async (tx) => {
      await tx.matierePremiere.update({
        where: { id: matiereId },
        data: { stockActuel: stockReel },
      });

      return tx.mouvementStock.create({
        data: {
          tenantId,
          type,
          reference: `INV-${Date.now()}`,
          matierePremiereId: matiereId,
          quantite: Math.abs(difference),
          motif,
        },
      });
    });
  }
}
