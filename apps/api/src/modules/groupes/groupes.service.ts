import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PermissionModule {
  lire: boolean;
  ecrire: boolean;
  supprimer: boolean;
}

export type PermissionsMap = Record<string, PermissionModule>;

@Injectable()
export class GroupesService {
  constructor(private prisma: PrismaService) {}

  async getListe(tenantId: string) {
    return this.prisma.groupe.findMany({
      where: { tenantId },
      orderBy: { nom: 'asc' },
    });
  }

  async getUn(tenantId: string, id: string) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    return groupe;
  }

  async getParCode(tenantId: string, code: string) {
    return this.prisma.groupe.findFirst({ where: { tenantId, code } });
  }

  async getMesPermissions(tenantId: string, role: string): Promise<PermissionsMap> {
    const groupe = await this.prisma.groupe.findFirst({ where: { tenantId, code: role } });
    if (!groupe) return {};
    return groupe.permissions as unknown as PermissionsMap;
  }

  async creer(tenantId: string, data: {
    code: string;
    nom: string;
    description?: string;
    permissions?: PermissionsMap;
  }) {
    const existant = await this.prisma.groupe.findFirst({ where: { tenantId, code: data.code } });
    if (existant) throw new ConflictException(`Un groupe avec le code "${data.code}" existe déjà`);

    return this.prisma.groupe.create({
      data: { tenantId, ...data, permissions: (data.permissions ?? {}) as object },
    });
  }

  async modifierPermissions(tenantId: string, id: string, permissions: PermissionsMap) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');

    return this.prisma.groupe.update({
      where: { id },
      data: { permissions: permissions as object },
    });
  }

  async modifier(tenantId: string, id: string, data: {
    nom?: string;
    description?: string;
    permissions?: PermissionsMap;
  }) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');

    return this.prisma.groupe.update({
      where: { id },
      data: { ...data, ...(data.permissions ? { permissions: data.permissions as object } : {}) },
    });
  }

  async toggleActif(tenantId: string, id: string) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');

    return this.prisma.groupe.update({
      where: { id },
      data: { actif: !groupe.actif },
    });
  }
}
