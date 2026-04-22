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
exports.BomController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bom_service_1 = require("./bom.service");
const create_bom_dto_1 = require("./dto/create-bom.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BomController = class BomController {
    constructor(bomService) {
        this.bomService = bomService;
    }
    getListe(req, page, limite, search, actif) {
        return this.bomService.getListe(req.user.tenantId, {
            page: page ? parseInt(page) : undefined,
            limite: limite ? parseInt(limite) : undefined,
            search,
            actif: actif !== undefined ? actif === 'true' : undefined,
        });
    }
    getUn(req, id) {
        return this.bomService.getUn(req.user.tenantId, id);
    }
    calculerCout(req, id, quantite) {
        return this.bomService.calculerCout(req.user.tenantId, id, parseFloat(quantite));
    }
    creer(req, dto) {
        return this.bomService.creer(req.user.tenantId, dto);
    }
    modifier(req, id, dto) {
        return this.bomService.modifier(req.user.tenantId, id, dto);
    }
    toggleActif(req, id) {
        return this.bomService.toggleActif(req.user.tenantId, id);
    }
    supprimer(req, id) {
        return this.bomService.supprimer(req.user.tenantId, id);
    }
};
exports.BomController = BomController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des nomenclatures produits (BOM)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'actif', required: false, type: Boolean }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limite')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('actif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "getListe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une nomenclature avec ses items' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "getUn", null);
__decorate([
    (0, common_1.Get)(':id/cout'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculer le coût théorique d\'un OF basé sur cette nomenclature' }),
    (0, swagger_1.ApiQuery)({ name: 'quantite', required: true, type: Number }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('quantite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "calculerCout", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle nomenclature' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bom_dto_1.CreateBomDto]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "creer", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une nomenclature (et ses items si fournis)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "modifier", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-actif'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer / désactiver une nomenclature' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "toggleActif", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une nomenclature' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "supprimer", null);
exports.BomController = BomController = __decorate([
    (0, swagger_1.ApiTags)('BOM — Nomenclatures'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bom'),
    __metadata("design:paramtypes", [bom_service_1.BomService])
], BomController);
//# sourceMappingURL=bom.controller.js.map