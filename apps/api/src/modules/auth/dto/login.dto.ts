import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@gisac.sn' })
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(6, { message: 'Mot de passe trop court' })
  password!: string;

  @ApiProperty({ example: 'gisac', description: 'Slug du tenant' })
  @IsString()
  @IsNotEmpty({ message: 'Le slug du tenant est requis' })
  tenantSlug!: string;
}
