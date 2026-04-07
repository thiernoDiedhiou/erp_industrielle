import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecyclageService } from './recyclage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode } from '@saas-erp/shared';

@ApiTags('Recyclage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.RECYCLAGE)
@Controller('recyclage')
export class RecyclageController {
  constructor(private recyclageService: RecyclageService) {}

  @Get('collectes')
  @ApiOperation({ summary: 'Liste des collectes de déchets' })
  getCollectes(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
  ) {
    return this.recyclageService.getCollectes(user.tenantId, { page: +page, limite: +limite });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques recyclage' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.recyclageService.getStats(user.tenantId);
  }

  @Post('collectes')
  @ApiOperation({ summary: 'Enregistrer une collecte' })
  creerCollecte(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.recyclageService.creerCollecte(user.tenantId, body);
  }

  @Put('collectes/:id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'une collecte' })
  changerStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { statut: string },
  ) {
    return this.recyclageService.changerStatut(user.tenantId, id, body.statut);
  }
}
