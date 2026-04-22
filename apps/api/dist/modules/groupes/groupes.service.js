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
exports.GroupesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GroupesService = class GroupesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId) {
        return this.prisma.groupe.findMany({
            where: { tenantId },
            orderBy: { nom: 'asc' },
        });
    }
    async getUn(tenantId, id) {
        const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        return groupe;
    }
    async getParCode(tenantId, code) {
        return this.prisma.groupe.findFirst({ where: { tenantId, code } });
    }
    async getMesPermissions(tenantId, role) {
        const groupe = await this.prisma.groupe.findFirst({ where: { tenantId, code: role } });
        if (!groupe)
            return {};
        return groupe.permissions;
    }
    async creer(tenantId, data) {
        const existant = await this.prisma.groupe.findFirst({ where: { tenantId, code: data.code } });
        if (existant)
            throw new common_1.ConflictException(`Un groupe avec le code "${data.code}" existe déjà`);
        return this.prisma.groupe.create({
            data: { tenantId, ...data, permissions: (data.permissions ?? {}) },
        });
    }
    async modifierPermissions(tenantId, id, permissions) {
        const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        return this.prisma.groupe.update({
            where: { id },
            data: { permissions: permissions },
        });
    }
    async modifier(tenantId, id, data) {
        const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        return this.prisma.groupe.update({
            where: { id },
            data: { ...data, ...(data.permissions ? { permissions: data.permissions } : {}) },
        });
    }
    async toggleActif(tenantId, id) {
        const groupe = await this.prisma.groupe.findFirst({ where: { id, tenantId } });
        if (!groupe)
            throw new common_1.NotFoundException('Groupe introuvable');
        return this.prisma.groupe.update({
            where: { id },
            data: { actif: !groupe.actif },
        });
    }
};
exports.GroupesService = GroupesService;
exports.GroupesService = GroupesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupesService);
//# sourceMappingURL=groupes.service.js.map