import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecyclageService {
  constructor(private prisma: PrismaService) {}

  async getCollectes(tenantId: string, opts: { page?: number; limite?: number }) {
    const { page = 1, limite = 20 } = opts;
    const skip = (page - 1) * limite;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recyclageCollecte.findMany({
        where: { tenantId },
        skip,
        take: limite,
        orderBy: { dateCollecte: 'desc' },
      }),
      this.prisma.recyclageCollecte.count({ where: { tenantId } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async creerCollecte(tenantId: string, data: {
    typeDechet: string;
    quantite: number;
    unite?: string;
    sourceAdresse?: string;
    collecteur?: string;
    notes?: string;
  }) {
    return this.prisma.recyclageCollecte.create({
      data: { ...data, tenantId, statut: 'collecte', dateCollecte: new Date() },
    });
  }

  async changerStatut(tenantId: string, id: string, statut: string) {
    const collecte = await this.prisma.recyclageCollecte.findFirst({
      where: { id, tenantId },
    });
    if (!collecte) throw new NotFoundException('Collecte introuvable');

    return this.prisma.recyclageCollecte.update({ where: { id }, data: { statut } });
  }

  async getStats(tenantId: string) {
    const [totalCollectes, parType, parStatut] = await Promise.all([
      this.prisma.recyclageCollecte.aggregate({
        where: { tenantId },
        _sum: { quantite: true },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.groupBy({
        by: ['typeDechet'],
        where: { tenantId },
        _sum: { quantite: true },
        _count: { id: true },
      }),
      this.prisma.recyclageCollecte.groupBy({
        by: ['statut'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    return {
      totalCollectes: totalCollectes._count.id,
      totalQuantite: totalCollectes._sum.quantite || 0,
      parType,
      parStatut,
    };
  }
}
