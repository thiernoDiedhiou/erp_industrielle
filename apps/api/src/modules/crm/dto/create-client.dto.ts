import {
  IsString, IsNotEmpty, IsOptional, IsEmail,
  IsNumber, Min, Max, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const TYPES_CLIENT = ['industriel', 'agricole', 'alimentaire', 'distributeur', 'autre'] as const;

export class CreateClientDto {
  @ApiProperty({ example: 'Plastique Dakar SA' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional({ example: 'industriel', enum: TYPES_CLIENT })
  @IsIn(TYPES_CLIENT)
  @IsOptional()
  type?: string;

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

  @ApiPropertyOptional({ example: 'Dakar' })
  @IsString()
  @IsOptional()
  ville?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  ninea?: string;

  @ApiPropertyOptional({ example: 'actif' })
  @IsString()
  @IsOptional()
  statut?: string;

  @ApiPropertyOptional({ example: 'Mamadou Diallo' })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ example: 'uuid-commercial' })
  @IsString()
  @IsOptional()
  commercialId?: string;

  @ApiPropertyOptional({ example: 5000000, description: 'Plafond de crédit en FCFA' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  plafondCredit?: number;

  @ApiPropertyOptional({ example: 30, description: 'Délai de paiement en jours' })
  @IsNumber()
  @Min(0)
  @Max(365)
  @IsOptional()
  @Type(() => Number)
  delaiPaiement?: number;
}
