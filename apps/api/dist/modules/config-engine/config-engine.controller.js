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
exports.ConfigEngineController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_engine_service_1 = require("./config-engine.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let ConfigEngineController = class ConfigEngineController {
    constructor(configService) {
        this.configService = configService;
    }
    getEnums(user, entite) {
        return this.configService.getEnums(user.tenantId, entite);
    }
    creerEnum(user, body) {
        return this.configService.creerEnum(user.tenantId, body);
    }
    modifierEnum(user, id, body) {
        return this.configService.modifierEnum(user.tenantId, id, body);
    }
    getChamps(user, entite) {
        return this.configService.getChamps(user.tenantId, entite);
    }
    creerChamp(user, body) {
        return this.configService.creerChamp(user.tenantId, body);
    }
    modifierChamp(user, id, body) {
        return this.configService.modifierChamp(user.tenantId, id, body);
    }
    getValeurs(user, entite, entiteId) {
        return this.configService.getValeursChamps(user.tenantId, entite, entiteId);
    }
    upsertValeur(user, entite, entiteId, body) {
        return this.configService.upsertValeurChamp(user.tenantId, entite, entiteId, body.champId, body.valeur);
    }
    getWorkflows(user) {
        return this.configService.getWorkflows(user.tenantId);
    }
    getWorkflow(user, entite) {
        return this.configService.getWorkflow(user.tenantId, entite);
    }
};
exports.ConfigEngineController = ConfigEngineController;
__decorate([
    (0, common_1.Get)('enums'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des enums personnalisés du tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('entite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "getEnums", null);
__decorate([
    (0, common_1.Post)('enums'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un enum personnalisé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "creerEnum", null);
__decorate([
    (0, common_1.Patch)('enums/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un enum' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "modifierEnum", null);
__decorate([
    (0, common_1.Get)('champs'),
    (0, swagger_1.ApiOperation)({ summary: 'Champs personnalisés du tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('entite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "getChamps", null);
__decorate([
    (0, common_1.Post)('champs'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un champ personnalisé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "creerChamp", null);
__decorate([
    (0, common_1.Patch)('champs/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un champ personnalisé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "modifierChamp", null);
__decorate([
    (0, common_1.Get)('valeurs/:entite/:entiteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Valeurs des champs personnalisés d\'une entité' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entite')),
    __param(2, (0, common_1.Param)('entiteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "getValeurs", null);
__decorate([
    (0, common_1.Post)('valeurs/:entite/:entiteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer la valeur d\'un champ personnalisé' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entite')),
    __param(2, (0, common_1.Param)('entiteId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "upsertValeur", null);
__decorate([
    (0, common_1.Get)('workflows'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les workflows du tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "getWorkflows", null);
__decorate([
    (0, common_1.Get)('workflows/:entite'),
    (0, swagger_1.ApiOperation)({ summary: 'Workflow d\'une entité spécifique' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigEngineController.prototype, "getWorkflow", null);
exports.ConfigEngineController = ConfigEngineController = __decorate([
    (0, swagger_1.ApiTags)('Config Engine'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [config_engine_service_1.ConfigEngineService])
], ConfigEngineController);
//# sourceMappingURL=config-engine.controller.js.map