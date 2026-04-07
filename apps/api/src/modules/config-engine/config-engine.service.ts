import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfigEngineService {
  constructor(private prisma: PrismaService) {}

  // ─── Enums personnalisés ────────────────────────────────────────────────────

  async getEnums(tenantId: string, entite?: string) {
    return this.prisma.customEnum.findMany({
      where: { tenantId, ...(entite ? { entite } : {}) },
      orderBy: [{ entite: 'asc' }, { ordre: 'asc' }],
    });
  }

  async creerEnum(tenantId: string, data: {
    entite: string;
    code: string;
    libelle: string;
    couleur?: string;
    ordre?: number;
  }) {
    return this.prisma.customEnum.create({
      data: { ...data, tenantId },
    });
  }

  async modifierEnum(tenantId: string, id: string, data: {
    libelle?: string;
    couleur?: string;
    ordre?: number;
    actif?: boolean;
  }) {
    // Isolation tenant
    const existing = await this.prisma.customEnum.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Enum introuvable');

    return this.prisma.customEnum.update({ where: { id }, data });
  }

  // ─── Champs personnalisés ───────────────────────────────────────────────────

  async getChamps(tenantId: string, entite?: string) {
    return this.prisma.customField.findMany({
      where: { tenantId, ...(entite ? { entite } : {}) },
      orderBy: [{ entite: 'asc' }, { ordre: 'asc' }],
    });
  }

  async creerChamp(tenantId: string, data: {
    entite: string;
    nom: string;
    type: string;
    label: string;
    obligatoire?: boolean;
    ordre?: number;
    options?: object;
  }) {
    const types = ['text', 'number', 'date', 'boolean', 'select', 'textarea'];
    if (!types.includes(data.type)) {
      throw new BadRequestException(`Type "${data.type}" invalide. Types valides: ${types.join(', ')}`);
    }

    return this.prisma.customField.create({
      data: {
        ...data,
        tenantId,
        options: data.options ?? undefined,
      },
    });
  }

  async modifierChamp(tenantId: string, id: string, data: {
    label?: string;
    obligatoire?: boolean;
    ordre?: number;
    actif?: boolean;
  }) {
    const existing = await this.prisma.customField.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Champ introuvable');

    return this.prisma.customField.update({ where: { id }, data });
  }

  // ─── Valeurs des champs personnalisés ──────────────────────────────────────

  async getValeursChamps(tenantId: string, entite: string, entiteId: string) {
    const valeurs = await this.prisma.customFieldValue.findMany({
      where: { tenantId, entite, entiteId },
      include: {
        champ: { select: { nom: true, label: true, type: true } },
      },
    });
    return valeurs;
  }

  async upsertValeurChamp(
    tenantId: string,
    entite: string,
    entiteId: string,
    champId: string,
    valeur: string,
  ) {
    // Vérifier que le champ appartient au tenant
    const champ = await this.prisma.customField.findFirst({
      where: { id: champId, tenantId, entite, actif: true },
    });
    if (!champ) throw new NotFoundException('Champ introuvable ou inactif');

    return this.prisma.customFieldValue.upsert({
      where: { champId_entiteId: { champId, entiteId } },
      create: { champId, entiteId, entite, tenantId, valeur },
      update: { valeur },
    });
  }

  // ─── Workflows ──────────────────────────────────────────────────────────────

  async getWorkflows(tenantId: string) {
    return this.prisma.workflowDefinition.findMany({
      where: { tenantId },
      include: {
        etats: { orderBy: { ordre: 'asc' } },
        transitions: true,
      },
    });
  }

  async getWorkflow(tenantId: string, entite: string) {
    const workflow = await this.prisma.workflowDefinition.findFirst({
      where: { tenantId, entite },
      include: {
        etats: { orderBy: { ordre: 'asc' } },
        transitions: { include: { etatSource: true, etatCible: true } },
      } as any,
    });
    if (!workflow) throw new NotFoundException(`Workflow pour "${entite}" introuvable`);
    return workflow;
  }

  // Vérifie si une transition est autorisée pour un rôle donné
  async verifierTransition(
    tenantId: string,
    entite: string,
    etatSourceCode: string,
    etatCibleCode: string,
    role: string,
  ): Promise<boolean> {
    const workflow = await this.prisma.workflowDefinition.findFirst({
      where: { tenantId, entite },
    });
    if (!workflow) return false;

    // Trouver les IDs des états source et cible
    const [etatSource, etatCible] = await Promise.all([
      this.prisma.workflowState.findFirst({ where: { workflowId: workflow.id, code: etatSourceCode } }),
      this.prisma.workflowState.findFirst({ where: { workflowId: workflow.id, code: etatCibleCode } }),
    ]);

    if (!etatSource || !etatCible) return false;

    const transition = await this.prisma.workflowTransition.findFirst({
      where: {
        workflowId: workflow.id,
        etatSourceId: etatSource.id,
        etatCibleId: etatCible.id,
      },
    });

    if (!transition) return false;

    // Vérifier si le rôle est autorisé
    const rolesAutorises = transition.rolesAutorises as string[];
    return rolesAutorises.includes(role);
  }
}
