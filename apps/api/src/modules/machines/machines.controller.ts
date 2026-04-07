import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Machines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired('machines')
@Controller('machines')
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des machines paginée' })
  getListe(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
    @Query('statut') statut?: string,
  ) {
    return this.machinesService.getListe(user.tenantId, { ...query, statut });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une machine' })
  getUne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.machinesService.getUne(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @Audit({ action: 'CREATE', entite: 'Machine' })
  @ApiOperation({ summary: 'Ajouter une machine' })
  creer(@CurrentUser() user: JwtPayload, @Body() dto: CreateMachineDto) {
    return this.machinesService.creer(user.tenantId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @Audit({ action: 'UPDATE', entite: 'Machine' })
  @ApiOperation({ summary: 'Modifier une machine' })
  modifier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMachineDto>,
  ) {
    return this.machinesService.modifier(user.tenantId, id, dto);
  }

  @Patch(':id/statut')
  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @Audit({ action: 'STATUT', entite: 'Machine' })
  @ApiOperation({ summary: "Changer le statut d'une machine (disponible/maintenance/en_panne)" })
  changerStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('statut') statut: string,
  ) {
    return this.machinesService.changerStatut(user.tenantId, id, statut);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'DELETE', entite: 'Machine' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver une machine (soft delete)' })
  supprimer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.machinesService.supprimer(user.tenantId, id);
  }
}
