import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ── Vue globale de tous les tenants ────────────────────────────────────────

  async getTenants() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenantModules: { include: { module: { select: { code: true, nom: true } } } },
        _count: { select: { users: true } },
      },
    });

    return tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      nom: t.nom,
      secteur: t.secteur,
      plan: t.plan,
      actif: t.actif,
      ville: t.ville,
      pays: t.pays,
      createdAt: t.createdAt,
      nbUtilisateurs: t._count.users,
      modules: t.tenantModules
        .filter((tm) => tm.actif)
        .map((tm) => tm.module.code),
    }));
  }

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id },
      include: {
        tenantModules: { include: { module: true } },
        users: { select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true } },
        _count: { select: { users: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const [nbCommandes, nbClients] = await Promise.all([
      this.prisma.commande.count({ where: { tenantId: id } }),
      this.prisma.client.count({ where: { tenantId: id } }),
    ]);

    return { ...tenant, nbCommandes, nbClients };
  }

  async toggleTenant(id: string, actif: boolean) {
    const tenant = await this.prisma.tenant.findFirst({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');
    return this.prisma.tenant.update({ where: { id }, data: { actif } });
  }

  async toggleModule(tenantId: string, moduleCode: string, actif: boolean) {
    const module = await this.prisma.module.findFirst({ where: { code: moduleCode } });
    if (!module) throw new NotFoundException('Module introuvable');

    const result = await this.prisma.tenantModule.upsert({
      where: { tenantId_moduleId: { tenantId, moduleId: module.id } },
      update: { actif },
      create: { tenantId, moduleId: module.id, actif },
    });

    // Invalider le cache Redis du tenant pour forcer rechargement immédiat
    await this.redis.invalidateModulesActifs(tenantId);

    return result;
  }

  // ── Statistiques du tenant courant (scoped) ────────────────────────────────

  async getStatsTenant(tenantId: string) {
    const [nbUsers, nbCommandes, nbFactures, nbClients, nbOF, ca, modulesActifs, tenant] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId, actif: true } }),
        this.prisma.commande.count({ where: { tenantId } }),
        this.prisma.facture.count({ where: { tenantId } }),
        this.prisma.client.count({ where: { tenantId } }),
        this.prisma.ordreFabrication.count({ where: { tenantId } }),
        this.prisma.facture.aggregate({
          where: { tenantId, statut: 'payee' },
          _sum: { totalTTC: true },
        }),
        this.prisma.tenantModule.findMany({
          where: { tenantId, actif: true },
          include: { module: { select: { code: true, nom: true } } },
          orderBy: { module: { nom: 'asc' } },
        }),
        this.prisma.tenant.findFirst({
          where: { id: tenantId },
          select: { nom: true, plan: true, ville: true, secteur: true, pays: true, telephone: true },
        }),
      ]);

    return {
      nbUsers,
      nbCommandes,
      nbFactures,
      nbClients,
      nbOF,
      totalCA: Number(ca._sum.totalTTC ?? 0),
      modulesActifs: modulesActifs.map((tm) => ({ code: tm.module.code, nom: tm.module.nom })),
      tenant,
    };
  }

  // ── Statistiques globales plateforme ───────────────────────────────────────

  async getStatsPlateforme() {
    const [nbTenants, nbTenantActifs, nbUsers, nbCommandes, nbFactures, totalCA] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { actif: true } }),
        this.prisma.user.count({ where: { actif: true } }),
        this.prisma.commande.count(),
        this.prisma.facture.count(),
        this.prisma.facture.aggregate({
          where: { statut: 'payee' },
          _sum: { totalTTC: true },
        }),
      ]);

    const modules = await this.prisma.module.findMany({
      include: { _count: { select: { tenantModules: true } } },
    });

    return {
      nbTenants,
      nbTenantActifs,
      nbUsers,
      nbCommandes,
      nbFactures,
      totalCA: Number(totalCA._sum.totalTTC ?? 0),
      modulesUsage: modules.map((m) => ({
        code: m.code,
        nom: m.nom,
        nbTenants: m._count.tenantModules,
      })),
    };
  }

  // ── Gestion des modules disponibles ────────────────────────────────────────

  async getModules() {
    return this.prisma.module.findMany({ orderBy: { code: 'asc' } });
  }
}
