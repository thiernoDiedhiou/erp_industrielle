import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
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
}
