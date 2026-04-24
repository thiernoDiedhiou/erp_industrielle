import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBonLivraisonDto } from './dto/create-bon-livraison.dto';

@Injectable()
export class LogistiqueService {
  constructor(private prisma: PrismaService) {}

  async getListe(
    tenantId: string,
    opts: { page?: number; limite?: number; search?: string; statut?: string },
  ) {
    const { page = 1, limite = 20, search, statut } = opts;
    const skip = (page - 1) * limite;

    const where: any = { tenantId };
    if (statut) where.statut = statut;
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' as const } },
        { client: { nom: { contains: search, mode: 'insensitive' as const } } },
        { transporteur: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bonLivraison.findMany({
        where,
        skip,
        take: limite,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, nom: true, ville: true } },
          commande: { select: { id: true, reference: true } },
          _count: { select: { lignes: true } },
        },
      }),
      this.prisma.bonLivraison.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getUn(tenantId: string, id: string) {
    const bl = await this.prisma.bonLivraison.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        commande: { select: { id: true, reference: true } },
        lignes: {
          include: {
            produit: { select: { id: true, nom: true, reference: true, unite: true } },
          },
        },
      },
    });
    if (!bl) throw new NotFoundException('Bon de livraison introuvable');
    return bl;
  }

  async creer(tenantId: string, dto: CreateBonLivraisonDto) {
    const reference = `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    return this.prisma.$transaction(async (tx) => {
      const bl = await tx.bonLivraison.create({
        data: {
          tenantId,
          reference,
          clientId: dto.clientId,
          commandeId: dto.commandeId,
          adresseLivraison: dto.adresseLivraison,
          transporteur: dto.transporteur,
          chauffeur: dto.chauffeur,
          vehicule: dto.vehicule,
          dateExpedition: dto.dateExpedition ? new Date(dto.dateExpedition) : null,
          notes: dto.notes,
          statut: 'prepare',
        },
      });

      // Créer les lignes si fournies
      if (dto.lignes && dto.lignes.length > 0) {
        await tx.ligneLivraison.createMany({
          data: dto.lignes.map((l) => ({
            bonLivraisonId: bl.id,
            produitId: l.produitId,
            quantite: l.quantite,
            description: l.description,
          })),
        });
      }

      return bl;
    });
  }

  async changerStatut(tenantId: string, id: string, statut: string) {
    const bl = await this.prisma.bonLivraison.findFirst({ where: { id, tenantId } });
    if (!bl) throw new NotFoundException('Bon de livraison introuvable');

    const transitions: Record<string, string[]> = {
      prepare:  ['expedie', 'annule'],
      expedie:  ['livre', 'annule'],
      livre:    [],
      annule:   [],
    };

    if (!transitions[bl.statut]?.includes(statut)) {
      throw new BadRequestException(`Transition ${bl.statut} → ${statut} non autorisée`);
    }

    const data: any = { statut };
    if (statut === 'expedie') data.dateExpedition = new Date();
    if (statut === 'livre') data.dateLivraison = new Date();

    return this.prisma.bonLivraison.update({ where: { id }, data });
  }

  async modifier(tenantId: string, id: string, dto: Partial<CreateBonLivraisonDto>) {
    const bl = await this.prisma.bonLivraison.findFirst({ where: { id, tenantId } });
    if (!bl) throw new NotFoundException('Bon de livraison introuvable');
    if (bl.statut === 'livre' || bl.statut === 'annule') {
      throw new BadRequestException('Impossible de modifier un BL livré ou annulé');
    }

    const { lignes, dateExpedition, clientId, commandeId, ...rest } = dto;

    return this.prisma.bonLivraison.update({
      where: { id },
      data: {
        ...rest,
        ...(dateExpedition ? { dateExpedition: new Date(dateExpedition) } : {}),
      },
    });
  }

  async getStats(tenantId: string) {
    const [prepare, expedie, livre, annule] = await this.prisma.$transaction([
      this.prisma.bonLivraison.count({ where: { tenantId, statut: 'prepare' } }),
      this.prisma.bonLivraison.count({ where: { tenantId, statut: 'expedie' } }),
      this.prisma.bonLivraison.count({ where: { tenantId, statut: 'livre' } }),
      this.prisma.bonLivraison.count({ where: { tenantId, statut: 'annule' } }),
    ]);
    return { prepare, expedie, livre, annule };
  }
}
