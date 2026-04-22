import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsArray, ValidateNested, IsNumber, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BomItemDto {
  @ApiPropertyOptional({ example: 'uuid-matiere-premiere', description: 'Matière première utilisée (exclusif avec produitId)' })
  @IsString()
  @IsOptional()
  matierePremiereId?: string;

  @ApiPropertyOptional({ example: 'uuid-produit', description: 'Sous-produit utilisé (exclusif avec matierePremiereId)' })
  @IsString()
  @IsOptional()
  produitId?: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantite!: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  unite?: string;

  @ApiPropertyOptional({ example: 2.0, description: 'Taux de pertes en pourcentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pertes?: number;

  @ApiPropertyOptional({ example: 'Granulés haute densité colorés en bleu' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateBomDto {
  @ApiProperty({ example: 'Nomenclature Sac PE 50kg v1.0' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiProperty({ example: 'uuid-produit-fini', description: 'ID de la matière première ou produit fini' })
  @IsString()
  @IsNotEmpty()
  produitFiniId!: string;

  @ApiPropertyOptional({ example: '1.0' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  actif?: boolean;

  @ApiPropertyOptional({ example: 'Nomenclature standard pour sacs basse pression' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [BomItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomItemDto)
  @IsOptional()
  items?: BomItemDto[];
}
