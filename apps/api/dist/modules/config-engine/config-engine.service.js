"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ConfigEngineService = class ConfigEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEnums(tenantId, entite) {
        return this.prisma.customEnum.findMany({
            where: { tenantId, ...(entite ? { entite } : {}) },
            orderBy: [{ entite: 'asc' }, { ordre: 'asc' }],
        });
    }
    async creerEnum(tenantId, data) {
        return this.prisma.customEnum.create({
            data: { ...data, tenantId },
        });
    }
    async modifierEnum(tenantId, id, data) {
        const existing = await this.prisma.customEnum.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Enum introuvable');
        return this.prisma.customEnum.update({ where: { id }, data });
    }
    async getChamps(tenantId, entite) {
        return this.prisma.customField.findMany({
            where: { tenantId, ...(entite ? { entite } : {}) },
            orderBy: [{ entite: 'asc' }, { ordre: 'asc' }],
        });
    }
    async creerChamp(tenantId, data) {
        const types = ['text', 'number', 'date', 'boolean', 'select', 'textarea'];
        if (!types.includes(data.type)) {
            throw new common_1.BadRequestException(`Type "${data.type}" invalide. Types valides: ${types.join(', ')}`);
        }
        return this.prisma.customField.create({
            data: {
                ...data,
                tenantId,
                options: data.options ?? undefined,
            },
        });
    }
    async modifierChamp(tenantId, id, data) {
        const existing = await this.prisma.customField.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Champ introuvable');
        return this.prisma.customField.update({ where: { id }, data });
    }
    async getValeursChamps(tenantId, entite, entiteId) {
        const valeurs = await this.prisma.customFieldValue.findMany({
            where: { tenantId, entite, entiteId },
            include: {
                champ: { select: { nom: true, label: true, type: true } },
            },
        });
        return valeurs;
    }
    async upsertValeurChamp(tenantId, entite, entiteId, champId, valeur) {
        const champ = await this.prisma.customField.findFirst({
            where: { id: champId, tenantId, entite, actif: true },
        });
        if (!champ)
            throw new common_1.NotFoundException('Champ introuvable ou inactif');
        return this.prisma.customFieldValue.upsert({
            where: { champId_entiteId: { champId, entiteId } },
            create: { champId, entiteId, entite, tenantId, valeur },
            update: { valeur },
        });
    }
    async getWorkflows(tenantId) {
        return this.prisma.workflowDefinition.findMany({
            where: { tenantId },
            include: {
                etats: { orderBy: { ordre: 'asc' } },
                transitions: true,
            },
        });
    }
    async getWorkflow(tenantId, entite) {
        const workflow = await this.prisma.workflowDefinition.findFirst({
            where: { tenantId, entite },
            include: {
                etats: { orderBy: { ordre: 'asc' } },
                transitions: { include: { etatSource: true, etatCible: true } },
            },
        });
        if (!workflow)
            throw new common_1.NotFoundException(`Workflow pour "${entite}" introuvable`);
        return workflow;
    }
    async verifierTransition(tenantId, entite, etatSourceCode, etatCibleCode, role) {
        const workflow = await this.prisma.workflowDefinition.findFirst({
            where: { tenantId, entite },
        });
        if (!workflow)
            return false;
        const [etatSource, etatCible] = await Promise.all([
            this.prisma.workflowState.findFirst({ where: { workflowId: workflow.id, code: etatSourceCode } }),
            this.prisma.workflowState.findFirst({ where: { workflowId: workflow.id, code: etatCibleCode } }),
        ]);
        if (!etatSource || !etatCible)
            return false;
        const transition = await this.prisma.workflowTransition.findFirst({
            where: {
                workflowId: workflow.id,
                etatSourceId: etatSource.id,
                etatCibleId: etatCible.id,
            },
        });
        if (!transition)
            return false;
        const rolesAutorises = transition.rolesAutorises;
        return rolesAutorises.includes(role);
    }
};
exports.ConfigEngineService = ConfigEngineService;
exports.ConfigEngineService = ConfigEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigEngineService);
//# sourceMappingURL=config-engine.service.js.map