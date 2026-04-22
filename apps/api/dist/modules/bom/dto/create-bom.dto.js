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
exports.CreateBomDto = exports.BomItemDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class BomItemDto {
}
exports.BomItemDto = BomItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-matiere-premiere', description: 'Matière première utilisée (exclusif avec produitId)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BomItemDto.prototype, "matierePremiereId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-produit', description: 'Sous-produit utilisé (exclusif avec matierePremiereId)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BomItemDto.prototype, "produitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BomItemDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'kg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BomItemDto.prototype, "unite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2.0, description: 'Taux de pertes en pourcentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BomItemDto.prototype, "pertes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Granulés haute densité colorés en bleu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BomItemDto.prototype, "notes", void 0);
class CreateBomDto {
}
exports.CreateBomDto = CreateBomDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nomenclature Sac PE 50kg v1.0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBomDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-produit-fini', description: 'ID de la matière première ou produit fini' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBomDto.prototype, "produitFiniId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBomDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBomDto.prototype, "actif", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Nomenclature standard pour sacs basse pression' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBomDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BomItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BomItemDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBomDto.prototype, "items", void 0);
//# sourceMappingURL=create-bom.dto.js.map