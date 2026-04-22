import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des utilisateurs du tenant' })
  @ApiQuery({ name: 'role', required: false })
  getListe(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
    @Query('role') role?: string,
  ) {
    return this.usersService.getListe(user.tenantId, { ...query, role });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un utilisateur' })
  getUn(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.getUn(user.tenantId, id);
  }

  @Post()
  @Audit({ action: 'CREATE', entite: 'User' })
  @ApiOperation({ summary: 'Créer un utilisateur' })
  creer(@CurrentUser() user: JwtPayload, @Body() dto: CreateUserDto) {
    return this.usersService.creer(user.tenantId, dto);
  }

  @Put(':id')
  @Audit({ action: 'UPDATE', entite: 'User' })
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.usersService.modifier(user.tenantId, id, dto);
  }

  @Patch(':id/toggle-actif')
  @Audit({ action: 'UPDATE', entite: 'User' })
  @ApiOperation({ summary: 'Activer / désactiver un utilisateur' })
  toggleActif(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.toggleActif(user.tenantId, id);
  }

  @Patch(':id/reset-password')
  @Audit({ action: 'UPDATE', entite: 'User' })
  @ApiOperation({ summary: 'Réinitialiser le mot de passe (génère un mot de passe temporaire)' })
  reinitialiserMotDePasse(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.reinitialiserMotDePasse(user.tenantId, id);
  }

  @Delete(':id')
  @Audit({ action: 'DELETE', entite: 'User' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un utilisateur (soft delete)' })
  supprimer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.supprimer(user.tenantId, id);
  }
}
