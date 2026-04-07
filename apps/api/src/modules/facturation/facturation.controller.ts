import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacturationService } from './facturation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { ModuleRequired } from '../../common/decorators/module-required.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, ModuleCode, UserRole } from '@saas-erp/shared';

@ApiTags('Facturation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleRequired(ModuleCode.FACTURATION)
@Controller('facturation')
export class FacturationController {
  constructor(private facturationService: FacturationService) {}

  @Get('paiements')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Historique global des paiements reçus' })
  getPaiements(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 30,
  ) {
    return this.facturationService.getPaiements(user.tenantId, { page: +page, limite: +limite });
  }

  @Get('factures')
  @ApiOperation({ summary: 'Liste des factures' })
  getFactures(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limite') limite = 20,
    @Query('statut') statut?: string,
  ) {
    return this.facturationService.getFactures(user.tenantId, {
      page: +page,
      limite: +limite,
      statut,
    });
  }

  @Get('factures/stats')
  @Roles(UserRole.ADMIN, UserRole.DIRECTION, UserRole.COMPTABLE)
  @ApiOperation({ summary: 'Statistiques facturation (CA, impayés)' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.facturationService.getStats(user.tenantId);
  }

  @Get('factures/:id')
  @ApiOperation({ summary: 'Détail d\'une facture' })
  getFacture(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.facturationService.getFacture(user.tenantId, id);
  }

  @Post('factures/depuis-commande/:commandeId')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Générer une facture depuis une commande livrée' })
  creerDepuisCommande(
    @CurrentUser() user: JwtPayload,
    @Param('commandeId') commandeId: string,
  ) {
    return this.facturationService.creerDepuisCommande(user.tenantId, commandeId);
  }

  @Get('factures/:id/pdf')
  @ApiOperation({ summary: 'Télécharger la facture en PDF' })
  async getPdf(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.facturationService.genererPdf(user.tenantId, id);
    res.status(HttpStatus.OK)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
        'Content-Length': buffer.length,
      })
      .end(buffer);
  }

  @Post('factures/:id/paiements')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  @ApiOperation({ summary: 'Enregistrer un paiement sur une facture' })
  enregistrerPaiement(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { montant: number; mode: string; reference?: string; notes?: string },
  ) {
    return this.facturationService.enregistrerPaiement(user.tenantId, id, body);
  }
}
