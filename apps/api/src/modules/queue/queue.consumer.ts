import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { QUEUES, EmailMessage, StockAlertMessage, NotificationMessage } from './queue.service';
import { EmailService } from './email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(QueueConsumer.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly url: string;

  constructor(
    private config: ConfigService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {
    this.url = this.config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672';
  }

  async onModuleInit() {
    await this.demarrerConsommateurs();
  }

  private async demarrerConsommateurs() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Traiter 1 message à la fois par queue — évite la surcharge
      await this.channel.prefetch(1);

      // Déclarer les queues (idempotent)
      for (const queue of Object.values(QUEUES)) {
        await this.channel.assertQueue(queue, { durable: true });
      }

      // ─── Consommateur emails ──────────────────────────────────────────────
      await this.channel.consume(QUEUES.EMAILS, async (msg) => {
        if (!msg) return;
        try {
          const message: EmailMessage = JSON.parse(msg.content.toString());
          await this.emailService.envoyerEmail(message);
          this.channel?.ack(msg);
        } catch (err: any) {
          this.logger.error(`Erreur traitement email : ${err.message}`);
          this.channel?.nack(msg, false, false); // dead-letter, pas de requeue infini
        }
      });

      // ─── Consommateur alertes stock ───────────────────────────────────────
      await this.channel.consume(QUEUES.STOCK_ALERTS, async (msg) => {
        if (!msg) return;
        try {
          const alert: StockAlertMessage = JSON.parse(msg.content.toString());

          // Notification SSE temps réel
          this.notificationsService.alerteStock(
            alert.tenantId,
            alert.matierenom,
            alert.stockActuel,
            alert.unite,
          );

          // Email au responsable stock
          await this.emailService.envoyerEmail({
            to: this.config.get('STOCK_ALERT_EMAIL', 'stock@gisac.sn'),
            subject: `⚠ Stock critique : ${alert.matierenom}`,
            template: 'alerte_stock',
            tenantId: alert.tenantId,
            data: {
              matiere: alert.matierenom,
              stockActuel: alert.stockActuel,
              stockMinimum: alert.stockMinimum,
              unite: alert.unite,
            },
          });

          this.channel?.ack(msg);
          this.logger.log(`Alerte stock traitée : ${alert.matierenom}`);
        } catch (err: any) {
          this.logger.error(`Erreur alerte stock : ${err.message}`);
          this.channel?.nack(msg, false, false);
        }
      });

      // ─── Consommateur notifications générales ─────────────────────────────
      await this.channel.consume(QUEUES.NOTIFICATIONS, async (msg) => {
        if (!msg) return;
        try {
          const notif: NotificationMessage = JSON.parse(msg.content.toString());
          this.notificationsService.emit({
            tenantId: notif.tenantId,
            type: notif.type as any,
            titre: notif.titre,
            message: notif.message,
            data: notif.data,
          });
          this.channel?.ack(msg);
        } catch (err: any) {
          this.logger.error(`Erreur notification : ${err.message}`);
          this.channel?.nack(msg, false, false);
        }
      });

      this.logger.log('Consommateurs RabbitMQ démarrés (emails, stock_alerts, notifications)');
    } catch (err: any) {
      this.logger.error(`Impossible de démarrer les consommateurs : ${err.message}`);
      setTimeout(() => this.demarrerConsommateurs(), 10000);
    }
  }
}
