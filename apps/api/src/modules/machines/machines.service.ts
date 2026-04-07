import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async getListe(tenantId: string, opts: { page?: number; limite?: number; search?: string; statut?: string }) {
    const { page = 1, limite = 20, search, statut } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      deletedAt: null,
      ...(statut ? { statut } : {}),
      ...(search
        ? {
            OR: [
              { nom: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.machine.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nom: 'asc' },
        include: {
          _count: { select: { ofs: true } },
        },
      }),
      this.prisma.machine.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getUne(tenantId: string, id: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        ofs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, reference: true, statut: true, produitFini: true, createdAt: true },
        },
      },
    });
    if (!machine) throw new NotFoundException('Machine introuvable');
    return machine;
  }

  async creer(tenantId: string, dto: CreateMachineDto) {
    // Vérifier l'unicité du code parmi les machines non archivées
    const existe = await this.prisma.machine.findFirst({ where: { tenantId, code: dto.code, deletedAt: null } });
    if (existe) throw new BadRequestException(`Code machine "${dto.code}" déjà utilisé`);

    return this.prisma.machine.create({
      data: { ...dto, tenantId, statut: 'disponible' },
    });
  }

  async modifier(tenantId: string, id: string, dto: Partial<CreateMachineDto>) {
    const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!machine) throw new NotFoundException('Machine introuvable');
    return this.prisma.machine.update({ where: { id }, data: dto });
  }

  async changerStatut(tenantId: string, id: string, statut: string) {
    const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!machine) throw new NotFoundException('Machine introuvable');
    return this.prisma.machine.update({ where: { id }, data: { statut } });
  }

  async supprimer(tenantId: string, id: string) {
    const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!machine) throw new NotFoundException('Machine introuvable');

    // Vérifier qu'aucun OF actif n'utilise cette machine
    const ofsActifs = await this.prisma.ordreFabrication.count({
      where: { machineId: id, tenantId, statut: { notIn: ['termine', 'annule'] } },
    });
    if (ofsActifs > 0) {
      throw new BadRequestException(`Impossible : ${ofsActifs} OF(s) en cours sur cette machine`);
    }

    // Soft delete — historique de production conservé
    await this.prisma.machine.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Machine archivée' };
  }
}
