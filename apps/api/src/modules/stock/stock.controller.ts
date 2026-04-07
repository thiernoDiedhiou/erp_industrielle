import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode, UserRole } from '@saas-erp/shared';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.STOCK)
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('tableau-bord')
  @ApiOperation({ summary: 'Vue globale stock avec alertes seuil minimum' })
  getTableauBord(@CurrentUser() user: JwtPayload) {
    return this.stockService.getTableauBord(user.tenantId);
  }

  @Get('mouvements')
  @ApiOperation({ summary: 'Historique des mouvements de stock' })
  getMouvements(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 30,
    @Query('type') type?: string,
    @Query('matiereId') matiereId?: string,
  ) {
    return this.stockService.getMouvements(user.tenantId, {
      page: +page,
      limite: +limite,
      type,
      matiereId,
    });
  }

  @Post('entree')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Enregistrer une entrée de stock' })
  entreeStock(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.stockService.entreeStock(user.tenantId, body);
  }

  @Post('matieres/:id/inventaire')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Ajustement inventaire' })
  ajustement(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { stockReel: number; motif: string },
  ) {
    return this.stockService.ajustementInventaire(user.tenantId, id, body.stockReel, body.motif);
  }
}
