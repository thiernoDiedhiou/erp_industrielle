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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const shared_1 = require("@saas-erp/shared");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getStats() {
        return this.adminService.getStatsPlateforme();
    }
    getTenants() {
        return this.adminService.getTenants();
    }
    getTenant(id) {
        return this.adminService.getTenant(id);
    }
    toggleTenant(id, body) {
        return this.adminService.toggleTenant(id, body.actif);
    }
    toggleModule(tenantId, code, body) {
        return this.adminService.toggleModule(tenantId, code, body.actif);
    }
    getModules() {
        return this.adminService.getModules();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques globales de la plateforme' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste de tous les tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Get)('tenants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Patch)('tenants/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver un tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleTenant", null);
__decorate([
    (0, common_1.Patch)('tenants/:tenantId/modules/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver un module pour un tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleModule", null);
__decorate([
    (0, common_1.Get)('modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste de tous les modules disponibles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getModules", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Administration Plateforme'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map