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
exports.CreateMatierePremiereDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateMatierePremiereDto {
}
exports.CreateMatierePremiereDto = CreateMatierePremiereDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MP-GRAN-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMatierePremiereDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Granulés PE haute densité' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMatierePremiereDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'granules' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMatierePremiereDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-fournisseur' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMatierePremiereDto.prototype, "fournisseurId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'kg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMatierePremiereDto.prototype, "unite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 850 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMatierePremiereDto.prototype, "prixAchat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMatierePremiereDto.prototype, "stockMinimum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateMatierePremiereDto.prototype, "isRecycle", void 0);
//# sourceMappingURL=create-matiere-premiere.dto.js.map