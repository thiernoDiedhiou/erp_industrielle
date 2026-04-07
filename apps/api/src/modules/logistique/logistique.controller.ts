import {
  Controller, Get, Post, Put, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogistiqueService } from './logistique.service';
import { CreateBonLivraisonDto } from './dto/create-bon-livraison.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';

@ApiTags('Logistique')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired('logistique')
@Controller('logistique')
export class LogistiqueController {
  constructor(private logistiqueService: LogistiqueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques livraisons' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.logistiqueService.getStats(user.tenantId);
  }

  @Get('bons-livraison')
  @ApiOperation({ summary: 'Liste des bons de livraison' })
  getListe(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
    @Query('search') search?: string,
    @Query('statut') statut?: string,
  ) {
    return this.logistiqueService.getListe(user.tenantId, { page: +page, limite: +limite, search, statut });
  }

  @Get('bons-livraison/:id')
  @ApiOperation({ summary: 'Détail d\'un bon de livraison' })
  getUn(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.logistiqueService.getUn(user.tenantId, id);
  }

  @Post('bons-livraison')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Créer un bon de livraison' })
  creer(@CurrentUser() user: JwtPayload, @Body() dto: CreateBonLivraisonDto) {
    return this.logistiqueService.creer(user.tenantId, dto);
  }

  @Put('bons-livraison/:id')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Modifier un BL (statut prepare seulement)' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateBonLivraisonDto>,
  ) {
    return this.logistiqueService.modifier(user.tenantId, id, dto);
  }

  @Patch('bons-livraison/:id/statut')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Changer le statut d\'un BL (prepare→expedie→livre / annule)' })
  changerStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('statut') statut: string,
  ) {
    return this.logistiqueService.changerStatut(user.tenantId, id, statut);
  }
}
