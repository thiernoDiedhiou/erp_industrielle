"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("../../prisma/prisma.module");
const upload_module_1 = require("../upload/upload.module");
const super_admin_jwt_strategy_1 = require("./strategies/super-admin-jwt.strategy");
const super_admin_auth_controller_1 = require("./auth/super-admin-auth.controller");
const super_admin_auth_service_1 = require("./auth/super-admin-auth.service");
const super_admin_tenants_controller_1 = require("./tenants/super-admin-tenants.controller");
const super_admin_tenants_service_1 = require("./tenants/super-admin-tenants.service");
const super_admin_upload_controller_1 = require("./upload/super-admin-upload.controller");
let SuperAdminModule = class SuperAdminModule {
};
exports.SuperAdminModule = SuperAdminModule;
exports.SuperAdminModule = SuperAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({}),
            upload_module_1.UploadModule,
        ],
        controllers: [
            super_admin_auth_controller_1.SuperAdminAuthController,
            super_admin_tenants_controller_1.SuperAdminTenantsController,
            super_admin_upload_controller_1.SuperAdminUploadController,
        ],
        providers: [
            super_admin_jwt_strategy_1.SuperAdminJwtStrategy,
            super_admin_auth_service_1.SuperAdminAuthService,
            super_admin_tenants_service_1.SuperAdminTenantsService,
        ],
    })
], SuperAdminModule);
//# sourceMappingURL=super-admin.module.js.map