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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    constructor(config) {
        this.config = config;
    }
    onModuleInit() {
        this.client = new ioredis_1.default(this.config.get('REDIS_URL') || 'redis://localhost:6379');
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async getModulesActifs(tenantId) {
        const cached = await this.client.get(`tenant:${tenantId}:modules`);
        return cached ? JSON.parse(cached) : null;
    }
    async setModulesActifs(tenantId, modules) {
        await this.client.set(`tenant:${tenantId}:modules`, JSON.stringify(modules), 'EX', 300);
    }
    async invalidateModulesActifs(tenantId) {
        await this.client.del(`tenant:${tenantId}:modules`);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map