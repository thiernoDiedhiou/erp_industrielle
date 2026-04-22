import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantsPublicController } from './tenants-public.controller';

@Module({
  providers: [TenantsService],
  controllers: [TenantsController, TenantsPublicController],
  exports: [TenantsService],
})
export class TenantsModule {}
