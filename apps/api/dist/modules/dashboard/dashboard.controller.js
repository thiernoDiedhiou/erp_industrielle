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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getKpis(user) {
        return this.dashboardService.getKpis(user.tenantId);
    }
    getActiviteRecente(user, limite = 10) {
        return this.dashboardService.getActiviteRecente(user.tenantId, +limite);
    }
    getCaMensuel(user) {
        return this.dashboardService.getCaMensuel(user.tenantId);
    }
    getStockCritique(user) {
        return this.dashboardService.getStockCritique(user.tenantId);
    }
    getCommandesParStatut(user) {
        return this.dashboardService.getCommandesParStatut(user.tenantId);
    }
    getTopClients(user) {
        return this.dashboardService.getTopClients(user.tenantId);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'KPIs principaux du tableau de bord' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('activite-recente'),
    (0, swagger_1.ApiOperation)({ summary: 'Activité récente (commandes + OFs)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getActiviteRecente", null);
__decorate([
    (0, common_1.Get)('reporting/ca-mensuel'),
    (0, swagger_1.ApiOperation)({ summary: 'CA mensuel sur 12 mois glissants' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getCaMensuel", null);
__decorate([
    (0, common_1.Get)('reporting/stock-critique'),
    (0, swagger_1.ApiOperation)({ summary: 'Matières premières les plus critiques' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getStockCritique", null);
__decorate([
    (0, common_1.Get)('reporting/commandes-statut'),
    (0, swagger_1.ApiOperation)({ summary: 'Répartition commandes par statut' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getCommandesParStatut", null);
__decorate([
    (0, common_1.Get)('reporting/top-clients'),
    (0, swagger_1.ApiOperation)({ summary: 'Top 5 clients par CA' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getTopClients", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map