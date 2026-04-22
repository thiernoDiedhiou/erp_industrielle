import {
  IsString, IsNotEmpty, IsEmail, IsOptional, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@saas-erp/shared';

const ROLES = Object.values(UserRole);

export class CreateUserDto {
  @ApiProperty({ example: 'Mamadou' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional({ example: 'Diallo' })
  @IsString()
  @IsOptional()
  prenom?: string;

  @ApiProperty({ example: 'mamadou.diallo@gisac.sn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'commercial', enum: ROLES })
  @IsIn(ROLES)
  role!: string;

  @ApiPropertyOptional({ example: '+221 77 123 45 67' })
  @IsString()
  @IsOptional()
  telephone?: string;
}
