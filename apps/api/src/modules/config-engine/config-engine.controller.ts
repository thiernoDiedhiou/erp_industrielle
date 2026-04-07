import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigEngineService } from './config-engine.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';

@ApiTags('Config Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('config')
export class ConfigEngineController {
  constructor(private configService: ConfigEngineService) {}

  // ─── Enums ──────────────────────────────────────────────────────────────────

  @Get('enums')
  @ApiOperation({ summary: 'Liste des enums personnalisés du tenant' })
  getEnums(@CurrentUser() user: JwtPayload, @Query('entite') entite?: string) {
    return this.configService.getEnums(user.tenantId, entite);
  }

  @Post('enums')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un enum personnalisé' })
  creerEnum(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.configService.creerEnum(user.tenantId, body);
  }

  @Patch('enums/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un enum' })
  modifierEnum(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.configService.modifierEnum(user.tenantId, id, body);
  }

  // ─── Champs personnalisés ───────────────────────────────────────────────────

  @Get('champs')
  @ApiOperation({ summary: 'Champs personnalisés du tenant' })
  getChamps(@CurrentUser() user: JwtPayload, @Query('entite') entite?: string) {
    return this.configService.getChamps(user.tenantId, entite);
  }

  @Post('champs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un champ personnalisé' })
  creerChamp(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.configService.creerChamp(user.tenantId, body);
  }

  @Patch('champs/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un champ personnalisé' })
  modifierChamp(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.configService.modifierChamp(user.tenantId, id, body);
  }

  // ─── Valeurs champs custom par entité ───────────────────────────────────────

  @Get('valeurs/:entite/:entiteId')
  @ApiOperation({ summary: 'Valeurs des champs personnalisés d\'une entité' })
  getValeurs(
    @CurrentUser() user: JwtPayload,
    @Param('entite') entite: string,
    @Param('entiteId') entiteId: string,
  ) {
    return this.configService.getValeursChamps(user.tenantId, entite, entiteId);
  }

  @Post('valeurs/:entite/:entiteId')
  @ApiOperation({ summary: 'Enregistrer la valeur d\'un champ personnalisé' })
  upsertValeur(
    @CurrentUser() user: JwtPayload,
    @Param('entite') entite: string,
    @Param('entiteId') entiteId: string,
    @Body() body: { champId: string; valeur: string },
  ) {
    return this.configService.upsertValeurChamp(
      user.tenantId,
      entite,
      entiteId,
      body.champId,
      body.valeur,
    );
  }

  // ─── Workflows ──────────────────────────────────────────────────────────────

  @Get('workflows')
  @ApiOperation({ summary: 'Tous les workflows du tenant' })
  getWorkflows(@CurrentUser() user: JwtPayload) {
    return this.configService.getWorkflows(user.tenantId);
  }

  @Get('workflows/:entite')
  @ApiOperation({ summary: 'Workflow d\'une entité spécifique' })
  getWorkflow(@CurrentUser() user: JwtPayload, @Param('entite') entite: string) {
    return this.configService.getWorkflow(user.tenantId, entite);
  }
}
