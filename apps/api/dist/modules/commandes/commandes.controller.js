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
exports.CommandesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const commandes_service_1 = require("./commandes.service");
const create_commande_dto_1 = require("./dto/create-commande.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let CommandesController = class CommandesController {
    constructor(commandesService) {
        this.commandesService = commandesService;
    }
    getCommandes(user, page = 1, limite = 20, statut, clientId) {
        return this.commandesService.getCommandes(user.tenantId, {
            page: +page,
            limite: +limite,
            statut,
            clientId,
        });
    }
    getCommande(user, id) {
        return this.commandesService.getCommande(user.tenantId, id);
    }
    creerCommande(user, dto) {
        return this.commandesService.creerCommande(user.tenantId, user.sub, dto);
    }
    changerStatut(user, id, body) {
        return this.commandesService.changerStatut(user.tenantId, id, user.sub, user.role, body.statut, body.commentaire);
    }
    supprimerCommande(user, id) {
        return this.commandesService.supprimerCommande(user.tenantId, id);
    }
};
exports.CommandesController = CommandesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des commandes avec filtres' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('statut')),
    __param(4, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "getCommandes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une commande avec historique' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "getCommande", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une commande' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_commande_dto_1.CreateCommandeDto]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "creerCommande", null);
__decorate([
    (0, common_1.Put)(':id/statut'),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le statut (workflow vérifié)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "changerStatut", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une commande (brouillon uniquement)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "supprimerCommande", null);
exports.CommandesController = CommandesController = __decorate([
    (0, swagger_1.ApiTags)('Commandes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.COMMANDES),
    (0, common_1.Controller)('commandes'),
    __metadata("design:paramtypes", [commandes_service_1.CommandesService])
], CommandesController);
//# sourceMappingURL=commandes.controller.js.map