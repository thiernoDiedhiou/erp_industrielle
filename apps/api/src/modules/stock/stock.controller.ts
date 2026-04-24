import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Ajustement inventaire matière première' })
  ajustement(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { stockReel: number; motif: string },
  ) {
    return this.stockService.ajustementInventaire(user.tenantId, id, body.stockReel, body.motif);
  }

  @Get('produits-finis')
  @ApiOperation({ summary: 'Stock produits finis avec alertes seuil minimum' })
  getProduitsFinis(@CurrentUser() user: JwtPayload) {
    return this.stockService.getProduitsFinis(user.tenantId);
  }

  @Post('produits-finis/:id/inventaire')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Ajustement inventaire produit fini' })
  ajustementPF(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { stockReel: number; motif: string },
  ) {
    return this.stockService.ajustementInventairePF(user.tenantId, id, body.stockReel, body.motif);
  }

  @Post('produits-finis')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Créer un produit fini' })
  creerProduit(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.stockService.creerProduit(user.tenantId, body);
  }

  @Patch('produits-finis/:id')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Modifier un produit fini' })
  modifierProduit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.stockService.modifierProduit(user.tenantId, id, body);
  }

  @Delete('produits-finis/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer (archiver) un produit fini' })
  supprimerProduit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.stockService.supprimerProduit(user.tenantId, id);
  }
}
