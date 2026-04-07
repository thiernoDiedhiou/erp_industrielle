import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_META, AuditMeta } from '../decorators/audit.decorator';
import { JwtPayload } from '@saas-erp/shared';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<AuditMeta>(AUDIT_META, context.getHandler());

    // Pas de métadonnée @Audit → on laisse passer sans rien loguer
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'];

    const ctx = {
      tenantId: user?.tenantId ?? 'unknown',
      userId: user?.sub,
      userEmail: user?.email,
      ip,
      userAgent,
    };

    return next.handle().pipe(
      tap((result) => {
        // Récupérer l'id de l'entité depuis la réponse ou les params de la requête
        const entiteId =
          result?.id ??
          request.params?.id ??
          undefined;

        // Log asynchrone — on ne bloque pas la réponse
        this.auditService
          .log(ctx, meta.action, meta.entite, entiteId, null, result)
          .catch(() => {
            // Echec silencieux : l'audit ne doit jamais faire échouer une opération métier
          });
      }),
    );
  }
}
