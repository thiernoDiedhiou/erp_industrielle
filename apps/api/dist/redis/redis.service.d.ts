import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private config;
    private readonly logger;
    private client;
    private disponible;
    constructor(config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    getModulesActifs(tenantId: string): Promise<string[] | null>;
    setModulesActifs(tenantId: string, modules: string[]): Promise<void>;
    invalidateModulesActifs(tenantId: string): Promise<void>;
    estDisponible(): boolean;
}
