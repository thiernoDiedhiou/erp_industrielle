import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatierePremiereDto } from './dto/create-matiere-premiere.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class MatieresPremiereService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}

  async getListe(
    tenantId: string,
    opts: { page?: number; limite?: number; search?: string; critique?: boolean },
  ) {
    const { page = 1, limite = 20, search, critique } = opts;
    const skip = (page - 1) * limite;

    const where: any = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { reference: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.matierePremiere.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nom: 'asc' },
        include: {
          fournisseur: { select: { id: true, nom: true, reference: true } },
        },
      }),
      this.prisma.matierePremiere.count({ where }),
    ]);

    // Marquer les MP en rupture (stockActuel <= stockMinimum)
    const itemsAvecAlerte = items.map((mp) => ({
      ...mp,
      critique: Number(mp.stockActuel) <= Number(mp.stockMinimum),
    }));

    // Filtrer sur le critique si demandé
    const itemsFiltres = critique
      ? itemsAvecAlerte.filter((mp) => mp.critique)
      : itemsAvecAlerte;

    return { items: itemsFiltres, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getUne(tenantId: string, id: string) {
    const mp = await this.prisma.matierePremiere.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        fournisseur: true,
        mouvements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, type: true, quantite: true, motif: true, createdAt: true },
        },
      },
    });
    if (!mp) throw new NotFoundException('Matière première introuvable');
    return { ...mp, critique: Number(mp.stockActuel) <= Number(mp.stockMinimum) };
  }

  async creer(tenantId: string, dto: CreateMatierePremiereDto) {
    // Vérifier l'unicité de la référence parmi les MP non archivées
    const existe = await this.prisma.matierePremiere.findFirst({
      where: { tenantId, reference: dto.reference, deletedAt: null },
    });
    if (existe) throw new BadRequestException(`Référence "${dto.reference}" déjà utilisée`);

    return this.prisma.matierePremiere.create({
      data: { ...dto, tenantId, stockActuel: 0 },
    });
  }

  async modifier(tenantId: string, id: string, dto: Partial<CreateMatierePremiereDto>) {
    const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!mp) throw new NotFoundException('Matière première introuvable');
    return this.prisma.matierePremiere.update({ where: { id }, data: dto });
  }

  async ajusterStock(
    tenantId: string,
    id: string,
    quantite: number,
    type: 'entree' | 'sortie' | 'ajustement',
    motif?: string,
  ) {
    const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!mp) throw new NotFoundException('Matière première introuvable');

    const stockActuel = Number(mp.stockActuel);
    let nouveauStock: number;

    if (type === 'entree') {
      nouveauStock = stockActuel + quantite;
    } else if (type === 'sortie') {
      if (stockActuel < quantite) {
        throw new BadRequestException(`Stock insuffisant : ${stockActuel} ${mp.unite} disponibles`);
      }
      nouveauStock = stockActuel - quantite;
    } else {
      nouveauStock = quantite; // ajustement direct
    }

    const [mpMiseAJour] = await this.prisma.$transaction([
      this.prisma.matierePremiere.update({
        where: { id },
        data: { stockActuel: nouveauStock },
      }),
      this.prisma.mouvementStock.create({
        data: {
          tenantId,
          type,
          reference: `MVT-${Date.now()}`,
          matierePremiereId: id,
          quantite,
          motif: motif ?? type,
        },
      }),
    ]);

    // Déclencher une alerte si stock passe sous le seuil minimum
    if (nouveauStock <= Number(mp.stockMinimum)) {
      this.queue.alerterStock({
        tenantId,
        matiereId: id,
        matierenom: mp.nom,
        stockActuel: nouveauStock,
        stockMinimum: Number(mp.stockMinimum),
        unite: mp.unite,
      });
    }

    return mpMiseAJour;
  }

  async supprimer(tenantId: string, id: string) {
    const mp = await this.prisma.matierePremiere.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!mp) throw new NotFoundException('Matière première introuvable');

    if (Number(mp.stockActuel) > 0) {
      throw new BadRequestException("Impossible : stock actuel > 0. Ajuster d'abord le stock.");
    }

    // Soft delete — historique des mouvements conservé
    await this.prisma.matierePremiere.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Matière première archivée' };
  }
}
