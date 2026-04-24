import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@Injectable()
export class FournisseursService {
  constructor(private prisma: PrismaService) {}

  async getListe(tenantId: string, opts: { page?: number; limite?: number; search?: string }) {
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
      this.prisma.fournisseur.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nom: 'asc' },
        include: {
          _count: { select: { matieresPrmieres: true } },
        },
      }),
      this.prisma.fournisseur.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getUn(tenantId: string, id: string) {
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        matieresPrmieres: {
          take: 10,
          select: { id: true, nom: true, reference: true, stockActuel: true, unite: true },
        },
      },
    });
    if (!fournisseur) throw new NotFoundException('Fournisseur introuvable');
    // Renommer 'contact' → 'contactPrincipal' pour correspondre au DTO frontend
    const { contact, ...rest } = fournisseur as typeof fournisseur & { contact: string | null };
    return { ...rest, contactPrincipal: contact };
  }

  async creer(tenantId: string, dto: CreateFournisseurDto) {
    const reference = `FRN-${Date.now()}`;
    const { contactPrincipal, ...rest } = dto;
    return this.prisma.fournisseur.create({
      data: { ...rest, tenantId, reference, ...(contactPrincipal ? { contact: contactPrincipal } : {}) },
    });
  }

  async modifier(tenantId: string, id: string, dto: Partial<CreateFournisseurDto>) {
    const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!fournisseur) throw new NotFoundException('Fournisseur introuvable');
    const { contactPrincipal, ...rest } = dto;
    return this.prisma.fournisseur.update({
      where: { id },
      data: {
        ...rest,
        ...(contactPrincipal !== undefined ? { contact: contactPrincipal } : {}),
      },
    });
  }

  async supprimer(tenantId: string, id: string) {
    const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!fournisseur) throw new NotFoundException('Fournisseur introuvable');

    // Vérifier qu'aucune MP active n'est liée
    const mpCount = await this.prisma.matierePremiere.count({
      where: { fournisseurId: id, tenantId, deletedAt: null },
    });
    if (mpCount > 0) {
      throw new BadRequestException(`Impossible : ${mpCount} matière(s) première(s) liée(s)`);
    }

    // Soft delete — archivage comptable
    await this.prisma.fournisseur.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Fournisseur archivé' };
  }

  async toggleActif(tenantId: string, id: string) {
    const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!fournisseur) throw new NotFoundException('Fournisseur introuvable');
    return this.prisma.fournisseur.update({
      where: { id },
      data: { actif: !fournisseur.actif },
    });
  }
}
