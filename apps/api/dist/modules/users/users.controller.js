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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getListe(user, query, role) {
        return this.usersService.getListe(user.tenantId, { ...query, role });
    }
    getUn(user, id) {
        return this.usersService.getUn(user.tenantId, id);
    }
    creer(user, dto) {
        return this.usersService.creer(user.tenantId, dto);
    }
    modifier(user, id, dto) {
        return this.usersService.modifier(user.tenantId, id, dto);
    }
    toggleActif(user, id) {
        return this.usersService.toggleActif(user.tenantId, id);
    }
    reinitialiserMotDePasse(user, id) {
        return this.usersService.reinitialiserMotDePasse(user.tenantId, id);
    }
    supprimer(user, id) {
        return this.usersService.supprimer(user.tenantId, id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des utilisateurs du tenant' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUn", null);
__decorate([
    (0, common_1.Post)(),
    (0, audit_decorator_1.Audit)({ action: 'CREATE', entite: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "creer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "modifier", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-actif'),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver un utilisateur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "toggleActif", null);
__decorate([
    (0, common_1.Patch)(':id/reset-password'),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Réinitialiser le mot de passe (génère un mot de passe temporaire)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "reinitialiserMotDePasse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, audit_decorator_1.Audit)({ action: 'DELETE', entite: 'User' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un utilisateur (soft delete)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "supprimer", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Utilisateurs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map