import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@saas-erp/shared';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Limite stricte anti brute-force : 5 tentatives / minute par IP
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion multi-tenant' })
  @ApiResponse({ status: 200, description: 'Connexion réussie avec tokens JWT' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 404, description: 'Tenant introuvable' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives, réessayez dans 1 minute' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 10 renouvellements / minute par IP
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renouveler le token d'accès" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // Pas de throttling sur logout et profil (actions légitimes fréquentes)
  @Post('logout')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Déconnexion (révoque le refresh token)' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Get('me')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Profil de l'utilisateur connecté" })
  profil(@CurrentUser() user: JwtPayload) {
    return this.authService.profil(user.sub, user.tenantId);
  }
}
