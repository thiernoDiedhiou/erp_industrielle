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
    // Fermer proprement l'ancienne connexion avant de recréer (évite les fuites de handles)
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch { /* déjà fermée ou inexistante */ }
    this.channel = null;
    this.connection = null;

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      this.connection.on('close', () => {
        this.logger.warn('Connexion consommateur RabbitMQ fermée, reconnexion dans 5s...');
        setTimeout(() => this.demarrerConsommateurs(), 5000);
      });
      this.connection.on('error', (err: Error) => {
        this.logger.error(`Erreur connexion consommateur : ${err.message}`);
      });

      // Traiter 1 message à la fois par queue — évite la surcharge
      await this.channel.prefetch(1);

      // Déclarer les queues (idempotent)
      for (const queue of Object.values(QUEUES)) {
        await this.channel.assertQueue(queue, { durable: true });
      }

      // Capturer le channel ici : si reconnexion entre réception et ack,
      // this.channel pointe vers le nouveau canal — le message resterait orphelin
      const ch = this.channel;

      // ─── Consommateur emails ──────────────────────────────────────────────
      await ch.consume(QUEUES.EMAILS, async (msg) => {
        if (!msg) return;
        try {
          const message: EmailMessage = JSON.parse(msg.content.toString());
          await this.emailService.envoyerEmail(message);
          ch.ack(msg);
        } catch (err) {
          this.logger.error(`Erreur traitement email : ${(err as Error).message}`);
          ch.nack(msg, false, false); // dead-letter, pas de requeue infini
        }
      });

      // ─── Consommateur alertes stock ───────────────────────────────────────
      await ch.consume(QUEUES.STOCK_ALERTS, async (msg) => {
        if (!msg) return;
        try {
          const alert: StockAlertMessage = JSON.parse(msg.content.toString());

          // Notification SSE temps réel
          this.notificationsService.alerteStock(
            alert.tenantId,
            alert.matierenom,
            alert.stockActuel,
            alert.unite,
            alert.matiereId,
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

          ch.ack(msg);
          this.logger.log(`Alerte stock traitée : ${alert.matierenom}`);
        } catch (err) {
          this.logger.error(`Erreur alerte stock : ${(err as Error).message}`);
          ch.nack(msg, false, false);
        }
      });

      // ─── Consommateur notifications générales ─────────────────────────────
      await ch.consume(QUEUES.NOTIFICATIONS, async (msg) => {
        if (!msg) return;
        try {
          const notif: NotificationMessage = JSON.parse(msg.content.toString());
          await this.notificationsService.emit({
            tenantId: notif.tenantId,
            type: notif.type as 'alerte_stock' | 'statut_commande' | 'statut_of' | 'paiement_recu' | 'info',
            titre: notif.titre,
            message: notif.message,
            data: notif.data,
          });
          ch.ack(msg);
        } catch (err) {
          this.logger.error(`Erreur notification : ${(err as Error).message}`);
          ch.nack(msg, false, false);
        }
      });

      this.logger.log('Consommateurs RabbitMQ démarrés (emails, stock_alerts, notifications)');
    } catch (err) {
      this.logger.error(`Impossible de démarrer les consommateurs : ${(err as Error).message}`);
      setTimeout(() => this.demarrerConsommateurs(), 10000);
    }
  }
}
