import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '@saas-erp/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.query?.['token'] as string | null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        actif: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable ou inactif');
    }

    return payload;
  }
}
