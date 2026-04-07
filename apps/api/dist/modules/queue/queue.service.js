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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = exports.QUEUES = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
exports.QUEUES = {
    EMAILS: 'erp.emails',
    STOCK_ALERTS: 'erp.stock_alerts',
    NOTIFICATIONS: 'erp.notifications',
};
let QueueService = QueueService_1 = class QueueService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(QueueService_1.name);
        this.connection = null;
        this.channel = null;
        this.url = this.config.get('RABBITMQ_URL') ?? 'amqp://localhost:5672';
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            for (const queue of Object.values(exports.QUEUES)) {
                await this.channel.assertQueue(queue, { durable: true });
            }
            this.logger.log('Connecté à RabbitMQ, queues déclarées');
            this.connection.on('close', () => {
                this.logger.warn('Connexion RabbitMQ fermée, reconnexion dans 5s...');
                setTimeout(() => this.connect(), 5000);
            });
            this.connection.on('error', (err) => {
                this.logger.error(`Erreur RabbitMQ : ${err.message}`);
            });
        }
        catch (err) {
            this.logger.error(`Impossible de se connecter à RabbitMQ : ${err.message}`);
            setTimeout(() => this.connect(), 10000);
        }
    }
    async disconnect() {
        try {
            await this.channel?.close();
            await this.connection?.close();
        }
        catch {
        }
    }
    publish(queue, message) {
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
    envoyerEmail(message) {
        return this.publish(exports.QUEUES.EMAILS, message);
    }
    alerterStock(message) {
        return this.publish(exports.QUEUES.STOCK_ALERTS, message);
    }
    notifier(message) {
        return this.publish(exports.QUEUES.NOTIFICATIONS, message);
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map