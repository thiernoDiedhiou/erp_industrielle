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
exports.CreateClientDto = exports.TYPES_CLIENT = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
exports.TYPES_CLIENT = ['industriel', 'agricole', 'alimentaire', 'distributeur', 'autre'];
class CreateClientDto {
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Plastique Dakar SA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'industriel', enum: exports.TYPES_CLIENT }),
    (0, class_validator_1.IsIn)(exports.TYPES_CLIENT),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contact@plastiquedk.sn' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+221 77 123 45 67' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Zone Industrielle, Dakar' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dakar' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "ville", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "ninea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'actif' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mamadou Diallo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-commercial' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "commercialId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5000000, description: 'Plafond de crédit en FCFA' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateClientDto.prototype, "plafondCredit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, description: 'Délai de paiement en jours' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(365),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateClientDto.prototype, "delaiPaiement", void 0);
//# sourceMappingURL=create-client.dto.js.map