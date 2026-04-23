import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  // ─── Clients ────────────────────────────────────────────────────────────────

  async getClients(tenantId: string, opts: { page?: number; limite?: number; search?: string; type?: string }) {
    const { page = 1, limite = 20, search, type } = opts;
    const skip = (page - 1) * limite;

    const where: any = { tenantId, deletedAt: null };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { ville: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getClient(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!client) throw new NotFoundException('Client introuvable');

    // Calcul des KPIs en parallèle
    const [commandesActives, caAggregate, facturesEncours] = await Promise.all([
      this.prisma.commande.count({
        where: { clientId: id, tenantId, statut: { notIn: ['livree', 'facturee', 'annulee'] } },
      }),
      this.prisma.commande.aggregate({
        where: { clientId: id, tenantId, statut: { in: ['livree', 'facturee'] } },
        _sum: { totalHT: true },
      }),
      this.prisma.facture.findMany({
        where: { tenantId, commande: { clientId: id }, statut: { notIn: ['payee', 'annulee'] } },
        select: { totalTTC: true, paiements: { select: { montant: true } } },
      }),
    ]);

    const totalCA = Number(caAggregate._sum.totalHT ?? 0);
    const encoursFactures = facturesEncours.reduce((sum, f) => {
      const paye = f.paiements.reduce((s, p) => s + Number(p.montant), 0);
      return sum + (Number(f.totalTTC) - paye);
    }, 0);

    return { ...client, totalCA, commandesActives, encoursFactures };
  }

  async creerClient(tenantId: string, dto: CreateClientDto) {
    // Générer une référence automatique si non fournie
    const reference = `CLI-${Date.now()}`;
    return this.prisma.client.create({
      data: { ...dto, tenantId, reference },
    });
  }

  async modifierClient(tenantId: string, id: string, dto: Partial<CreateClientDto>) {
    const client = await this.prisma.client.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!client) throw new NotFoundException('Client introuvable');

    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async supprimerClient(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!client) throw new NotFoundException('Client introuvable');

    // Vérifier pas de commandes actives
    const commandesActives = await this.prisma.commande.count({
      where: {
        clientId: id,
        tenantId,
        deletedAt: null,
        statut: { notIn: ['livree', 'facturee', 'annulee'] },
      },
    });

    if (commandesActives > 0) {
      throw new Error(`Impossible de supprimer : ${commandesActives} commande(s) en cours`);
    }

    // Soft delete — on n'efface jamais un client en ERP
    await this.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Client archivé' };
  }

  async getClientCommandes(tenantId: string, clientId: string, opts: { page?: number; limite?: number }) {
    const client = await this.prisma.client.findFirst({ where: { id: clientId, tenantId, deletedAt: null } });
    if (!client) throw new NotFoundException('Client introuvable');

    const { page = 1, limite = 20 } = opts;
    const skip = (page - 1) * limite;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.commande.findMany({
        where: { clientId, tenantId, deletedAt: null },
        skip,
        take: limite,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, reference: true, statut: true,
          totalHT: true, totalTTC: true, createdAt: true,
          dateLivraisonPrevue: true,
          _count: { select: { lignes: true } },
        },
      }),
      this.prisma.commande.count({ where: { clientId, tenantId, deletedAt: null } }),
    ]);

    const totalCA = await this.prisma.commande.aggregate({
      where: { clientId, tenantId, deletedAt: null, statut: { in: ['livree', 'facturee'] } },
      _sum: { totalHT: true },
    });

    return { items, total, page, totalPages: Math.ceil(total / limite), totalCA: Number(totalCA._sum.totalHT ?? 0) };
  }

  async getClientFactures(tenantId: string, clientId: string, opts: { page?: number; limite?: number }) {
    const client = await this.prisma.client.findFirst({ where: { id: clientId, tenantId, deletedAt: null } });
    if (!client) throw new NotFoundException('Client introuvable');

    const { page = 1, limite = 20 } = opts;
    const skip = (page - 1) * limite;

    // Les factures sont liées aux clients via commande.clientId
    const where = { tenantId, commande: { clientId } };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.facture.findMany({
        where,
        skip,
        take: limite,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, reference: true, statut: true,
          totalHT: true, totalTTC: true,
          dateEcheance: true, createdAt: true,
          paiements: { select: { montant: true } },
        },
      }),
      this.prisma.facture.count({ where }),
    ]);

    const itemsAvecPaye = items.map((f) => ({
      ...f,
      montantPaye: f.paiements.reduce((sum, p) => sum + Number(p.montant), 0),
      montantHT: Number(f.totalHT),
      montantTTC: Number(f.totalTTC),
      paiements: undefined,
    }));

    return { items: itemsAvecPaye, total, page, totalPages: Math.ceil(total / limite) };
  }

  // ─── Produits ───────────────────────────────────────────────────────────────

  async getProduits(tenantId: string, opts: { page?: number; limite?: number; search?: string }) {
    const { page = 1, limite = 20, search } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nom: { contains: search, mode: 'insensitive' as const } },
              { reference: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.produit.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.produit.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getProduit(tenantId: string, id: string) {
    const produit = await this.prisma.produit.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!produit) throw new NotFoundException('Produit introuvable');
    return produit;
  }

  async creerProduit(tenantId: string, data: {
    reference: string;
    nom: string;
    description?: string;
    unite?: string;
    prixUnitaire?: number;
    categorie?: string;
  }) {
    return this.prisma.produit.create({
      data: { ...data, tenantId, categorie: data.categorie ?? 'general' },
    });
  }

  async modifierProduit(tenantId: string, id: string, data: object) {
    const produit = await this.prisma.produit.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!produit) throw new NotFoundException('Produit introuvable');

    return this.prisma.produit.update({ where: { id }, data });
  }
}
