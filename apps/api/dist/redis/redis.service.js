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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.disponible = false;
    }
    onModuleInit() {
        this.client = new ioredis_1.default(this.config.get('REDIS_URL') || 'redis://localhost:6379', {
            maxRetriesPerRequest: 0,
            lazyConnect: false,
            retryStrategy: (times) => Math.min(times * 500, 30000),
            enableOfflineQueue: false,
        });
        this.client.on('error', (err) => {
            if (this.disponible) {
                this.logger.warn(`Redis déconnecté : ${err.message}`);
            }
            this.disponible = false;
        });
        this.client.on('connect', () => {
            this.disponible = true;
            this.logger.log('Redis connecté');
        });
        this.client.on('reconnecting', () => {
            this.logger.debug('Redis : tentative de reconnexion…');
        });
    }
    async onModuleDestroy() {
        await this.client.quit().catch(() => { });
    }
    async get(key) {
        try {
            return await this.client.get(key);
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch {
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch {
        }
    }
    async getModulesActifs(tenantId) {
        try {
            const cached = await this.client.get(`tenant:${tenantId}:modules`);
            return cached ? JSON.parse(cached) : null;
        }
        catch {
            return null;
        }
    }
    async setModulesActifs(tenantId, modules) {
        try {
            await this.client.set(`tenant:${tenantId}:modules`, JSON.stringify(modules), 'EX', 300);
        }
        catch {
        }
    }
    async invalidateModulesActifs(tenantId) {
        try {
            await this.client.del(`tenant:${tenantId}:modules`);
        }
        catch {
        }
    }
    estDisponible() {
        return this.disponible;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map