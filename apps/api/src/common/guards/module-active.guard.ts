import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from '../decorators/module-required.decorator';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModuleActiveGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleCode = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Pas de module requis → accès libre
    if (!moduleCode) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.tenantId) return false;

    const modulesActifs = await this.getModulesActifs(user.tenantId);
    if (!modulesActifs.includes(moduleCode)) {
      throw new ForbiddenException(`Module "${moduleCode}" non activé pour ce tenant`);
    }

    return true;
  }

  // Récupère les modules actifs depuis Redis ou BDD
  private async getModulesActifs(tenantId: string): Promise<string[]> {
    const cached = await this.redis.getModulesActifs(tenantId);
    if (cached) return cached;

    // Cache miss → requête BDD
    const tenantModules = await this.prisma.tenantModule.findMany({
      where: { tenantId, actif: true },
      include: { module: { select: { code: true } } },
    });

    const codes = tenantModules.map((tm) => tm.module.code);
    await this.redis.setModulesActifs(tenantId, codes);
    return codes;
  }
}
