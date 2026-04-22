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
exports.SuperAdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SuperAdminAuthService = class SuperAdminAuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async login(email, password) {
        const admin = await this.prisma.superAdmin.findUnique({ where: { email } });
        if (!admin || !admin.actif) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const payload = {
            sub: admin.id,
            email: admin.email,
            nom: admin.nom,
            isSuperAdmin: true,
        };
        const access_token = this.jwt.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '8h',
        });
        return {
            access_token,
            superAdmin: { id: admin.id, email: admin.email, nom: admin.nom },
        };
    }
};
exports.SuperAdminAuthService = SuperAdminAuthService;
exports.SuperAdminAuthService = SuperAdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], SuperAdminAuthService);
//# sourceMappingURL=super-admin-auth.service.js.map