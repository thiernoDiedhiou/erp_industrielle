import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@saas-erp/shared';

// Injecte l'utilisateur courant depuis le JWT dans les contrôleurs
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
