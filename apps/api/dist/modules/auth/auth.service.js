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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async login(dto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: dto.tenantSlug },
        });
        if (!tenant || !tenant.actif) {
            throw new common_1.NotFoundException(`Tenant "${dto.tenantSlug}" introuvable ou inactif`);
        }
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                tenantId: tenant.id,
                actif: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const passwordValide = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValide) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.genererAccessToken(payload),
            this.genererRefreshToken(payload),
        ]);
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshTokenHash,
                derniereConnexion: new Date(),
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                tenant: {
                    id: tenant.id,
                    nom: tenant.nom,
                    slug: tenant.slug,
                    couleurPrimaire: tenant.couleurPrimaire,
                    couleurSecondaire: tenant.couleurSecondaire,
                    logo: tenant.logo,
                },
            },
        };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: payload.sub, tenantId: payload.tenantId, actif: true },
        });
        if (!user || !user.refreshTokenHash) {
            throw new common_1.UnauthorizedException('Session expirée, reconnectez-vous');
        }
        const tokenValide = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenValide) {
            throw new common_1.UnauthorizedException('Refresh token révoqué');
        }
        const newPayload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            tenantSlug: payload.tenantSlug,
            role: user.role,
        };
        const [newAccessToken, newRefreshToken] = await Promise.all([
            this.genererAccessToken(newPayload),
            this.genererRefreshToken(newPayload),
        ]);
        const newHash = await bcrypt.hash(newRefreshToken, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: newHash },
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 900,
        };
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
    }
    async profil(userId, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenantId },
            select: {
                id: true,
                nom: true,
                email: true,
                role: true,
                telephone: true,
                derniereConnexion: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        nom: true,
                        slug: true,
                        plan: true,
                        couleurPrimaire: true,
                        couleurSecondaire: true,
                        logo: true,
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return user;
    }
    genererAccessToken(payload) {
        return this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '15m',
        });
    }
    genererRefreshToken(payload) {
        return this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map