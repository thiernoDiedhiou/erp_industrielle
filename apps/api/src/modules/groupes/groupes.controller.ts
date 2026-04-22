import {
  Controller, Get, Post, Put, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupesService, PermissionsMap } from './groupes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Groupes & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groupes')
export class GroupesController {
  constructor(private groupesService: GroupesService) {}

  @Get('mes-permissions')
  @ApiOperation({ summary: 'Retourne les permissions du groupe de l\'utilisateur connecté' })
  getMesPermissions(@CurrentUser() user: JwtPayload) {
    return this.groupesService.getMesPermissions(user.tenantId, user.role);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Liste des groupes du tenant avec leurs permissions' })
  getListe(@CurrentUser() user: JwtPayload) {
    return this.groupesService.getListe(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Détail d\'un groupe' })
  getUn(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.groupesService.getUn(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'CREATE', entite: 'Groupe' })
  @ApiOperation({ summary: 'Créer un groupe personnalisé' })
  creer(
    @CurrentUser() user: JwtPayload,
    @Body() body: { code: string; nom: string; description?: string; permissions?: PermissionsMap },
  ) {
    return this.groupesService.creer(user.tenantId, body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'UPDATE', entite: 'Groupe' })
  @ApiOperation({ summary: 'Modifier un groupe (nom, description, permissions)' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { nom?: string; description?: string; permissions?: PermissionsMap },
  ) {
    return this.groupesService.modifier(user.tenantId, id, body);
  }

  @Patch(':id/permissions')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'UPDATE', entite: 'Groupe' })
  @ApiOperation({ summary: 'Mettre à jour uniquement les permissions d\'un groupe' })
  modifierPermissions(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { permissions: PermissionsMap },
  ) {
    return this.groupesService.modifierPermissions(user.tenantId, id, body.permissions);
  }

  @Patch(':id/toggle-actif')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'UPDATE', entite: 'Groupe' })
  @ApiOperation({ summary: 'Activer / désactiver un groupe' })
  toggleActif(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.groupesService.toggleActif(user.tenantId, id);
  }
}
