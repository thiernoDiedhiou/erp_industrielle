import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsPositive,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LigneCommandeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  produitId!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  quantite!: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  prixUnitaire!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCommandeDto {
  @ApiProperty({ example: 'client-id-uuid' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsString()
  @IsOptional()
  dateLivraison?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [LigneCommandeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneCommandeDto)
  lignes!: LigneCommandeDto[];
}
