import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Numéro de page (commence à 1)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments par page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 20;

  @ApiPropertyOptional({ description: 'Recherche textuelle' })
  @IsOptional()
  @IsString()
  search?: string;
}
