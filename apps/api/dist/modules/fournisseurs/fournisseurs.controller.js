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
exports.FournisseursController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fournisseurs_service_1 = require("./fournisseurs.service");
const create_fournisseur_dto_1 = require("./dto/create-fournisseur.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
let FournisseursController = class FournisseursController {
    constructor(fournisseursService) {
        this.fournisseursService = fournisseursService;
    }
    getListe(user, query) {
        return this.fournisseursService.getListe(user.tenantId, query);
    }
    getUn(user, id) {
        return this.fournisseursService.getUn(user.tenantId, id);
    }
    creer(user, dto) {
        return this.fournisseursService.creer(user.tenantId, dto);
    }
    modifier(user, id, dto) {
        return this.fournisseursService.modifier(user.tenantId, id, dto);
    }
    supprimer(user, id) {
        return this.fournisseursService.supprimer(user.tenantId, id);
    }
    toggle(user, id) {
        return this.fournisseursService.toggleActif(user.tenantId, id);
    }
};
exports.FournisseursController = FournisseursController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des fournisseurs paginée' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un fournisseur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "getUn", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.MAGASINIER),
    (0, audit_decorator_1.Audit)({ action: 'CREATE', entite: 'Fournisseur' }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un fournisseur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_fournisseur_dto_1.CreateFournisseurDto]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "creer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.MAGASINIER),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'Fournisseur' }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un fournisseur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "modifier", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'DELETE', entite: 'Fournisseur' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Archiver un fournisseur (soft delete)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "supprimer", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver un fournisseur' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "toggle", null);
exports.FournisseursController = FournisseursController = __decorate([
    (0, swagger_1.ApiTags)('Fournisseurs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)('fournisseurs'),
    (0, common_1.Controller)('fournisseurs'),
    __metadata("design:paramtypes", [fournisseurs_service_1.FournisseursService])
], FournisseursController);
//# sourceMappingURL=fournisseurs.controller.js.map