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
exports.FacturationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facturation_service_1 = require("./facturation.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const module_active_guard_1 = require("../../common/guards/module-active.guard");
const module_required_decorator_1 = require("../../common/decorators/module-required.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_1 = require("@saas-erp/shared");
let FacturationController = class FacturationController {
    constructor(facturationService) {
        this.facturationService = facturationService;
    }
    getPaiements(user, page = 1, limite = 30) {
        return this.facturationService.getPaiements(user.tenantId, { page: +page, limite: +limite });
    }
    getFactures(user, page = 1, limite = 20, statut) {
        return this.facturationService.getFactures(user.tenantId, {
            page: +page,
            limite: +limite,
            statut,
        });
    }
    getStats(user) {
        return this.facturationService.getStats(user.tenantId);
    }
    getFacture(user, id) {
        return this.facturationService.getFacture(user.tenantId, id);
    }
    creerDepuisCommande(user, commandeId) {
        return this.facturationService.creerDepuisCommande(user.tenantId, commandeId);
    }
    async getPdf(user, id, res) {
        const buffer = await this.facturationService.genererPdf(user.tenantId, id);
        res.status(common_1.HttpStatus.OK)
            .set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
            'Content-Length': buffer.length,
        })
            .end(buffer);
    }
    enregistrerPaiement(user, id, body) {
        return this.facturationService.enregistrerPaiement(user.tenantId, id, body);
    }
};
exports.FacturationController = FacturationController;
__decorate([
    (0, common_1.Get)('paiements'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMPTABLE, shared_1.UserRole.DIRECTION),
    (0, swagger_1.ApiOperation)({ summary: 'Historique global des paiements reçus' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)('factures'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des factures' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getFactures", null);
__decorate([
    (0, common_1.Get)('factures/stats'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.DIRECTION, shared_1.UserRole.COMPTABLE),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques facturation (CA, impayés)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('factures/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une facture' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "getFacture", null);
__decorate([
    (0, common_1.Post)('factures/depuis-commande/:commandeId'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMPTABLE, shared_1.UserRole.COMMERCIAL),
    (0, swagger_1.ApiOperation)({ summary: 'Générer une facture depuis une commande livrée' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('commandeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "creerDepuisCommande", null);
__decorate([
    (0, common_1.Get)('factures/:id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Télécharger la facture en PDF' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FacturationController.prototype, "getPdf", null);
__decorate([
    (0, common_1.Post)('factures/:id/paiements'),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.ADMIN, shared_1.UserRole.COMPTABLE),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer un paiement sur une facture' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FacturationController.prototype, "enregistrerPaiement", null);
exports.FacturationController = FacturationController = __decorate([
    (0, swagger_1.ApiTags)('Facturation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, module_active_guard_1.ModuleActiveGuard),
    (0, module_required_decorator_1.ModuleRequired)(shared_1.ModuleCode.FACTURATION),
    (0, common_1.Controller)('facturation'),
    __metadata("design:paramtypes", [facturation_service_1.FacturationService])
], FacturationController);
//# sourceMappingURL=facturation.controller.js.map