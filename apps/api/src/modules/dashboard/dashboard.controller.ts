import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@saas-erp/shared';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs principaux du tableau de bord' })
  getKpis(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getKpis(user.tenantId);
  }

  @Get('activite-recente')
  @ApiOperation({ summary: 'Activité récente (commandes + OFs)' })
  getActiviteRecente(
    @CurrentUser() user: JwtPayload,
    @Query('limite') limite = 10,
  ) {
    return this.dashboardService.getActiviteRecente(user.tenantId, +limite);
  }

  @Get('reporting/ca-mensuel')
  @ApiOperation({ summary: 'CA mensuel sur 12 mois glissants' })
  getCaMensuel(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getCaMensuel(user.tenantId);
  }

  @Get('reporting/stock-critique')
  @ApiOperation({ summary: 'Matières premières les plus critiques' })
  getStockCritique(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStockCritique(user.tenantId);
  }

  @Get('reporting/commandes-statut')
  @ApiOperation({ summary: 'Répartition commandes par statut' })
  getCommandesParStatut(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getCommandesParStatut(user.tenantId);
  }

  @Get('reporting/top-clients')
  @ApiOperation({ summary: 'Top 5 clients par CA' })
  getTopClients(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getTopClients(user.tenantId);
  }
}
