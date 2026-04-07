import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statut =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erreur interne du serveur';

    // Remonter uniquement les erreurs 5xx à Sentry (pas les 4xx)
    if (statut >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag('url', request.url);
        scope.setTag('method', request.method);
        scope.setExtra('body', request.body);
        scope.setExtra('params', request.params);
        scope.setExtra('query', request.query);

        // Associer l'utilisateur si disponible
        const user = (request as any).user;
        if (user) {
          scope.setUser({
            id: user.sub,
            email: user.email,
            extra: { tenantId: user.tenantId, role: user.role },
          });
        }

        Sentry.captureException(exception);
      });

      this.logger.error(
        `[${request.method}] ${request.url} → ${statut}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statut).json({
      statusCode: statut,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
