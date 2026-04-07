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
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MachinesService = class MachinesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search, statut } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            deletedAt: null,
            ...(statut ? { statut } : {}),
            ...(search
                ? {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { code: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.machine.findMany({
                where,
                skip,
                take: limite,
                orderBy: { nom: 'asc' },
                include: {
                    _count: { select: { ofs: true } },
                },
            }),
            this.prisma.machine.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUne(tenantId, id) {
        const machine = await this.prisma.machine.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                ofs: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, reference: true, statut: true, produitFini: true, createdAt: true },
                },
            },
        });
        if (!machine)
            throw new common_1.NotFoundException('Machine introuvable');
        return machine;
    }
    async creer(tenantId, dto) {
        const existe = await this.prisma.machine.findFirst({ where: { tenantId, code: dto.code, deletedAt: null } });
        if (existe)
            throw new common_1.BadRequestException(`Code machine "${dto.code}" déjà utilisé`);
        return this.prisma.machine.create({
            data: { ...dto, tenantId, statut: 'disponible' },
        });
    }
    async modifier(tenantId, id, dto) {
        const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!machine)
            throw new common_1.NotFoundException('Machine introuvable');
        return this.prisma.machine.update({ where: { id }, data: dto });
    }
    async changerStatut(tenantId, id, statut) {
        const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!machine)
            throw new common_1.NotFoundException('Machine introuvable');
        return this.prisma.machine.update({ where: { id }, data: { statut } });
    }
    async supprimer(tenantId, id) {
        const machine = await this.prisma.machine.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!machine)
            throw new common_1.NotFoundException('Machine introuvable');
        const ofsActifs = await this.prisma.ordreFabrication.count({
            where: { machineId: id, tenantId, statut: { notIn: ['termine', 'annule'] } },
        });
        if (ofsActifs > 0) {
            throw new common_1.BadRequestException(`Impossible : ${ofsActifs} OF(s) en cours sur cette machine`);
        }
        await this.prisma.machine.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Machine archivée' };
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map