import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMachineDto {
  @ApiProperty({ example: 'EXT-001' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Extrudeuse Principal' })
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiProperty({ example: 'extrudeuse' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  capacite?: number;

  @ApiPropertyOptional({ example: 'kg/h' })
  @IsString()
  @IsOptional()
  unite?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  actif?: boolean;

  @ApiPropertyOptional({ example: 'Atelier A — Zone plastique' })
  @IsString()
  @IsOptional()
  localisation?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsDateString()
  @IsOptional()
  dateDerniereMaintenance?: string;

  @ApiPropertyOptional({ example: '2026-07-15' })
  @IsDateString()
  @IsOptional()
  prochaineMaintenanceDate?: string;
}
