import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { UploadModule } from '../upload/upload.module';
import { SuperAdminJwtStrategy } from './strategies/super-admin-jwt.strategy';
import { SuperAdminAuthController } from './auth/super-admin-auth.controller';
import { SuperAdminAuthService } from './auth/super-admin-auth.service';
import { SuperAdminTenantsController } from './tenants/super-admin-tenants.controller';
import { SuperAdminTenantsService } from './tenants/super-admin-tenants.service';
import { SuperAdminUploadController } from './upload/super-admin-upload.controller';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    PassportModule,
    JwtModule.register({}),
    UploadModule,
  ],
  controllers: [
    SuperAdminAuthController,
    SuperAdminTenantsController,
    SuperAdminUploadController,
  ],
  providers: [
    SuperAdminJwtStrategy,
    SuperAdminAuthService,
    SuperAdminTenantsService,
  ],
})
export class SuperAdminModule {}
