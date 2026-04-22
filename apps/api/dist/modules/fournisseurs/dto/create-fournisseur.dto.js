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
exports.CreateFournisseurDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateFournisseurDto {
}
exports.CreateFournisseurDto = CreateFournisseurDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Granulés Sénégal SA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contact@granules.sn' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+221 77 000 00 00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "pays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ibrahima Sow' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "contactPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 14, description: 'Délai de livraison moyen en jours' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateFournisseurDto.prototype, "delaiLivraisonMoyen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4.5, description: 'Note d\'évaluation sur 5' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateFournisseurDto.prototype, "noteEvaluation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '30 jours net' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFournisseurDto.prototype, "conditionsPaiement", void 0);
//# sourceMappingURL=create-fournisseur.dto.js.map