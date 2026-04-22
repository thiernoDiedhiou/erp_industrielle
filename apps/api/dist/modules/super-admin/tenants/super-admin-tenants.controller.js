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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminTenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_tenants_service_1 = require("./super-admin-tenants.service");
const super_admin_jwt_auth_guard_1 = require("../guards/super-admin-jwt-auth.guard");
let SuperAdminTenantsController = class SuperAdminTenantsController {
    constructor(service) {
        this.service = service;
    }
    getListe(search) {
        return this.service.getListe(search);
    }
    getStats() {
        return this.service.getStats();
    }
    getUn(id) {
        return this.service.getUn(id);
    }
    creer(body) {
        return this.service.creer(body);
    }
    modifier(id, body) {
        return this.service.modifier(id, body);
    }
    toggleActif(id) {
        return this.service.toggleActif(id);
    }
    modifierModules(id, body) {
        return this.service.modifierModules(id, body.moduleCodes);
    }
    creerUser(tenantId, body) {
        return this.service.creerUser(tenantId, body);
    }
};
exports.SuperAdminTenantsController = SuperAdminTenantsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "getUn", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "creer", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "modifier", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-actif'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "toggleActif", null);
__decorate([
    (0, common_1.Patch)(':id/modules'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "modifierModules", null);
__decorate([
    (0, common_1.Post)(':id/users'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminTenantsController.prototype, "creerUser", null);
exports.SuperAdminTenantsController = SuperAdminTenantsController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin — Tenants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(super_admin_jwt_auth_guard_1.SuperAdminJwtAuthGuard),
    (0, common_1.Controller)('super-admin/tenants'),
    __metadata("design:paramtypes", [super_admin_tenants_service_1.SuperAdminTenantsService])
], SuperAdminTenantsController);
//# sourceMappingURL=super-admin-tenants.controller.js.map