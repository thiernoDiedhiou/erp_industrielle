import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminTenantsService } from './super-admin-tenants.service';
import { SuperAdminJwtAuthGuard } from '../guards/super-admin-jwt-auth.guard';

@ApiTags('Super Admin — Tenants')
@ApiBearerAuth()
@UseGuards(SuperAdminJwtAuthGuard)
@Controller('super-admin/tenants')
export class SuperAdminTenantsController {
  constructor(private service: SuperAdminTenantsService) {}

  @Get()
  getListe(@Query('search') search?: string) {
    return this.service.getListe(search);
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  getUn(@Param('id') id: string) {
    return this.service.getUn(id);
  }

  @Post()
  creer(@Body() body: {
    slug: string; nom: string; secteur: string; plan: string;
    pays?: string; ville?: string; telephone?: string; adresse?: string;
    adminEmail: string; adminNom: string; adminPassword: string;
    moduleCodes?: string[];
  }) {
    return this.service.creer(body);
  }

  @Put(':id')
  modifier(@Param('id') id: string, @Body() body: {
    nom?: string; secteur?: string; plan?: string;
    pays?: string; ville?: string; telephone?: string; adresse?: string;
    couleurPrimaire?: string; couleurSecondaire?: string;
  }) {
    return this.service.modifier(id, body);
  }

  @Patch(':id/toggle-actif')
  toggleActif(@Param('id') id: string) {
    return this.service.toggleActif(id);
  }

  @Patch(':id/modules')
  modifierModules(@Param('id') id: string, @Body() body: { moduleCodes: string[] }) {
    return this.service.modifierModules(id, body.moduleCodes);
  }

  @Post(':id/users')
  creerUser(@Param('id') tenantId: string, @Body() body: {
    nom: string; prenom?: string; email: string; password: string; role: string; telephone?: string;
  }) {
    return this.service.creerUser(tenantId, body);
  }

  // ─── Workflows ─────────────────────────────────────────────────────────────

  @Get(':id/workflows')
  getWorkflows(@Param('id') id: string) {
    return this.service.getWorkflowsTenant(id);
  }

  @Post(':id/workflows')
  creerWorkflow(@Param('id') id: string, @Body() body: any) {
    return this.service.creerWorkflowTenant(id, body);
  }

  @Put(':id/workflows/:workflowId')
  modifierWorkflow(
    @Param('id') id: string,
    @Param('workflowId') workflowId: string,
    @Body() body: any,
  ) {
    return this.service.modifierWorkflowTenant(id, workflowId, body);
  }

  // ─── Champs personnalisés ───────────────────────────────────────────────────

  @Get(':id/champs')
  getChamps(@Param('id') id: string) {
    return this.service.getChampsT(id);
  }

  @Post(':id/champs')
  creerChamp(@Param('id') id: string, @Body() body: any) {
    return this.service.creerChampTenant(id, body);
  }

  @Patch(':id/champs/:champId/toggle')
  toggleChamp(@Param('id') id: string, @Param('champId') champId: string) {
    return this.service.toggleChampTenant(id, champId);
  }
}
