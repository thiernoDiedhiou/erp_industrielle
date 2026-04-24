import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('BOM — Nomenclatures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des nomenclatures produits (BOM)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'actif', required: false, type: Boolean })
  getListe(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limite') limite?: string,
    @Query('search') search?: string,
    @Query('actif') actif?: string,
  ) {
    return this.bomService.getListe(req.user.tenantId, {
      page: page ? parseInt(page) : undefined,
      limite: limite ? parseInt(limite) : undefined,
      search,
      actif: actif !== undefined ? actif === 'true' : undefined,
    });
  }

  @Get('actifs')
  @ApiOperation({ summary: 'Toutes les nomenclatures actives avec items (suggestions OF)' })
  getActifs(@Req() req: any) {
    return this.bomService.getActifs(req.user.tenantId);
  }

  @Get('ressources/matieres-premieres')
  @ApiOperation({ summary: 'Liste des MP disponibles pour composer une nomenclature' })
  getMatieresPremieresDisponibles(@Req() req: any) {
    return this.bomService.getMatieresPremieresDisponibles(req.user.tenantId);
  }

  @Get('pour-produit/:produitId')
  @ApiOperation({ summary: 'BOM actif pour un produit donné (dialog OF)' })
  getPourProduit(@Req() req: any, @Param('produitId') produitId: string) {
    return this.bomService.getPourProduit(req.user.tenantId, produitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une nomenclature avec ses items' })
  getUn(@Req() req: any, @Param('id') id: string) {
    return this.bomService.getUn(req.user.tenantId, id);
  }

  @Get(':id/cout')
  @ApiOperation({ summary: 'Calculer le coût théorique d\'un OF basé sur cette nomenclature' })
  @ApiQuery({ name: 'quantite', required: true, type: Number })
  calculerCout(
    @Req() req: any,
    @Param('id') id: string,
    @Query('quantite') quantite: string,
  ) {
    return this.bomService.calculerCout(req.user.tenantId, id, parseFloat(quantite));
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle nomenclature' })
  creer(@Req() req: any, @Body() dto: CreateBomDto) {
    return this.bomService.creer(req.user.tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une nomenclature (et ses items si fournis)' })
  modifier(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateBomDto>) {
    return this.bomService.modifier(req.user.tenantId, id, dto);
  }

  @Patch(':id/toggle-actif')
  @ApiOperation({ summary: 'Activer / désactiver une nomenclature' })
  toggleActif(@Req() req: any, @Param('id') id: string) {
    return this.bomService.toggleActif(req.user.tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une nomenclature' })
  supprimer(@Req() req: any, @Param('id') id: string) {
    return this.bomService.supprimer(req.user.tenantId, id);
  }
}
