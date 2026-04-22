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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBonLivraisonDto = exports.LigneLivraisonDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class LigneLivraisonDto {
}
exports.LigneLivraisonDto = LigneLivraisonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-produit' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LigneLivraisonDto.prototype, "produitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], LigneLivraisonDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sacs PE 50kg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LigneLivraisonDto.prototype, "description", void 0);
class CreateBonLivraisonDto {
}
exports.CreateBonLivraisonDto = CreateBonLivraisonDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-commande' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "commandeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-client' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Zone Industrielle, Thiès' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "adresseLivraison", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DHL Sénégal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "transporteur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "dateExpedition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ousmane Fall' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "chauffeur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DK-1234-TH' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "vehicule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBonLivraisonDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [LigneLivraisonDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LigneLivraisonDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBonLivraisonDto.prototype, "lignes", void 0);
//# sourceMappingURL=create-bon-livraison.dto.js.map