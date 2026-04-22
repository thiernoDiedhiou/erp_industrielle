import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Super Admin — Auth')
@Controller('super-admin/auth')
export class SuperAdminAuthController {
  constructor(private auth: SuperAdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }
}
