import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFournisseurDto {
  @ApiProperty({ example: 'Granulés Sénégal SA' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional({ example: 'contact@granules.sn' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+221 77 000 00 00' })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ example: 'SN' })
  @IsString()
  @IsOptional()
  pays?: string;

  @ApiPropertyOptional({ example: 'Ibrahima Sow' })
  @IsString()
  @IsOptional()
  contactPrincipal?: string;

  @ApiPropertyOptional({ example: 14, description: 'Délai de livraison moyen en jours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  delaiLivraisonMoyen?: number;

  @ApiPropertyOptional({ example: 4.5, description: 'Note d\'évaluation sur 5' })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  noteEvaluation?: number;

  @ApiPropertyOptional({ example: '30 jours net' })
  @IsString()
  @IsOptional()
  conditionsPaiement?: string;
}
