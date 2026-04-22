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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListe(tenantId, opts) {
        const { page = 1, limite = 20, search, role } = opts;
        const skip = (page - 1) * limite;
        const where = { tenantId, deletedAt: null };
        if (role)
            where.role = role;
        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limite,
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true, nom: true, prenom: true, email: true,
                    role: true, telephone: true, actif: true,
                    derniereConnexion: true, createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limite) };
    }
    async getUn(tenantId, id) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId, deletedAt: null },
            select: {
                id: true, nom: true, prenom: true, email: true,
                role: true, telephone: true, actif: true,
                derniereConnexion: true, createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return user;
    }
    async creer(tenantId, dto) {
        const existant = await this.prisma.user.findFirst({
            where: { email: dto.email, tenantId, deletedAt: null },
        });
        if (existant)
            throw new common_1.ConflictException('Cet email est déjà utilisé dans ce tenant');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.create({
            data: {
                tenantId,
                nom: dto.nom,
                prenom: dto.prenom,
                email: dto.email,
                passwordHash,
                role: dto.role,
                telephone: dto.telephone,
            },
            select: {
                id: true, nom: true, prenom: true, email: true,
                role: true, telephone: true, actif: true, createdAt: true,
            },
        });
    }
    async modifier(tenantId, id, dto) {
        const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const data = {};
        if (dto.nom)
            data.nom = dto.nom;
        if (dto.prenom !== undefined)
            data.prenom = dto.prenom;
        if (dto.role)
            data.role = dto.role;
        if (dto.telephone !== undefined)
            data.telephone = dto.telephone;
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 12);
            data.refreshTokenHash = null;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true, nom: true, prenom: true, email: true,
                role: true, telephone: true, actif: true,
            },
        });
    }
    async toggleActif(tenantId, id) {
        const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return this.prisma.user.update({
            where: { id },
            data: {
                actif: !user.actif,
                refreshTokenHash: user.actif ? null : user.refreshTokenHash,
            },
            select: { id: true, actif: true },
        });
    }
    async reinitialiserMotDePasse(tenantId, id) {
        const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`;
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash, refreshTokenHash: null },
        });
        return { temporaryPassword: tempPassword };
    }
    async supprimer(tenantId, id) {
        const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), actif: false, refreshTokenHash: null },
        });
        return { message: 'Utilisateur supprimé' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map