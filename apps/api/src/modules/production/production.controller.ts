import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode, UserRole } from '@saas-erp/shared';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.PRODUCTION)
@Controller('production')
export class ProductionController {
  constructor(private productionService: ProductionService) {}

  @Get('ofs')
  @ApiOperation({ summary: 'Liste des ordres de fabrication' })
  getOFs(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
    @Query('statut') statut?: string,
  ) {
    return this.productionService.getOFs(user.tenantId, { page: +page, limite: +limite, statut });
  }

  @Get('ofs/:id')
  @ApiOperation({ summary: 'Détail d\'un OF' })
  getOF(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productionService.getOF(user.tenantId, id);
  }

  @Post('ofs')
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @ApiOperation({ summary: 'Créer un ordre de fabrication' })
  creerOF(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.productionService.creerOF(user.tenantId, user.sub, body);
  }

  @Put('ofs/:id/statut')
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @ApiOperation({ summary: 'Changer le statut d\'un OF' })
  changerStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { statut: string },
  ) {
    return this.productionService.changerStatutOF(user.tenantId, id, body.statut);
  }

  @Post('ofs/:id/consommations')
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION, UserRole.MAGASINIER)
  @ApiOperation({ summary: 'Enregistrer une consommation de matière première' })
  enregistrerConsommation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { matierePremiereId: string; quantiteConsommee: number },
  ) {
    return this.productionService.enregistrerConsommation(user.tenantId, id, body);
  }

  @Get('machines')
  @ApiOperation({ summary: 'Liste des machines' })
  getMachines(@CurrentUser() user: JwtPayload) {
    return this.productionService.getMachines(user.tenantId);
  }

  @Post('machines')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une machine' })
  creerMachine(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.productionService.creerMachine(user.tenantId, body);
  }

  @Get('matieres-premieres')
  @ApiOperation({ summary: 'Liste des matières premières' })
  getMatieresPrmieres(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
  ) {
    return this.productionService.getMatieresPrmieres(user.tenantId, { page: +page, limite: +limite });
  }
}
