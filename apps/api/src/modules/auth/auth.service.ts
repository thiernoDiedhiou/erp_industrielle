import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '@saas-erp/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Vérifier que le tenant existe et est actif
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant || !tenant.actif) {
      throw new NotFoundException(`Tenant "${dto.tenantSlug}" introuvable ou inactif`);
    }

    // 2. Trouver l'utilisateur dans ce tenant
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: tenant.id,
        actif: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3. Vérifier le mot de passe
    const passwordValide = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 4. Générer les tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.genererAccessToken(payload),
      this.genererRefreshToken(payload),
    ]);

    // 5. Sauvegarder le refresh token haché en BDD
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
        derniereConnexion: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes en secondes
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        tenant: {
          id: tenant.id,
          nom: tenant.nom,
          slug: tenant.slug,
          couleurPrimaire: tenant.couleurPrimaire,
          couleurSecondaire: tenant.couleurSecondaire,
          logo: tenant.logo,
        },
      },
    };
  }

  async refresh(refreshToken: string) {
    // 1. Décoder le refresh token sans vérifier l'expiration
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    // 2. Trouver l'utilisateur et vérifier le token stocké
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId, actif: true },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session expirée, reconnectez-vous');
    }

    const tokenValide = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenValide) {
      throw new UnauthorizedException('Refresh token révoqué');
    }

    // 3. Générer un nouveau couple de tokens (rotation)
    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      tenantSlug: payload.tenantSlug,
      role: user.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.genererAccessToken(newPayload),
      this.genererRefreshToken(newPayload),
    ]);

    // 4. Rotation du refresh token en BDD
    const newHash = await bcrypt.hash(newRefreshToken, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newHash },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }

  async logout(userId: string) {
    // Invalider le refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async profil(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        derniereConnexion: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            nom: true,
            slug: true,
            plan: true,
            couleurPrimaire: true,
            couleurSecondaire: true,
            logo: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  private genererAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  private genererRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }
}
