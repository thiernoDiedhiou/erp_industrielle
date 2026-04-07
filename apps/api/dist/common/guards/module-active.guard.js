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
exports.ModuleActiveGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const module_required_decorator_1 = require("../decorators/module-required.decorator");
const redis_service_1 = require("../../redis/redis.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let ModuleActiveGuard = class ModuleActiveGuard {
    constructor(reflector, redis, prisma) {
        this.reflector = reflector;
        this.redis = redis;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const moduleCode = this.reflector.getAllAndOverride(module_required_decorator_1.MODULE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!moduleCode)
            return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user?.tenantId)
            return false;
        const modulesActifs = await this.getModulesActifs(user.tenantId);
        if (!modulesActifs.includes(moduleCode)) {
            throw new common_1.ForbiddenException(`Module "${moduleCode}" non activé pour ce tenant`);
        }
        return true;
    }
    async getModulesActifs(tenantId) {
        const cached = await this.redis.getModulesActifs(tenantId);
        if (cached)
            return cached;
        const tenantModules = await this.prisma.tenantModule.findMany({
            where: { tenantId, actif: true },
            include: { module: { select: { code: true } } },
        });
        const codes = tenantModules.map((tm) => tm.module.code);
        await this.redis.setModulesActifs(tenantId, codes);
        return codes;
    }
};
exports.ModuleActiveGuard = ModuleActiveGuard;
exports.ModuleActiveGuard = ModuleActiveGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        redis_service_1.RedisService,
        prisma_service_1.PrismaService])
], ModuleActiveGuard);
//# sourceMappingURL=module-active.guard.js.map