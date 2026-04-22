import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SuperAdminTenantsService {
  constructor(private prisma: PrismaService) {}

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
    const [totalTenants, tenantsActifs, totalUsers, usersActifs, parPlan] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { actif: true } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { actif: true, deletedAt: null } }),
      this.prisma.tenant.groupBy({ by: ['plan'], _count: { id: true } }),
    ]);

    const commandes = await this.prisma.commande.count();
    const factures = await this.prisma.facture.count();

    return {
      totalTenants,
      tenantsActifs,
      tenantsSuspendus: totalTenants - tenantsActifs,
      totalUsers,
      usersActifs,
      commandes,
      factures,
      parPlan: parPlan.reduce((acc, p) => ({ ...acc, [p.plan]: p._count.id }), {} as Record<string, number>),
    };
  }
}
