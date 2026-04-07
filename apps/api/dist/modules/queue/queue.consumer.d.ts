import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class QueueConsumer implements OnModuleInit {
    private config;
    private emailService;
    private notificationsService;
    private readonly logger;
    private connection;
    private channel;
    private readonly url;
    constructor(config: ConfigService, emailService: EmailService, notificationsService: NotificationsService);
    onModuleInit(): Promise<void>;
    private demarrerConsommateurs;
}
