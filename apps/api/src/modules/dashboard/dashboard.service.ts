import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(tenantId: string) {
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const [
      commandesMois,
      commandesParStatut,
      chiffreAffairesMois,
      ofsActifs,
      alertesStock,
      clientsTotal,
      recyclageTotal,
    ] = await Promise.all([
      // Commandes créées ce mois
      this.prisma.commande.count({
        where: { tenantId, createdAt: { gte: debutMois } },
      }),

      // Répartition des commandes par statut
      this.prisma.commande.groupBy({
        by: ['statut'],
        where: { tenantId },
        _count: { id: true },
      }),

      // CA du mois (factures payées)
      this.prisma.facture.aggregate({
        where: { tenantId, statut: 'payee', createdAt: { gte: debutMois } },
        _sum: { totalTTC: true },
      }),

      // OFs en cours de production
      this.prisma.ordreFabrication.count({
        where: { tenantId, statut: 'en_cours' },
      }),

      // Matières en dessous du seuil
      this.prisma.matierePremiere.count({
        where: {
          tenantId,
          stockActuel: { lte: 0 },
        },
      }),

      // Total clients
      this.prisma.client.count({ where: { tenantId } }),

      // Collectes recyclage ce mois
      this.prisma.recyclageCollecte.count({
        where: { tenantId, dateCollecte: { gte: debutMois } },
      }),
    ]);

    return {
      commandesMois,
      commandesParStatut: commandesParStatut.reduce(
        (acc: Record<string, number>, g: { statut: string; _count: { id: number } }) =>
        ({ ...acc, [g.statut]: g._count.id }),
        {} as Record<string, number>,
      ),
      chiffreAffairesMois: chiffreAffairesMois._sum.totalTTC || 0,
      ofsActifs,
      alertesStock,
      clientsTotal,
      recyclageCollectesMois: recyclageTotal,
    };
  }

  // Activité récente toutes entités confondues
  async getActiviteRecente(tenantId: string, limite = 10) {
    const [dernieresCommandes, derniersOfs] = await Promise.all([
      this.prisma.commande.findMany({
        where: { tenantId },
        take: Math.ceil(limite / 2),
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          reference: true,
          statut: true,
          updatedAt: true,
          client: { select: { nom: true } },
        },
      }),
      this.prisma.ordreFabrication.findMany({
        where: { tenantId },
        take: Math.floor(limite / 2),
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          reference: true,
          statut: true,
          produitFini: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      commandes: dernieresCommandes,
      ordresFabrication: derniersOfs,
    };
  }

  // CA mensuel sur 12 mois glissants
  async getCaMensuel(tenantId: string) {
    const mois: { mois: string; ca: number; nbFactures: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const agg = await this.prisma.facture.aggregate({
        where: {
          tenantId,
          statut: 'payee',
          createdAt: { gte: debut, lte: fin },
        },
        _sum: { totalTTC: true },
        _count: { id: true },
      });

      mois.push({
        mois: debut.toLocaleDateString('fr-SN', { month: 'short', year: '2-digit' }),
        ca: Number(agg._sum.totalTTC ?? 0),
        nbFactures: agg._count.id,
      });
    }
    return mois;
  }

  // Évolution du stock des 10 matières premières les plus critiques
  async getStockCritique(tenantId: string) {
    const matieres = await this.prisma.matierePremiere.findMany({
      where: { tenantId },
      select: {
        id: true,
        nom: true,
        stockActuel: true,
        stockMinimum: true,
        unite: true,
      },
      orderBy: { stockActuel: 'asc' },
      take: 10,
    });

    return matieres.map((m) => ({
      nom: m.nom.length > 15 ? m.nom.substring(0, 15) + '…' : m.nom,
      stockActuel: Number(m.stockActuel),
      stockMinimum: Number(m.stockMinimum),
      unite: m.unite,
      critique: Number(m.stockActuel) <= Number(m.stockMinimum),
    }));
  }

  // Répartition commandes par statut (donut)
  async getCommandesParStatut(tenantId: string) {
    const groupes = await this.prisma.commande.groupBy({
      by: ['statut'],
      where: { tenantId },
      _count: { id: true },
    });

    const COULEURS: Record<string, string> = {
      brouillon: '#94a3b8',
      confirmee: '#3b82f6',
      en_production: '#f59e0b',
      livree: '#10b981',
      facturee: '#8b5cf6',
      annulee: '#ef4444',
    };

    return groupes.map((g) => ({
      statut: g.statut,
      count: g._count.id,
      couleur: COULEURS[g.statut] ?? '#6b7280',
    }));
  }

  // Top 5 clients par CA
  async getTopClients(tenantId: string) {
    const commandes = await this.prisma.commande.groupBy({
      by: ['clientId'],
      where: { tenantId, statut: { notIn: ['annulee', 'brouillon'] } },
      _sum: { totalTTC: true },
      orderBy: { _sum: { totalTTC: 'desc' } },
      take: 5,
    });

    const clientIds = commandes.map((c) => c.clientId);
    const clients = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, nom: true },
    });

    const nomMap = Object.fromEntries(clients.map((c) => [c.id, c.nom]));

    return commandes.map((c) => ({
      nom: (nomMap[c.clientId] ?? 'Inconnu').substring(0, 18),
      ca: Number(c._sum.totalTTC ?? 0),
    }));
  }
}
