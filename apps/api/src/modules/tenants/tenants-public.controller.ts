import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';

@ApiTags('Public')
@Controller('tenants')
export class TenantsPublicController {
  constructor(private tenantsService: TenantsService) {}

  @Get(':slug/branding')
  @ApiOperation({ summary: 'Charte graphique publique d\'un tenant (sans auth)' })
  getBranding(@Param('slug') slug: string) {
    return this.tenantsService.getBranding(slug);
  }
}
