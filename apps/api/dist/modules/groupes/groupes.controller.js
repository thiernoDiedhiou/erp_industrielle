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
exports.GroupesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const groupes_service_1 = require("./groupes.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
let GroupesController = class GroupesController {
    constructor(groupesService) {
        this.groupesService = groupesService;
    }
    getMesPermissions(user) {
        return this.groupesService.getMesPermissions(user.tenantId, user.role);
    }
    getListe(user) {
        return this.groupesService.getListe(user.tenantId);
    }
    getUn(user, id) {
        return this.groupesService.getUn(user.tenantId, id);
    }
    creer(user, body) {
        return this.groupesService.creer(user.tenantId, body);
    }
    modifier(user, id, body) {
        return this.groupesService.modifier(user.tenantId, id, body);
    }
    modifierPermissions(user, id, body) {
        return this.groupesService.modifierPermissions(user.tenantId, id, body.permissions);
    }
    toggleActif(user, id) {
        return this.groupesService.toggleActif(user.tenantId, id);
    }
};
exports.GroupesController = GroupesController;
__decorate([
    (0, common_1.Get)('mes-permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Retourne les permissions du groupe de l\'utilisateur connecté' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "getMesPermissions", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des groupes du tenant avec leurs permissions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un groupe' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "getUn", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'CREATE', entite: 'Groupe' }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un groupe personnalisé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "creer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'Groupe' }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un groupe (nom, description, permissions)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "modifier", null);
__decorate([
    (0, common_1.Patch)(':id/permissions'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'Groupe' }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour uniquement les permissions d\'un groupe' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "modifierPermissions", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-actif'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'Groupe' }),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver un groupe' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GroupesController.prototype, "toggleActif", null);
exports.GroupesController = GroupesController = __decorate([
    (0, swagger_1.ApiTags)('Groupes & Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('groupes'),
    __metadata("design:paramtypes", [groupes_service_1.GroupesService])
], GroupesController);
//# sourceMappingURL=groupes.controller.js.map