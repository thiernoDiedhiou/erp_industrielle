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
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const crm_service_1 = require("./crm.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
let CrmController = class CrmController {
    constructor(crmService) {
        this.crmService = crmService;
    }
    getClients(user, query) {
        return this.crmService.getClients(user.tenantId, query);
    }
    getClient(user, id) {
        return this.crmService.getClient(user.tenantId, id);
    }
    creerClient(user, dto) {
        return this.crmService.creerClient(user.tenantId, dto);
    }
    modifierClient(user, id, dto) {
        return this.crmService.modifierClient(user.tenantId, id, dto);
    }
    supprimerClient(user, id) {
        return this.crmService.supprimerClient(user.tenantId, id);
    }
    getProduits(user, query) {
        return this.crmService.getProduits(user.tenantId, query);
    }
    getProduit(user, id) {
        return this.crmService.getProduit(user.tenantId, id);
    }
    creerProduit(user, body) {
        return this.crmService.creerProduit(user.tenantId, body);
    }
    modifierProduit(user, id, body) {
        return this.crmService.modifierProduit(user.tenantId, id, body);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Get)('clients'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des clients paginée' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getClients", null);
__decorate([
    (0, common_1.Get)('clients/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un client' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getClient", null);
__decorate([
    (0, common_1.Post)('clients'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, audit_decorator_1.Audit)({ action: 'CREATE', entite: 'Client' }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un client' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "creerClient", null);
__decorate([
    (0, common_1.Put)('clients/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, audit_decorator_1.Audit)({ action: 'UPDATE', entite: 'Client' }),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un client' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "modifierClient", null);
__decorate([
    (0, common_1.Delete)('clients/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN),
    (0, audit_decorator_1.Audit)({ action: 'DELETE', entite: 'Client' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Archiver un client (soft delete)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "supprimerClient", null);
__decorate([
    (0, common_1.Get)('produits'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des produits paginée' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getProduits", null);
__decorate([
    (0, common_1.Get)('produits/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un produit' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getProduit", null);
__decorate([
    (0, common_1.Post)('produits'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un produit' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "creerProduit", null);
__decorate([
    (0, common_1.Put)('produits/:id'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMMERCIAL),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un produit' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "modifierProduit", null);
exports.CrmController = CrmController = __decorate([
    (0, swagger_1.ApiTags)('CRM'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.CRM),
    (0, common_1.Controller)('crm'),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map