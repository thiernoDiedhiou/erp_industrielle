import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  // ─── Clients ────────────────────────────────────────────────────────────────

  async getClients(tenantId: string, opts: { page?: number; limite?: number; search?: string }) {
    const { page = 1, limite = 20, search } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nom: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

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
      include: {
        commandes: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, reference: true, statut: true, totalHT: true, createdAt: true },
        },
      },
    });
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
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
