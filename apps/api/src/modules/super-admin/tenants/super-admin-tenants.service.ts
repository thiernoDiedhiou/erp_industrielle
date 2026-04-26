import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../redis/redis.service';

const PRIX_PLAN_XOF: Record<string, number> = {
  starter: 29_000,
  pro: 79_000,
  enterprise: 199_000,
};

@Injectable()
export class SuperAdminTenantsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getListe(search?: string) {
    const tenants = await this.prisma.tenant.findMany({
      where: search
        ? { OR: [{ nom: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      include: {
        _count: { select: { users: true, tenantModules: true } },
        tenantModules: { where: { actif: true }, include: { module: { select: { code: true, nom: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      nom: t.nom,
      secteur: t.secteur,
      plan: t.plan,
      actif: t.actif,
      pays: t.pays,
      ville: t.ville,
      telephone: t.telephone,
      createdAt: t.createdAt,
      nbUsers: t._count.users,
      nbModules: t._count.tenantModules,
      modules: t.tenantModules.map((tm) => tm.module.code),
    }));
  }

  async getUn(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
          select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, derniereConnexion: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        tenantModules: {
          include: { module: true },
          orderBy: { activatedAt: 'asc' },
        },
        _count: { select: { users: true } },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const statsCommandes = await this.prisma.commande.count({ where: { tenantId: id } });
    const statsFactures = await this.prisma.facture.count({ where: { tenantId: id } });

    return { ...tenant, statsCommandes, statsFactures };
  }

  async creer(data: {
    slug: string; nom: string; secteur: string; plan: string;
    pays?: string; ville?: string; telephone?: string; adresse?: string;
    adminEmail: string; adminNom: string; adminPassword: string;
    moduleCodes?: string[];
  }) {
    const existe = await this.prisma.tenant.findUnique({ where: { slug: data.slug } });
    if (existe) throw new ConflictException(`Le slug "${data.slug}" est déjà utilisé`);

    const allModules = await this.prisma.module.findMany();
    const selectedCodes = data.moduleCodes ?? allModules.map((m) => m.code);

    const tenant = await this.prisma.$transaction(async (tx) => {
      const t = await tx.tenant.create({
        data: {
          slug: data.slug,
          nom: data.nom,
          secteur: data.secteur,
          plan: data.plan,
          pays: data.pays ?? 'SN',
          ville: data.ville,
          telephone: data.telephone,
          adresse: data.adresse,
        },
      });

      // Activer les modules sélectionnés
      const modulesChoisis = allModules.filter((m) => selectedCodes.includes(m.code));
      await tx.tenantModule.createMany({
        data: modulesChoisis.map((m) => ({ tenantId: t.id, moduleId: m.id })),
      });

      // Créer l'admin du tenant
      const hash = await bcrypt.hash(data.adminPassword, 12);
      await tx.user.create({
        data: {
          tenantId: t.id,
          nom: data.adminNom,
          email: data.adminEmail,
          passwordHash: hash,
          role: 'admin',
        },
      });

      // Créer le groupe admin par défaut
      await tx.groupe.create({
        data: {
          tenantId: t.id,
          code: 'admin',
          nom: 'Administrateur',
          description: 'Accès complet à tous les modules',
          permissions: {},
        },
      });

      return t;
    });

    return this.getUn(tenant.id);
  }

  async modifier(id: string, data: {
    nom?: string; secteur?: string; plan?: string;
    pays?: string; ville?: string; telephone?: string; adresse?: string;
    couleurPrimaire?: string; couleurSecondaire?: string;
  }) {
    await this.prisma.tenant.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Tenant introuvable');
    });

    return this.prisma.tenant.update({ where: { id }, data });
  }

  async toggleActif(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    return this.prisma.tenant.update({
      where: { id },
      data: { actif: !tenant.actif },
    });
  }

  async modifierModules(id: string, moduleCodes: string[]) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const allModules = await this.prisma.module.findMany();
    const modulesChoisis = allModules.filter((m) => moduleCodes.includes(m.code));

    await this.prisma.$transaction(async (tx) => {
      await tx.tenantModule.deleteMany({ where: { tenantId: id } });
      await tx.tenantModule.createMany({
        data: modulesChoisis.map((m) => ({ tenantId: id, moduleId: m.id })),
      });
    });

    // Invalider le cache Redis pour que le tenant voit les changements immédiatement
    await this.redis.invalidateModulesActifs(id);

    return this.getUn(id);
  }

  async creerUser(tenantId: string, data: {
    nom: string; prenom?: string; email: string; password: string; role: string; telephone?: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const existe = await this.prisma.user.findFirst({ where: { tenantId, email: data.email, deletedAt: null } });
    if (existe) throw new ConflictException('Un utilisateur avec cet email existe déjà');

    const hash = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        tenantId,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        passwordHash: hash,
        role: data.role,
        telephone: data.telephone,
      },
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true },
    });
  }

