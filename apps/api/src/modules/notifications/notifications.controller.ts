import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
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

  // Endpoint de test pour déclencher une notification manuellement
  @Get('test')
  @ApiOperation({ summary: 'Déclencher une notification de test' })
  test(@CurrentUser() user: JwtPayload) {
    this.notificationsService.emit({
      tenantId: user.tenantId,
      type: 'info',
      titre: 'Test notification',
      message: 'Les notifications temps réel fonctionnent !',
    });
    return { ok: true };
  }
}
