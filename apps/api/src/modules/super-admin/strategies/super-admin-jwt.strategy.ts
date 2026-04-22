import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminJwtStrategy extends PassportStrategy(Strategy, 'super-admin-jwt') {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  validate(payload: any) {
    if (!payload.isSuperAdmin) throw new UnauthorizedException('Accès réservé aux super-admins');
    return { id: payload.sub, email: payload.email, nom: payload.nom };
  }
}
