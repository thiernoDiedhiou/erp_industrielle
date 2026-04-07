import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'STATUT';

export interface AuditContext {
  tenantId: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // Enregistrer une action dans le journal d'audit
  async log(
    ctx: AuditContext,
    action: AuditAction,
    entite: string,
    entiteId?: string,
    avant?: object | null,
    apres?: object | null,
  ) {
    // Nettoyage : retirer les champs sensibles avant stockage
    const nettoyer = (obj: object | null | undefined) => {
      if (!obj) return undefined;
      const { passwordHash, refreshTokenHash, ...reste } = obj as any;
      return reste;
    };

    await this.prisma.auditLog.create({
      data: {
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        userEmail: ctx.userEmail,
        action,
        entite,
        entiteId,
        avant: avant ? nettoyer(avant) : undefined,
        apres: apres ? nettoyer(apres) : undefined,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
  }

  // Récupérer le journal d'audit d'un tenant (paginé)
  async getLogs(
    tenantId: string,
    opts: {
      page?: number;
      limite?: number;
      entite?: string;
      entiteId?: string;
      userId?: string;
      action?: string;
    },
  ) {
    const { page = 1, limite = 50, entite, entiteId, userId, action } = opts;
    const skip = (page - 1) * limite;

    const where = {
      tenantId,
      ...(entite ? { entite } : {}),
      ...(entiteId ? { entiteId } : {}),
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: Math.min(limite, 100),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  // Historique d'une entité spécifique
  async getHistoriqueEntite(tenantId: string, entite: string, entiteId: string) {
    return this.prisma.auditLog.findMany({
      where: { tenantId, entite, entiteId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
