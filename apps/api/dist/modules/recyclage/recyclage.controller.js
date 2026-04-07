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
exports.RecyclageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recyclage_service_1 = require("./recyclage.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let RecyclageController = class RecyclageController {
    constructor(recyclageService) {
        this.recyclageService = recyclageService;
    }
    getCollectes(user, page = 1, limite = 20) {
        return this.recyclageService.getCollectes(user.tenantId, { page: +page, limite: +limite });
    }
    getStats(user) {
        return this.recyclageService.getStats(user.tenantId);
    }
    creerCollecte(user, body) {
        return this.recyclageService.creerCollecte(user.tenantId, body);
    }
    changerStatut(user, id, body) {
        return this.recyclageService.changerStatut(user.tenantId, id, body.statut);
    }
};
exports.RecyclageController = RecyclageController;
__decorate([
    (0, common_1.Get)('collectes'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des collectes de déchets' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecyclageController.prototype, "getCollectes", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques recyclage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecyclageController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('collectes'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer une collecte' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RecyclageController.prototype, "creerCollecte", null);
__decorate([
    (0, common_1.Put)('collectes/:id/statut'),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le statut d\'une collecte' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecyclageController.prototype, "changerStatut", null);
exports.RecyclageController = RecyclageController = __decorate([
    (0, swagger_1.ApiTags)('Recyclage'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.RECYCLAGE),
    (0, common_1.Controller)('recyclage'),
    __metadata("design:paramtypes", [recyclage_service_1.RecyclageService])
], RecyclageController);
//# sourceMappingURL=recyclage.controller.js.map