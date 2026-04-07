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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_service_1 = require("./stock.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let StockController = class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }
    getTableauBord(user) {
        return this.stockService.getTableauBord(user.tenantId);
    }
    getMouvements(user, page = 1, limite = 30, type, matiereId) {
        return this.stockService.getMouvements(user.tenantId, {
            page: +page,
            limite: +limite,
            type,
            matiereId,
        });
    }
    entreeStock(user, body) {
        return this.stockService.entreeStock(user.tenantId, body);
    }
    ajustement(user, id, body) {
        return this.stockService.ajustementInventaire(user.tenantId, id, body.stockReel, body.motif);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)('tableau-bord'),
    (0, swagger_1.ApiOperation)({ summary: 'Vue globale stock avec alertes seuil minimum' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getTableauBord", null);
__decorate([
    (0, common_1.Get)('mouvements'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des mouvements de stock' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('matiereId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getMouvements", null);
__decorate([
    (0, common_1.Post)('entree'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer une entrée de stock' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "entreeStock", null);
__decorate([
    (0, common_1.Post)('matieres/:id/inventaire'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.MAGASINIER),
    (0, swagger_1.ApiOperation)({ summary: 'Ajustement inventaire' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "ajustement", null);
exports.StockController = StockController = __decorate([
    (0, swagger_1.ApiTags)('Stock'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.STOCK),
    (0, common_1.Controller)('stock'),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map