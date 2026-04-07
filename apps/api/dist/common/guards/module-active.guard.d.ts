import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ModuleActiveGuard implements CanActivate {
    private reflector;
    private redis;
    private prisma;
    constructor(reflector: Reflector, redis: RedisService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getModulesActifs;
}
