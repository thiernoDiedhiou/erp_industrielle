import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(tenantId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      commandesMois,
      commandesParStatut,
      caMois,
      caMoisPrecedent,
      ofsActifs,
      clientsTotal,
      facturesImpayees,
      matieresPourAlertes,
      mpCritiques,
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

      // CA du mois courant (factures payées)
      this.prisma.facture.aggregate({
        where: { tenantId, statut: 'payee', createdAt: { gte: debutMois } },
        _sum: { totalTTC: true },
      }),

      // CA mois précédent (pour tendance)
      this.prisma.facture.aggregate({
        where: {
          tenantId, statut: 'payee',
          createdAt: { gte: debutMoisPrecedent, lte: finMoisPrecedent },
        },
        _sum: { totalTTC: true },
      }),

      // OFs en cours de production
      this.prisma.ordreFabrication.count({
        where: { tenantId, statut: 'en_cours' },
      }),

      // Total clients actifs
      this.prisma.client.count({ where: { tenantId } }),

      // Factures impayées (émises non payées)
      this.prisma.facture.aggregate({
        where: { tenantId, statut: { in: ['emise', 'en_retard'] } },
        _sum: { totalTTC: true },
        _count: { id: true },
      }),

      // Matières pour calcul alertes (stock vs stockMinimum)
      this.prisma.matierePremiere.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, nom: true, stockActuel: true, stockMinimum: true, unite: true },
      }),

      // Top 5 MP les plus critiques (stock / minimum)
      this.prisma.matierePremiere.findMany({
        where: { tenantId, deletedAt: null },
        select: { nom: true, stockActuel: true, stockMinimum: true, unite: true },
        orderBy: { stockActuel: 'asc' },
        take: 5,
      }),
    ]);

    // Calcul alertes : stock actuel <= stock minimum
    const alertesStock = matieresPourAlertes.filter(
      (m) => Number(m.stockActuel) <= Number(m.stockMinimum),
    ).length;

    // Tendance CA
    const caCourant = Number(caMois._sum.totalTTC ?? 0);
    const caPrecedent = Number(caMoisPrecedent._sum.totalTTC ?? 0);
    const tendanceCa = caPrecedent > 0
      ? Math.round(((caCourant - caPrecedent) / caPrecedent) * 100)
      : null;

    return {
      commandesMois,
      commandesParStatut: commandesParStatut.reduce(
        (acc: Record<string, number>, g: { statut: string; _count: { id: number } }) =>
          ({ ...acc, [g.statut]: g._count.id }),
        {} as Record<string, number>,
      ),
      chiffreAffairesMois: caCourant,
      tendanceCa,
      ofsActifs,
      alertesStock,
      clientsTotal,
      facturesImpayeesCount: facturesImpayees._count.id,
      facturesImpayeesTotal: Number(facturesImpayees._sum.totalTTC ?? 0),
      mpCritiques: mpCritiques.map((m) => ({
        nom: m.nom.length > 20 ? m.nom.substring(0, 20) + '…' : m.nom,
        stockActuel: Number(m.stockActuel),
        stockMinimum: Number(m.stockMinimum),
        unite: m.unite,
        critique: Number(m.stockActuel) <= Number(m.stockMinimum),
      })),
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

  // CA mensuel — 12 mois glissants ou année fixe
  async getCaMensuel(tenantId: string, annee?: number) {
    const mois: { mois: string; ca: number; nbFactures: number }[] = [];
    const now = new Date();
    const anneeRef = annee ?? now.getFullYear();
    const nbMois = annee ? 12 : 12;

    for (let i = 0; i < nbMois; i++) {
      const debut = annee
        ? new Date(anneeRef, i, 1)
        : new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const fin = annee
        ? new Date(anneeRef, i + 1, 0, 23, 59, 59)
        : new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0, 23, 59, 59);

      const agg = await this.prisma.facture.aggregate({
        where: { tenantId, statut: 'payee', createdAt: { gte: debut, lte: fin } },
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

  // ─── Analytique commandes par mois + retards ─────────────────────────────

  async getCommandesAnalytique(tenantId: string, annee: number) {
    const moisData: { mois: string; commandes: number; montant: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const debut = new Date(annee, i, 1);
      const fin = new Date(annee, i + 1, 0, 23, 59, 59);
      const [count, agg] = await Promise.all([
        this.prisma.commande.count({ where: { tenantId, createdAt: { gte: debut, lte: fin } } }),
        this.prisma.commande.aggregate({
          where: { tenantId, createdAt: { gte: debut, lte: fin }, statut: { notIn: ['annulee', 'brouillon'] } },
          _sum: { totalTTC: true },
        }),
      ]);
      moisData.push({
        mois: debut.toLocaleDateString('fr-SN', { month: 'short' }),
        commandes: count,
        montant: Number(agg._sum.totalTTC ?? 0),
      });
    }

    const [totalAnnee, livrees, total] = await Promise.all([
      this.prisma.commande.count({ where: { tenantId, createdAt: { gte: new Date(annee, 0, 1), lte: new Date(annee, 11, 31, 23, 59, 59) } } }),
      this.prisma.commande.count({ where: { tenantId, statut: 'livree', createdAt: { gte: new Date(annee, 0, 1) } } }),
      this.prisma.commande.count({ where: { tenantId, statut: { notIn: ['brouillon', 'annulee'] }, createdAt: { gte: new Date(annee, 0, 1) } } }),
    ]);

    return {
      parMois: moisData,
      totalAnnee,
      tauxLivraison: total > 0 ? Math.round((livrees / total) * 100) : 0,
    };
  }

  // ─── Analytique production (OFs) ─────────────────────────────────────────

  async getProductionAnalytique(tenantId: string, annee: number) {
    const debutAnnee = new Date(annee, 0, 1);
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59);

    const [parStatut, parMoisRaw] = await Promise.all([
      this.prisma.ordreFabrication.groupBy({
        by: ['statut'],
        where: { tenantId, createdAt: { gte: debutAnnee, lte: finAnnee } },
        _count: { id: true },
      }),
      Promise.all(
        Array.from({ length: 12 }, (_, i) => {
          const d = new Date(annee, i, 1);
          const f = new Date(annee, i + 1, 0, 23, 59, 59);
          return this.prisma.ordreFabrication.count({ where: { tenantId, createdAt: { gte: d, lte: f } } })
            .then((count) => ({
              mois: d.toLocaleDateString('fr-SN', { month: 'short' }),
              ofs: count,
            }));
        }),
      ),
    ]);

    const LABELS_OF: Record<string, string> = {
      brouillon: 'Brouillon', planifie: 'Planifié', en_cours: 'En cours',
      termine: 'Terminé', annule: 'Annulé',
    };
    const COULEURS_OF: Record<string, string> = {
      brouillon: '#94a3b8', planifie: '#3b82f6', en_cours: '#f59e0b',
      termine: '#10b981', annule: '#ef4444',
    };

    const termines = parStatut.find((s) => s.statut === 'termine')?._count.id ?? 0;
    const totalHorsBrouillon = parStatut
      .filter((s) => s.statut !== 'brouillon')
      .reduce((acc, s) => acc + s._count.id, 0);

    return {
      parStatut: parStatut.map((s) => ({
        statut: s.statut,
        label: LABELS_OF[s.statut] ?? s.statut,
        count: s._count.id,
        couleur: COULEURS_OF[s.statut] ?? '#6b7280',
      })),
      parMois: parMoisRaw,
      tauxCompletion: totalHorsBrouillon > 0 ? Math.round((termines / totalHorsBrouillon) * 100) : 0,
      totalAnnee: parStatut.reduce((acc, s) => acc + s._count.id, 0),
    };
  }

  // ─── Analytique recyclage ─────────────────────────────────────────────────

  async getRecyclageAnalytique(tenantId: string, annee: number) {
    const debutAnnee = new Date(annee, 0, 1);
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59);

    const [parMoisRaw, parType, parStatut, totaux] = await Promise.all([
      Promise.all(
        Array.from({ length: 12 }, (_, i) => {
          const d = new Date(annee, i, 1);
          const f = new Date(annee, i + 1, 0, 23, 59, 59);
          return this.prisma.recyclageCollecte.aggregate({
            where: { tenantId, dateCollecte: { gte: d, lte: f } },
            _sum: { quantite: true },
            _count: { id: true },
          }).then((agg) => ({
            mois: d.toLocaleDateString('fr-SN', { month: 'short' }),
            quantite: Number(agg._sum.quantite ?? 0),
            collectes: agg._count.id,
          }));
        }),
      ),
      this.prisma.recyclageCollecte.groupBy({
        by: ['typeDechet'],
        where: { tenantId, dateCollecte: { gte: debutAnnee, lte: finAnnee } },
        _sum: { quantite: true },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.groupBy({
        by: ['statut'],
        where: { tenantId, dateCollecte: { gte: debutAnnee, lte: finAnnee } },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.aggregate({
        where: { tenantId, dateCollecte: { gte: debutAnnee, lte: finAnnee } },
        _sum: { quantite: true },
        _count: { id: true },
      }),
    ]);

    const valorise = parStatut.find((s) => s.statut === 'valorise')?._count.id ?? 0;
    const totalCollectes = totaux._count.id;

    return {
      parMois: parMoisRaw,
      parType: parType.map((t) => ({
        type: t.typeDechet,
        quantite: Number(t._sum.quantite ?? 0),
        count: t._count.id,
      })),
      totalQuantite: Number(totaux._sum.quantite ?? 0),
      totalCollectes,
      tauxValorisation: totalCollectes > 0 ? Math.round((valorise / totalCollectes) * 100) : 0,
    };
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