  async getStats() {
    const maintenant = new Date();
    const debutCeMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const debutMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);

    const [
      totalTenants, tenantsActifs, totalUsers, usersActifs, parPlan,
      nouveauxCeMois, nouveauxMoisPrecedent, usageModulesRaw,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { actif: true } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { actif: true, deletedAt: null } }),
      this.prisma.tenant.groupBy({ by: ['plan'], where: { actif: true }, _count: { id: true } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: debutCeMois } } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: debutMoisPrecedent, lt: debutCeMois } } }),
      this.prisma.tenantModule.groupBy({
        by: ['moduleId'],
        where: { actif: true },
        _count: { tenantId: true },
      }),
    ]);

    const [commandes, factures, modules] = await Promise.all([
      this.prisma.commande.count(),
      this.prisma.facture.count(),
      this.prisma.module.findMany({ select: { id: true, code: true } }),
    ]);

    const parPlanMap = parPlan.reduce(
      (acc, p) => ({ ...acc, [p.plan]: p._count.id }),
      {} as Record<string, number>,
    );

    const mrr = Object.entries(parPlanMap).reduce(
      (total, [plan, nb]) => total + nb * (PRIX_PLAN_XOF[plan] ?? 0),
      0,
    );

    const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m.code]));
    const usageModules = usageModulesRaw
      .map((u) => ({
        code: moduleMap[u.moduleId] ?? u.moduleId,
        nb: u._count.tenantId,
        pct: totalTenants > 0 ? Math.round((u._count.tenantId / totalTenants) * 100) : 0,
      }))
      .sort((a, b) => b.nb - a.nb);

    return {
      totalTenants,
      tenantsActifs,
      tenantsSuspendus: totalTenants - tenantsActifs,
      totalUsers,
      usersActifs,
      commandes,
      factures,
      parPlan: parPlanMap,
      mrr,
      nouveauxCeMois,
      nouveauxMoisPrecedent,
      usageModules,
    };
  }

  // ─── Workflows ──────────────────────────────────────────────────────────────

  async getWorkflowsTenant(tenantId: string) {
    return this.prisma.workflowDefinition.findMany({
      where: { tenantId },
      include: {
        etats: { orderBy: { ordre: 'asc' } },
        transitions: {
          include: { etatSource: true, etatCible: true },
        } as any,
      },
      orderBy: { entite: 'asc' },
    });
  }

  async modifierWorkflowTenant(tenantId: string, workflowId: string, data: {
    nom: string;
    etats: Array<{
      code: string;
      libelle: string;
      couleur?: string;
      etapInitiale?: boolean;
      etapFinale?: boolean;
      ordre?: number;
    }>;
    transitions: Array<{
      etatSourceCode: string;
      etatCibleCode: string;
      rolesAutorises: string[];
      libelle: string;
    }>;
  }) {
    const workflow = await this.prisma.workflowDefinition.findFirst({ where: { id: workflowId, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow introuvable');

    return this.prisma.$transaction(async (tx) => {
      // Supprimer dans l'ordre (transitions référencent les états)
      await tx.workflowTransition.deleteMany({ where: { workflowId } });
      await tx.workflowState.deleteMany({ where: { workflowId } });
      await tx.workflowDefinition.update({ where: { id: workflowId }, data: { nom: data.nom } });

      const etatsCreated = await Promise.all(
        data.etats.map((e, i) =>
          tx.workflowState.create({
            data: {
              workflowId,
              code: e.code,
              libelle: e.libelle,
              couleur: e.couleur,
              etapInitiale: e.etapInitiale ?? false,
              etapFinale: e.etapFinale ?? false,
              ordre: e.ordre ?? i,
            },
          }),
        ),
      );

      const etatMap = Object.fromEntries(etatsCreated.map((e) => [e.code, e]));

      for (const t of data.transitions) {
        const source = etatMap[t.etatSourceCode];
        const cible = etatMap[t.etatCibleCode];
        if (!source || !cible) continue;
        await tx.workflowTransition.create({
          data: {
            workflowId,
            etatSourceId: source.id,
            etatCibleId: cible.id,
            rolesAutorises: t.rolesAutorises,
            libelle: t.libelle,
          },
        });
      }

      return this.getWorkflowsTenant(tenantId);
    });
  }

  async creerWorkflowTenant(tenantId: string, data: {
    entite: string;
    nom: string;
    etats: Array<{
      code: string;
      libelle: string;
      couleur?: string;
      etapInitiale?: boolean;
      etapFinale?: boolean;
      ordre?: number;
    }>;
    transitions: Array<{
      etatSourceCode: string;
      etatCibleCode: string;
      rolesAutorises: string[];
      libelle: string;
    }>;
  }) {
    const existe = await this.prisma.workflowDefinition.findFirst({
      where: { tenantId, entite: data.entite },
    });
    if (existe) throw new ConflictException(`Un workflow pour "${data.entite}" existe déjà`);

    return this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflowDefinition.create({
        data: { tenantId, entite: data.entite, nom: data.nom },
      });

      const etatsCreated = await Promise.all(
        data.etats.map((e, i) =>
          tx.workflowState.create({
            data: {
              workflowId: workflow.id,
              code: e.code,
              libelle: e.libelle,
              couleur: e.couleur,
              etapInitiale: e.etapInitiale ?? false,
              etapFinale: e.etapFinale ?? false,
              ordre: e.ordre ?? i,
            },
          }),
        ),
      );

      const etatMap = Object.fromEntries(etatsCreated.map((e) => [e.code, e]));

      for (const t of data.transitions) {
        const source = etatMap[t.etatSourceCode];
        const cible = etatMap[t.etatCibleCode];
        if (!source || !cible) continue;
        await tx.workflowTransition.create({
          data: {
            workflowId: workflow.id,
            etatSourceId: source.id,
            etatCibleId: cible.id,
            rolesAutorises: t.rolesAutorises,
            libelle: t.libelle,
          },
        });
      }

      return this.getWorkflowsTenant(tenantId);
    });
  }

  // ─── Champs personnalisés ───────────────────────────────────────────────────

  async getChampsT(tenantId: string) {
    return this.prisma.customField.findMany({
      where: { tenantId },
      orderBy: [{ entite: 'asc' }, { ordre: 'asc' }],
    });
  }

  async creerChampTenant(tenantId: string, data: {
    entite: string;
    nom: string;
    type: string;
    label: string;
    obligatoire?: boolean;
    ordre?: number;
  }) {
    const types = ['text', 'number', 'date', 'boolean', 'select', 'textarea'];
    if (!types.includes(data.type)) {
      throw new BadRequestException(`Type "${data.type}" invalide. Types valides : ${types.join(', ')}`);
    }
    return this.prisma.customField.create({ data: { ...data, tenantId } });
  }

  async toggleChampTenant(tenantId: string, champId: string) {
    const champ = await this.prisma.customField.findFirst({ where: { id: champId, tenantId } });
    if (!champ) throw new NotFoundException('Champ introuvable');
    return this.prisma.customField.update({ where: { id: champId }, data: { actif: !champ.actif } });
  }
}
