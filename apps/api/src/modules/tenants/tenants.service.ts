import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload, UserRole } from '@saas-erp/shared';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // Récupère le tenant courant avec ses modules actifs
  async getTenantCourant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantModules: {
          where: { actif: true },
          include: { module: true },
        },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant introuvable');
    return tenant;
  }

  // Liste des utilisateurs du tenant (admin seulement)
  async getUtilisateurs(tenantId: string, page = 1, limite = 20) {
    const skip = (page - 1) * limite;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limite,
        select: {
          id: true,
          nom: true,
          email: true,
          role: true,
          telephone: true,
          actif: true,
          derniereConnexion: true,
          createdAt: true,
        },
        orderBy: { nom: 'asc' },
      }),
      this.prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limite),
    };
  }

  // Active ou désactive un module pour le tenant
  async toggleModule(tenantId: string, moduleCode: string, actif: boolean) {
    const module = await this.prisma.module.findUnique({
      where: { code: moduleCode },
    });

    if (!module) throw new NotFoundException(`Module "${moduleCode}" introuvable`);

    const tenantModule = await this.prisma.tenantModule.findFirst({
      where: { tenantId, moduleId: module.id },
    });

    if (!tenantModule) {
      throw new NotFoundException(`Module non associé à ce tenant`);
    }

    const updated = await this.prisma.tenantModule.update({
      where: { id: tenantModule.id },
      data: { actif },
    });

    // Invalider le cache Redis des modules actifs
    await this.redis.invalidateModulesActifs(tenantId);

    return updated;
  }

  // Paramètres du tenant
  async getSettings(tenantId: string) {
    return this.prisma.setting.findMany({
      where: { tenantId },
      orderBy: { cle: 'asc' },
    });
  }

  async upsertSetting(tenantId: string, cle: string, valeur: string) {
    return this.prisma.setting.upsert({
      where: { tenantId_cle: { tenantId, cle } },
      create: { tenantId, cle, valeur },
      update: { valeur },
    });
  }

  // Crée un utilisateur dans le tenant
  async creerUtilisateur(tenantId: string, data: {
    nom: string;
    email: string;
    role: string;
    telephone?: string;
    motDePasse?: string;
  }) {
    const existe = await this.prisma.user.findFirst({
      where: { email: data.email, tenantId },
    });
    if (existe) throw new ConflictException('Un utilisateur avec cet email existe déjà');

    const mdp = data.motDePasse ?? 'Bienvenue2025!';
    const hash = await bcrypt.hash(mdp, 10);

    return this.prisma.user.create({
      data: {
        tenantId,
        nom: data.nom,
        email: data.email,
        role: data.role,
        telephone: data.telephone,
        passwordHash: hash,
        actif: true,
      },
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
    });
  }

  // Active ou désactive un utilisateur
  async toggleUtilisateur(tenantId: string, userId: string, actif: boolean) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({
      where: { id: userId },
      data: { actif },
      select: { id: true, nom: true, actif: true },
    });
  }

  // Change le rôle d'un utilisateur
  async changerRole(tenantId: string, userId: string, role: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, nom: true, role: true },
    });
  }
}
