import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';

@ApiTags('Tenant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenant')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Informations du tenant courant avec modules' })
  getTenantCourant(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.getTenantCourant(user.tenantId);
  }

  @Get('utilisateurs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Liste des utilisateurs du tenant' })
  getUtilisateurs(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
  ) {
    return this.tenantsService.getUtilisateurs(user.tenantId, +page, +limite);
  }

  @Post('utilisateurs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un utilisateur dans le tenant' })
  creerUtilisateur(
    @CurrentUser() user: JwtPayload,
    @Body() body: { nom: string; email: string; role: string; telephone?: string; motDePasse?: string },
  ) {
    return this.tenantsService.creerUtilisateur(user.tenantId, body);
  }

  @Patch('utilisateurs/:id/toggle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activer/désactiver un utilisateur' })
  toggleUtilisateur(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { actif: boolean },
  ) {
    return this.tenantsService.toggleUtilisateur(user.tenantId, id, body.actif);
  }

  @Patch('utilisateurs/:id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Changer le rôle d\'un utilisateur' })
  changerRole(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.tenantsService.changerRole(user.tenantId, id, body.role);
  }

  @Patch('modules/:code')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activer/désactiver un module' })
  toggleModule(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
    @Body() body: { actif: boolean },
  ) {
    return this.tenantsService.toggleModule(user.tenantId, code, body.actif);
  }

  @Get('settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Paramètres de configuration du tenant' })
  getSettings(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.getSettings(user.tenantId);
  }

  @Put('settings/:cle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer ou modifier un paramètre' })
  upsertSetting(
    @CurrentUser() user: JwtPayload,
    @Param('cle') cle: string,
    @Body() body: { valeur: string },
  ) {
    return this.tenantsService.upsertSetting(user.tenantId, cle, body.valeur);
  }
}
