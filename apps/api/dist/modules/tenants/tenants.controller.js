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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    getTenantCourant(user) {
        return this.tenantsService.getTenantCourant(user.tenantId);
    }
    getUtilisateurs(user, page = 1, limite = 20) {
        return this.tenantsService.getUtilisateurs(user.tenantId, +page, +limite);
    }
    creerUtilisateur(user, body) {
        return this.tenantsService.creerUtilisateur(user.tenantId, body);
    }
    toggleUtilisateur(user, id, body) {
        return this.tenantsService.toggleUtilisateur(user.tenantId, id, body.actif);
    }
    changerRole(user, id, body) {
        return this.tenantsService.changerRole(user.tenantId, id, body.role);
    }
    toggleModule(user, code, body) {
        return this.tenantsService.toggleModule(user.tenantId, code, body.actif);
    }
    getSettings(user) {
        return this.tenantsService.getSettings(user.tenantId);
    }
    upsertSetting(user, cle, body) {
        return this.tenantsService.upsertSetting(user.tenantId, cle, body.valeur);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Informations du tenant courant avec modules' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getTenantCourant", null);
__decorate([
    (0, common_1.Get)('utilisateurs'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des utilisateurs du tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getUtilisateurs", null);
__decorate([
    (0, common_1.Post)('utilisateurs'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un utilisateur dans le tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "creerUtilisateur", null);
__decorate([
    (0, common_1.Patch)('utilisateurs/:id/toggle'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activer/désactiver un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "toggleUtilisateur", null);
__decorate([
    (0, common_1.Patch)('utilisateurs/:id/role'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le rôle d\'un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "changerRole", null);
__decorate([
    (0, common_1.Patch)('modules/:code'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activer/désactiver un module' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "toggleModule", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Paramètres de configuration du tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings/:cle'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer ou modifier un paramètre' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('cle')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "upsertSetting", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tenant'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map