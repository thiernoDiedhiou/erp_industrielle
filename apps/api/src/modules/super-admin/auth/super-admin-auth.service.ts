import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SuperAdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { email } });

    if (!admin || !admin.actif) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const payload = {
      sub: admin.id,
      email: admin.email,
      nom: admin.nom,
      isSuperAdmin: true,
    };

    const access_token = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '8h',
    });

    return {
      access_token,
      superAdmin: { id: admin.id, email: admin.email, nom: admin.nom },
    };
  }
}
