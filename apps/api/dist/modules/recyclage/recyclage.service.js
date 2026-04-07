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
exports.RecyclageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecyclageService = class RecyclageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCollectes(tenantId, opts) {
        const { page = 1, limite = 20 } = opts;
        const skip = (page - 1) * limite;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.recyclageCollecte.findMany({
                where: { tenantId },
                skip,
                take: limite,
                orderBy: { dateCollecte: 'desc' },
            }),
            this.prisma.recyclageCollecte.count({ where: { tenantId } }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async creerCollecte(tenantId, data) {
        return this.prisma.recyclageCollecte.create({
            data: { ...data, tenantId, statut: 'collecte', dateCollecte: new Date() },
        });
    }
    async changerStatut(tenantId, id, statut) {
        const collecte = await this.prisma.recyclageCollecte.findFirst({
            where: { id, tenantId },
        });
        if (!collecte)
            throw new common_1.NotFoundException('Collecte introuvable');
        return this.prisma.recyclageCollecte.update({ where: { id }, data: { statut } });
    }
    async getStats(tenantId) {
        const [totalCollectes, parType, parStatut] = await Promise.all([
            this.prisma.recyclageCollecte.aggregate({
                where: { tenantId },
                _sum: { quantite: true },
                _count: { id: true },
            }),
            this.prisma.recyclageCollecte.groupBy({
                by: ['typeDechet'],
                where: { tenantId },
                _sum: { quantite: true },
                _count: { id: true },
            }),
            this.prisma.recyclageCollecte.groupBy({
                by: ['statut'],
                where: { tenantId },
                _count: { id: true },
            }),
        ]);
        return {
            totalCollectes: totalCollectes._count.id,
            totalQuantite: totalCollectes._sum.quantite || 0,
            parType,
            parStatut,
        };
    }
};
exports.RecyclageService = RecyclageService;
exports.RecyclageService = RecyclageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecyclageService);
//# sourceMappingURL=recyclage.service.js.map