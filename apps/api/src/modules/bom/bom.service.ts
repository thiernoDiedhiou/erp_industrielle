import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBomDto } from './dto/create-bom.dto';

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  // ─── Liste des nomenclatures ────────────────────────────────────────────────

  async getListe(
    tenantId: string,
    opts: { page?: number; limite?: number; search?: string; actif?: boolean },
  ) {
    const { page = 1, limite = 20, search, actif } = opts;
    const skip = (page - 1) * limite;

    const where: any = { tenantId };
    if (actif !== undefined) where.actif = actif;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { version: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bom.findMany({
        where,
        skip,
        take: limite,
        orderBy: { createdAt: 'desc' },
        include: {
          produitFini: { select: { id: true, nom: true, reference: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.bom.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  // ─── Détail d'une nomenclature ───────────────────────────────────────────────

  async getUn(tenantId: string, id: string) {
    const bom = await this.prisma.bom.findFirst({
      where: { id, tenantId },
      include: {
        produitFini: { select: { id: true, nom: true, reference: true } },
        items: {
          include: {
            matierePremiere: { select: { id: true, nom: true, reference: true, unite: true, prixAchat: true } },
            produit: { select: { id: true, nom: true, reference: true, unite: true } },
          },
        },
      },
    });
    if (!bom) throw new NotFoundException('Nomenclature introuvable');
    return bom;
  }

  // ─── Créer une nomenclature ──────────────────────────────────────────────────

  async creer(tenantId: string, dto: CreateBomDto) {
    // Vérifier unicité version/produit pour ce tenant
    const existe = await this.prisma.bom.findFirst({
      where: {
        tenantId,
        produitFiniId: dto.produitFiniId,
        version: dto.version ?? '1.0',
      },
    });
    if (existe) {
      throw new ConflictException(
        `Une nomenclature version ${dto.version ?? '1.0'} existe déjà pour ce produit`,
      );
    }

    const { items, ...bomData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const bom = await tx.bom.create({
        data: {
          tenantId,
          nom: bomData.nom,
          produitFiniId: bomData.produitFiniId,
          version: bomData.version ?? '1.0',
          actif: bomData.actif ?? true,
          notes: bomData.notes,
        },
      });

      if (items && items.length > 0) {
        await tx.bomItem.createMany({
          data: items.map((item) => ({
            bomId: bom.id,
            matierePremiereId: item.matierePremiereId,
            produitId: item.produitId,
            quantite: item.quantite,
            unite: item.unite ?? 'kg',
            pertes: item.pertes ?? 0,
            notes: item.notes,
          })),
        });
      }

      return this.getUn(tenantId, bom.id);
    });
  }

  // ─── Modifier une nomenclature ───────────────────────────────────────────────

  async modifier(tenantId: string, id: string, dto: Partial<CreateBomDto>) {
    const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
    if (!bom) throw new NotFoundException('Nomenclature introuvable');

    const { items, ...bomData } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.bom.update({
        where: { id },
        data: {
          ...(bomData.nom ? { nom: bomData.nom } : {}),
          ...(bomData.version ? { version: bomData.version } : {}),
          ...(bomData.actif !== undefined ? { actif: bomData.actif } : {}),
          ...(bomData.notes !== undefined ? { notes: bomData.notes } : {}),
        },
      });

      // Remplacement complet des items si fournis
      if (items !== undefined) {
        await tx.bomItem.deleteMany({ where: { bomId: id } });
        if (items.length > 0) {
          await tx.bomItem.createMany({
            data: items.map((item) => ({
              bomId: id,
              matierePremiereId: item.matierePremiereId,
              produitId: item.produitId,
              quantite: item.quantite,
              unite: item.unite ?? 'kg',
              pertes: item.pertes ?? 0,
              notes: item.notes,
            })),
          });
        }
      }

      return this.getUn(tenantId, id);
    });
  }

  // ─── Activer / Désactiver ────────────────────────────────────────────────────

  async toggleActif(tenantId: string, id: string) {
    const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
    if (!bom) throw new NotFoundException('Nomenclature introuvable');

    return this.prisma.bom.update({
      where: { id },
      data: { actif: !bom.actif },
    });
  }

  // ─── Supprimer ────────────────────────────────────────────────────────────────

  async supprimer(tenantId: string, id: string) {
    const bom = await this.prisma.bom.findFirst({ where: { id, tenantId } });
    if (!bom) throw new NotFoundException('Nomenclature introuvable');

    await this.prisma.bom.delete({ where: { id } });
    return { message: 'Nomenclature supprimée' };
  }

  // ─── Calculer le coût théorique d'un OF via une BOM ─────────────────────────

  async calculerCout(tenantId: string, bomId: string, quantite: number) {
    const bom = await this.getUn(tenantId, bomId);

    let coutUnitaire = 0;
    const details: { nom: string; quantite: number; prixUnit: number; sousTotal: number }[] = [];

    for (const item of bom.items) {
      const qteAvecPertes = Number(item.quantite) * (1 + Number(item.pertes) / 100);
      const prixUnit = item.matierePremiere?.prixAchat
        ? Number(item.matierePremiere.prixAchat)
        : 0;
      const sousTotal = qteAvecPertes * prixUnit;
      coutUnitaire += sousTotal;

      details.push({
        nom: item.matierePremiere?.nom ?? item.produit?.nom ?? 'Inconnu',
        quantite: qteAvecPertes,
        prixUnit,
        sousTotal,
      });
    }

    return {
      bom: { id: bom.id, nom: bom.nom, version: bom.version },
      quantite,
      coutUnitaire,
      coutTotal: coutUnitaire * quantite,
      details,
    };
  }
}
