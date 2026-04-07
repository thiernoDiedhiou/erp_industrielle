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
exports.LogistiqueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logistique_service_1 = require("./logistique.service");
const create_bon_livraison_dto_1 = require("./dto/create-bon-livraison.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let LogistiqueController = class LogistiqueController {
    constructor(logistiqueService) {
        this.logistiqueService = logistiqueService;
    }
    getStats(user) {
        return this.logistiqueService.getStats(user.tenantId);
    }
    getListe(user, page = 1, limite = 20, search, statut) {
        return this.logistiqueService.getListe(user.tenantId, { page: +page, limite: +limite, search, statut });
    }
    getUn(user, id) {
        return this.logistiqueService.getUn(user.tenantId, id);
    }
    creer(user, dto) {
        return this.logistiqueService.creer(user.tenantId, dto);
    }
    modifier(user, id, dto) {
        return this.logistiqueService.modifier(user.tenantId, id, dto);
    }
    changerStatut(user, id, statut) {
        return this.logistiqueService.changerStatut(user.tenantId, id, statut);
    }
};
exports.LogistiqueController = LogistiqueController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques livraisons' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('bons-livraison'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des bons de livraison' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)('bons-livraison/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un bon de livraison' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "getUn", null);
__decorate([
    (0, common_1.Post)('bons-livraison'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un bon de livraison' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bon_livraison_dto_1.CreateBonLivraisonDto]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "creer", null);
__decorate([
    (0, common_1.Put)('bons-livraison/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un BL (statut prepare seulement)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "modifier", null);
__decorate([
    (0, common_1.Patch)('bons-livraison/:id/statut'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le statut d\'un BL (prepare→expedie→livre / annule)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], LogistiqueController.prototype, "changerStatut", null);
exports.LogistiqueController = LogistiqueController = __decorate([
    (0, swagger_1.ApiTags)('Logistique'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)('logistique'),
    (0, common_1.Controller)('logistique'),
    __metadata("design:paramtypes", [logistique_service_1.LogistiqueService])
], LogistiqueController);
//# sourceMappingURL=logistique.controller.js.map