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
import { CrmService } from './crm.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode, UserRole } from '@saas-erp/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.CRM)
@Controller('crm')
export class CrmController {
  constructor(private crmService: CrmService) {}

  // ─── Clients ────────────────────────────────────────────────────────────────

  @Get('clients')
  @ApiOperation({ summary: 'Liste des clients paginée' })
  getClients(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.crmService.getClients(user.tenantId, query);
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Détail d\'un client' })
  getClient(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.crmService.getClient(user.tenantId, id);
  }

  @Post('clients')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @Audit({ action: 'CREATE', entite: 'Client' })
  @ApiOperation({ summary: 'Créer un client' })
  creerClient(@CurrentUser() user: JwtPayload, @Body() dto: CreateClientDto) {
    return this.crmService.creerClient(user.tenantId, dto);
  }

  @Put('clients/:id')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @Audit({ action: 'UPDATE', entite: 'Client' })
  @ApiOperation({ summary: 'Modifier un client' })
  modifierClient(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>,
  ) {
    return this.crmService.modifierClient(user.tenantId, id, dto);
  }

  @Delete('clients/:id')
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'DELETE', entite: 'Client' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver un client (soft delete)' })
  supprimerClient(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.crmService.supprimerClient(user.tenantId, id);
  }

  // ─── Produits ───────────────────────────────────────────────────────────────

  @Get('produits')
  @ApiOperation({ summary: 'Liste des produits paginée' })
  getProduits(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.crmService.getProduits(user.tenantId, query);
  }

  @Get('produits/:id')
  @ApiOperation({ summary: 'Détail d\'un produit' })
  getProduit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.crmService.getProduit(user.tenantId, id);
  }

  @Post('produits')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Créer un produit' })
  creerProduit(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.crmService.creerProduit(user.tenantId, body);
  }

  @Put('produits/:id')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Modifier un produit' })
  modifierProduit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.crmService.modifierProduit(user.tenantId, id, body);
  }
}
