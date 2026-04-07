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
exports.FournisseursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FournisseursService = class FournisseursService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search } = opts;
        const skip = (page - 1) * limite;
        const where = {
            tenantId,
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { reference: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.fournisseur.findMany({
                where,
                skip,
                take: limite,
                orderBy: { nom: 'asc' },
                include: {
                    _count: { select: { matieresPrmieres: true } },
                },
            }),
            this.prisma.fournisseur.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUn(tenantId, id) {
        const fournisseur = await this.prisma.fournisseur.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                matieresPrmieres: {
                    take: 10,
                    select: { id: true, nom: true, reference: true, stockActuel: true, unite: true },
                },
            },
        });
        if (!fournisseur)
            throw new common_1.NotFoundException('Fournisseur introuvable');
        return fournisseur;
    }
    async creer(tenantId, dto) {
        const reference = `FRN-${Date.now()}`;
        return this.prisma.fournisseur.create({
            data: { ...dto, tenantId, reference },
        });
    }
    async modifier(tenantId, id, dto) {
        const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!fournisseur)
            throw new common_1.NotFoundException('Fournisseur introuvable');
        return this.prisma.fournisseur.update({ where: { id }, data: dto });
    }
    async supprimer(tenantId, id) {
        const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!fournisseur)
            throw new common_1.NotFoundException('Fournisseur introuvable');
        const mpCount = await this.prisma.matierePremiere.count({
            where: { fournisseurId: id, tenantId, deletedAt: null },
        });
        if (mpCount > 0) {
            throw new common_1.BadRequestException(`Impossible : ${mpCount} matière(s) première(s) liée(s)`);
        }
        await this.prisma.fournisseur.update({ where: { id }, data: { deletedAt: new Date() } });
        return { message: 'Fournisseur archivé' };
    }
    async toggleActif(tenantId, id) {
        const fournisseur = await this.prisma.fournisseur.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!fournisseur)
            throw new common_1.NotFoundException('Fournisseur introuvable');
        return this.prisma.fournisseur.update({
            where: { id },
            data: { actif: !fournisseur.actif },
        });
    }
};
exports.FournisseursService = FournisseursService;
exports.FournisseursService = FournisseursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FournisseursService);
//# sourceMappingURL=fournisseurs.service.js.map