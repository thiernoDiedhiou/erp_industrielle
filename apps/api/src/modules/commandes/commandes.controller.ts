import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode, UserRole } from '@saas-erp/shared';

@ApiTags('Commandes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.COMMANDES)
@Controller('commandes')
export class CommandesController {
  constructor(private commandesService: CommandesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des commandes avec filtres' })
  getCommandes(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
    @Query('statut') statut?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.commandesService.getCommandes(user.tenantId, {
      page: +page,
      limite: +limite,
      statut,
      clientId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une commande avec historique' })
  getCommande(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commandesService.getCommande(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Créer une commande' })
  creerCommande(@CurrentUser() user: JwtPayload, @Body() dto: CreateCommandeDto) {
    return this.commandesService.creerCommande(user.tenantId, user.sub, dto);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: 'Changer le statut (workflow vérifié)' })
  changerStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { statut: string; commentaire?: string },
  ) {
    return this.commandesService.changerStatut(
      user.tenantId,
      id,
      user.sub,
      user.role,
      body.statut,
      body.commentaire,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une commande (brouillon uniquement)' })
  supprimerCommande(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commandesService.supprimerCommande(user.tenantId, id);
  }
}
