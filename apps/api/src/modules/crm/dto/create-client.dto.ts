import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Plastique Dakar SA' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional({ example: 'contact@plastiquedk.sn' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+221 77 123 45 67' })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ example: 'Zone Industrielle, Dakar' })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  ninea?: string;

  @ApiPropertyOptional({ example: 'actif' })
  @IsString()
  @IsOptional()
  statut?: string;
}
