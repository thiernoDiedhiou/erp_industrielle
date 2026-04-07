import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DIRECTION)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Journal d\'audit du tenant (admin/direction)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'entite', required: false, description: 'Ex: Client, Commande, Facture' })
  @ApiQuery({ name: 'action', required: false, description: 'Ex: CREATE, UPDATE, DELETE' })
  @ApiQuery({ name: 'userId', required: false })
  getLogs(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 50,
    @Query('entite') entite?: string,
    @Query('entiteId') entiteId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.auditService.getLogs(user.tenantId, {
      page: +page,
      limite: +limite,
      entite,
      entiteId,
      userId,
      action,
    });
  }

  @Get(':entite/:entiteId')
  @ApiOperation({ summary: 'Historique complet d\'une entité' })
  getHistorique(
    @CurrentUser() user: JwtPayload,
    @Param('entite') entite: string,
    @Param('entiteId') entiteId: string,
  ) {
    return this.auditService.getHistoriqueEntite(user.tenantId, entite, entiteId);
  }
}
