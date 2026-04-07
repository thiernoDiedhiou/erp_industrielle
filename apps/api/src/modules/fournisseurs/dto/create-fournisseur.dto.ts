import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
