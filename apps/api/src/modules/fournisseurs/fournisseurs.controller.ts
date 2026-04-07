import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Fournisseurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired('fournisseurs')
@Controller('fournisseurs')
export class FournisseursController {
  constructor(private fournisseursService: FournisseursService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des fournisseurs paginée' })
  getListe(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.fournisseursService.getListe(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un fournisseur' })
  getUn(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.fournisseursService.getUn(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @Audit({ action: 'CREATE', entite: 'Fournisseur' })
  @ApiOperation({ summary: 'Créer un fournisseur' })
  creer(@CurrentUser() user: JwtPayload, @Body() dto: CreateFournisseurDto) {
    return this.fournisseursService.creer(user.tenantId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MAGASINIER)
  @Audit({ action: 'UPDATE', entite: 'Fournisseur' })
  @ApiOperation({ summary: 'Modifier un fournisseur' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateFournisseurDto>,
  ) {
    return this.fournisseursService.modifier(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'DELETE', entite: 'Fournisseur' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver un fournisseur (soft delete)' })
  supprimer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.fournisseursService.supprimer(user.tenantId, id);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activer / désactiver un fournisseur' })
  toggle(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.fournisseursService.toggleActif(user.tenantId, id);
  }
}
