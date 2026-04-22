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
exports.SuperAdminUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const super_admin_jwt_auth_guard_1 = require("../guards/super-admin-jwt-auth.guard");
const minio_service_1 = require("../../upload/minio.service");
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
let SuperAdminUploadController = class SuperAdminUploadController {
    constructor(minio) {
        this.minio = minio;
    }
    async uploadLogo(file) {
        if (!file)
            throw new common_1.BadRequestException('Aucun fichier reçu');
        const url = await this.minio.uploadLogo(file.buffer, file.originalname, file.mimetype);
        return { url };
    }
};
exports.SuperAdminUploadController = SuperAdminUploadController;
__decorate([
    (0, common_1.Post)('logo'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload du logo d\'un tenant (max 2 Mo, PNG/JPG/WEBP/SVG)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: MAX_SIZE_BYTES },
        fileFilter: (_req, file, cb) => {
            if (ACCEPTED_TYPES.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminUploadController.prototype, "uploadLogo", null);
exports.SuperAdminUploadController = SuperAdminUploadController = __decorate([
    (0, swagger_1.ApiTags)('Super-Admin Upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(super_admin_jwt_auth_guard_1.SuperAdminJwtAuthGuard),
    (0, common_1.Controller)('super-admin/upload'),
    __metadata("design:paramtypes", [minio_service_1.MinioService])
], SuperAdminUploadController);
//# sourceMappingURL=super-admin-upload.controller.js.map