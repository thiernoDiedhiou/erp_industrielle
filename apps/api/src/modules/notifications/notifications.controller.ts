import { Controller, Get, Patch, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@saas-erp/shared';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Flux SSE de notifications en temps réel' })
  stream(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getStreamForTenant(user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Historique des 50 dernières notifications' })
  getHistorique(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getHistorique(user.tenantId);
  }

  @Patch('lire-tout')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async marquerToutesLues(@CurrentUser() user: JwtPayload) {
    await this.notificationsService.marquerToutesLues(user.tenantId);
    return { ok: true };
  }

  @Get('test')
  @ApiOperation({ summary: 'Déclencher une notification de test' })
  async test(@CurrentUser() user: JwtPayload) {
    await this.notificationsService.emit({
      tenantId: user.tenantId,
      type: 'info',
      titre: 'Test notification',
      message: 'Les notifications temps réel fonctionnent !',
    });
    return { ok: true };
  }
}
