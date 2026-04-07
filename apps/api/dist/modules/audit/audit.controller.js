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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    getLogs(user, page = 1, limite = 50, entite, entiteId, userId, action) {
        return this.auditService.getLogs(user.tenantId, {
            page: +page,
            limite: +limite,
            entite,
            entiteId,
            userId,
            action,
        });
    }
    getHistorique(user, entite, entiteId) {
        return this.auditService.getHistoriqueEntite(user.tenantId, entite, entiteId);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Journal d\'audit du tenant (admin/direction)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entite', required: false, description: 'Ex: Client, Commande, Facture' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Ex: CREATE, UPDATE, DELETE' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('entite')),
    __param(4, (0, common_1.Query)('entiteId')),
    __param(5, (0, common_1.Query)('userId')),
    __param(6, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)(':entite/:entiteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique complet d\'une entité' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entite')),
    __param(2, (0, common_1.Param)('entiteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getHistorique", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.DIRECTION),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map