import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatieresPremiereService } from './matieres-premieres.service';
import { CreateMatierePremiereDto } from './dto/create-matiere-premiere.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Matières Premières')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired('matieres-premieres')
@Controller('matieres-premieres')
export class MatieresPremiereController {
  constructor(private mpService: MatieresPremiereService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des matières premières paginée' })
  getListe(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
    @Query('critique') critique?: string,
  ) {
    return this.mpService.getListe(user.tenantId, { ...query, critique: critique === 'true' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une matière première' })
  getUne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.mpService.getUne(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @Audit({ action: 'CREATE', entite: 'MatierePremiere' })
  @ApiOperation({ summary: 'Créer une matière première' })
  creer(@CurrentUser() user: JwtPayload, @Body() dto: CreateMatierePremiereDto) {
    return this.mpService.creer(user.tenantId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @Audit({ action: 'UPDATE', entite: 'MatierePremiere' })
  @ApiOperation({ summary: 'Modifier une matière première' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMatierePremiereDto>,
  ) {
    return this.mpService.modifier(user.tenantId, id, dto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER, UserRole.PRODUCTION)
  @Audit({ action: 'UPDATE', entite: 'MatierePremiere' })
  @ApiOperation({ summary: 'Ajuster le stock (entree / sortie / ajustement)' })
  ajusterStock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { quantite: number; type: 'entree' | 'sortie' | 'ajustement'; motif?: string },
  ) {
    return this.mpService.ajusterStock(user.tenantId, id, body.quantite, body.type, body.motif);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'DELETE', entite: 'MatierePremiere' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver une MP (stock doit être à 0)' })
  supprimer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.mpService.supprimer(user.tenantId, id);
  }
}
