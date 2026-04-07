import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private disponible = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(
      this.config.get<string>('REDIS_URL') || 'redis://localhost:6379',
      {
        // Échouer immédiatement au lieu de réessayer 20 fois (évite MaxRetriesPerRequestError)
        maxRetriesPerRequest: 0,
        // Ne pas bloquer le démarrage si Redis est absent
        lazyConnect: false,
        // Reconnexion exponentielle plafonnée à 30s
        retryStrategy: (times) => Math.min(times * 500, 30_000),
        // Pas d'exception si la connexion est perdue en cours de route
        enableOfflineQueue: false,
      },
    );

    // Supprimer les "Unhandled error event" et logger proprement
    this.client.on('error', (err: Error) => {
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
    await this.client.quit().catch(() => {});
  }

  // ── Méthodes génériques ───────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null; // Dégradation gracieuse : cache manqué
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // Silencieux : le cache n'est pas critique
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // Silencieux
    }
  }

  // ── Cache modules actifs du tenant (TTL 5 min) ───────────────────────────

  async getModulesActifs(tenantId: string): Promise<string[] | null> {
    try {
      const cached = await this.client.get(`tenant:${tenantId}:modules`);
      return cached ? (JSON.parse(cached) as string[]) : null;
    } catch {
      return null; // Cache indisponible → la requête ira en BDD
    }
  }

  async setModulesActifs(tenantId: string, modules: string[]): Promise<void> {
    try {
      await this.client.set(
        `tenant:${tenantId}:modules`,
        JSON.stringify(modules),
        'EX',
        300, // 5 minutes
      );
    } catch {
      // Silencieux
    }
  }

  async invalidateModulesActifs(tenantId: string): Promise<void> {
    try {
      await this.client.del(`tenant:${tenantId}:modules`);
    } catch {
      // Silencieux
    }
  }

  // ── État de la connexion ──────────────────────────────────────────────────

  estDisponible(): boolean {
    return this.disponible;
  }
}
