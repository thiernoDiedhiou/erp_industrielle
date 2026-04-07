"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueConsumer = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
const queue_service_1 = require("./queue.service");
const email_service_1 = require("./email.service");
const notifications_service_1 = require("../notifications/notifications.service");
let QueueConsumer = QueueConsumer_1 = class QueueConsumer {
    constructor(config, emailService, notificationsService) {
        this.config = config;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(QueueConsumer_1.name);
        this.connection = null;
        this.channel = null;
        this.url = this.config.get('RABBITMQ_URL') ?? 'amqp://localhost:5672';
    }
    async onModuleInit() {
        await this.demarrerConsommateurs();
    }
    async demarrerConsommateurs() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.prefetch(1);
            for (const queue of Object.values(queue_service_1.QUEUES)) {
                await this.channel.assertQueue(queue, { durable: true });
            }
            await this.channel.consume(queue_service_1.QUEUES.EMAILS, async (msg) => {
                if (!msg)
                    return;
                try {
                    const message = JSON.parse(msg.content.toString());
                    await this.emailService.envoyerEmail(message);
                    this.channel?.ack(msg);
                }
                catch (err) {
                    this.logger.error(`Erreur traitement email : ${err.message}`);
                    this.channel?.nack(msg, false, false);
                }
            });
            await this.channel.consume(queue_service_1.QUEUES.STOCK_ALERTS, async (msg) => {
                if (!msg)
                    return;
                try {
                    const alert = JSON.parse(msg.content.toString());
                    this.notificationsService.alerteStock(alert.tenantId, alert.matierenom, alert.stockActuel, alert.unite);
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
                }
                catch (err) {
                    this.logger.error(`Erreur alerte stock : ${err.message}`);
                    this.channel?.nack(msg, false, false);
                }
            });
            await this.channel.consume(queue_service_1.QUEUES.NOTIFICATIONS, async (msg) => {
                if (!msg)
                    return;
                try {
                    const notif = JSON.parse(msg.content.toString());
                    this.notificationsService.emit({
                        tenantId: notif.tenantId,
                        type: notif.type,
                        titre: notif.titre,
                        message: notif.message,
                        data: notif.data,
                    });
                    this.channel?.ack(msg);
                }
                catch (err) {
                    this.logger.error(`Erreur notification : ${err.message}`);
                    this.channel?.nack(msg, false, false);
                }
            });
            this.logger.log('Consommateurs RabbitMQ démarrés (emails, stock_alerts, notifications)');
        }
        catch (err) {
            this.logger.error(`Impossible de démarrer les consommateurs : ${err.message}`);
            setTimeout(() => this.demarrerConsommateurs(), 10000);
        }
    }
};
exports.QueueConsumer = QueueConsumer;
exports.QueueConsumer = QueueConsumer = QueueConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService])
], QueueConsumer);
//# sourceMappingURL=queue.consumer.js.map