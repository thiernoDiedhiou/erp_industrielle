import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export const QUEUES = {
  EMAILS: 'erp.emails',
  STOCK_ALERTS: 'erp.stock_alerts',
  NOTIFICATIONS: 'erp.notifications',
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];

export interface EmailMessage {
  to: string;
  subject: string;
  template: 'facture' | 'commande_confirmee' | 'alerte_stock' | 'bienvenue' | 'reset_password';
  data: Record<string, unknown>;
  tenantId: string;
}

export interface StockAlertMessage {
  tenantId: string;
  matiereId: string;
  matierenom: string;
  stockActuel: number;
  stockMinimum: number;
  unite: string;
}

export interface NotificationMessage {
  tenantId: string;
  type: string;
  titre: string;
  message: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly url: string;

  constructor(private config: ConfigService) {
    this.url = this.config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672';
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Déclarer toutes les queues durables (survivent aux redémarrages RabbitMQ)
      for (const queue of Object.values(QUEUES)) {
        await this.channel.assertQueue(queue, { durable: true });
      }

      this.logger.log('Connecté à RabbitMQ, queues déclarées');

      // Reconnecter automatiquement si la connexion se ferme
      this.connection.on('close', () => {
        this.logger.warn('Connexion RabbitMQ fermée, reconnexion dans 5s...');
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on('error', (err: Error) => {
        this.logger.error(`Erreur RabbitMQ : ${err.message}`);
      });
    } catch (err) {
      this.logger.error(`Impossible de se connecter à RabbitMQ : ${(err as Error).message}`);
      setTimeout(() => this.connect(), 10000);
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await (this.connection as any)?.close();
    } catch {
      // Silencieux à l'arrêt
    }
  }

  // Publier un message persistant dans une queue
  publish(queue: QueueName, message: object): boolean {
    if (!this.channel) {
      this.logger.warn(`Impossible de publier dans ${queue} : canal non prêt`);
      return false;
    }

    const content = Buffer.from(JSON.stringify(message));
    return this.channel.sendToQueue(queue, content, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  // Raccourcis typés par cas d'usage
  envoyerEmail(message: EmailMessage) {
    return this.publish(QUEUES.EMAILS, message);
  }

  alerterStock(message: StockAlertMessage) {
    return this.publish(QUEUES.STOCK_ALERTS, message);
  }

  notifier(message: NotificationMessage) {
    return this.publish(QUEUES.NOTIFICATIONS, message);
  }
}
