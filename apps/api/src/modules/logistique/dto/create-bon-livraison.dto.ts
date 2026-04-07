import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LigneLivraisonDto {
  @ApiProperty({ example: 'uuid-produit' })
  @IsString()
  @IsNotEmpty()
  produitId!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Type(() => Number)
  quantite!: number;

  @ApiPropertyOptional({ example: 'Sacs PE 50kg' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateBonLivraisonDto {
  @ApiPropertyOptional({ example: 'uuid-commande' })
  @IsString()
  @IsOptional()
  commandeId?: string;

  @ApiProperty({ example: 'uuid-client' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiPropertyOptional({ example: 'Zone Industrielle, Thiès' })
  @IsString()
  @IsOptional()
  adresseLivraison?: string;

  @ApiPropertyOptional({ example: 'DHL Sénégal' })
  @IsString()
  @IsOptional()
  transporteur?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dateExpedition?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [LigneLivraisonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneLivraisonDto)
  @IsOptional()
  lignes?: LigneLivraisonDto[];
}
