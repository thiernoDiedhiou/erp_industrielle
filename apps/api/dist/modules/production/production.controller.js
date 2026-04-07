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
exports.ProductionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_service_1 = require("./production.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let ProductionController = class ProductionController {
    constructor(productionService) {
        this.productionService = productionService;
    }
    getOFs(user, page = 1, limite = 20, statut) {
        return this.productionService.getOFs(user.tenantId, { page: +page, limite: +limite, statut });
    }
    getOF(user, id) {
        return this.productionService.getOF(user.tenantId, id);
    }
    creerOF(user, body) {
        return this.productionService.creerOF(user.tenantId, user.sub, body);
    }
    changerStatut(user, id, body) {
        return this.productionService.changerStatutOF(user.tenantId, id, body.statut);
    }
    enregistrerConsommation(user, id, body) {
        return this.productionService.enregistrerConsommation(user.tenantId, id, body);
    }
    getMachines(user) {
        return this.productionService.getMachines(user.tenantId);
    }
    creerMachine(user, body) {
        return this.productionService.creerMachine(user.tenantId, body);
    }
    getMatieresPrmieres(user, page = 1, limite = 20) {
        return this.productionService.getMatieresPrmieres(user.tenantId, { page: +page, limite: +limite });
    }
};
exports.ProductionController = ProductionController;
__decorate([
    (0, common_1.Get)('ofs'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des ordres de fabrication' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "getOFs", null);
__decorate([
    (0, common_1.Get)('ofs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un OF' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "getOF", null);
__decorate([
    (0, common_1.Post)('ofs'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.PRODUCTION),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un ordre de fabrication' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "creerOF", null);
__decorate([
    (0, common_1.Put)('ofs/:id/statut'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.PRODUCTION),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le statut d\'un OF' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "changerStatut", null);
__decorate([
    (0, common_1.Post)('ofs/:id/consommations'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.PRODUCTION, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer une consommation de matière première' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "enregistrerConsommation", null);
__decorate([
    (0, common_1.Get)('machines'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des machines' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "getMachines", null);
__decorate([
    (0, common_1.Post)('machines'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une machine' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "creerMachine", null);
__decorate([
    (0, common_1.Get)('matieres-premieres'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des matières premières' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductionController.prototype, "getMatieresPrmieres", null);
exports.ProductionController = ProductionController = __decorate([
    (0, swagger_1.ApiTags)('Production'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.PRODUCTION),
    (0, common_1.Controller)('production'),
    __metadata("design:paramtypes", [production_service_1.ProductionService])
], ProductionController);
//# sourceMappingURL=production.controller.js.map