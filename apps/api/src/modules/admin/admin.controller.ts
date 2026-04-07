import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@saas-erp/shared';

@ApiTags('Administration Plateforme')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales de la plateforme' })
  getStats() {
    return this.adminService.getStatsPlateforme();
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Liste de tous les tenants' })
  getTenants() {
    return this.adminService.getTenants();
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Détail d\'un tenant' })
  getTenant(@Param('id') id: string) {
    return this.adminService.getTenant(id);
  }

  @Patch('tenants/:id/toggle')
  @ApiOperation({ summary: 'Activer / désactiver un tenant' })
  toggleTenant(
    @Param('id') id: string,
    @Body() body: { actif: boolean },
  ) {
    return this.adminService.toggleTenant(id, body.actif);
  }

  @Patch('tenants/:tenantId/modules/:code')
  @ApiOperation({ summary: 'Activer / désactiver un module pour un tenant' })
  toggleModule(
    @Param('tenantId') tenantId: string,
    @Param('code') code: string,
    @Body() body: { actif: boolean },
  ) {
    return this.adminService.toggleModule(tenantId, code, body.actif);
  }

  @Get('modules')
  @ApiOperation({ summary: 'Liste de tous les modules disponibles' })
  getModules() {
    return this.adminService.getModules();
  }
}
