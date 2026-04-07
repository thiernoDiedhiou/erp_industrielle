import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare const QUEUES: {
    readonly EMAILS: "erp.emails";
    readonly STOCK_ALERTS: "erp.stock_alerts";
    readonly NOTIFICATIONS: "erp.notifications";
};
export type QueueName = typeof QUEUES[keyof typeof QUEUES];
export interface EmailMessage {
    to: string;
    subject: string;
    template: 'facture' | 'commande_confirmee' | 'alerte_stock' | 'bienvenue';
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
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private config;
    private readonly logger;
    private connection;
    private channel;
    private readonly url;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    publish(queue: QueueName, message: object): boolean;
    envoyerEmail(message: EmailMessage): boolean;
    alerterStock(message: StockAlertMessage): boolean;
    notifier(message: NotificationMessage): boolean;
}
