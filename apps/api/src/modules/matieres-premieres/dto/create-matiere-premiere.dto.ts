import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMatierePremiereDto {
  @ApiProperty({ example: 'MP-GRAN-001' })
  @IsString()
  @IsNotEmpty()
  reference!: string;

  @ApiProperty({ example: 'Granulés PE haute densité' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiProperty({ example: 'granules' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ example: 'uuid-fournisseur' })
  @IsString()
  @IsOptional()
  fournisseurId?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  unite?: string;

  @ApiPropertyOptional({ example: 850 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  prixAchat?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stockMinimum?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRecycle?: boolean;
}
