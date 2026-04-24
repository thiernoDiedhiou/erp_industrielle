import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModifierProfilDto {
  @ApiProperty({ example: 'Samoura' })
  @IsString()
  @Length(2, 100)
  nom!: string;

  @ApiPropertyOptional({ example: 'Ibrahima' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  prenom?: string;

  @ApiPropertyOptional({ example: '+221 77 123 45 67' })
  @IsOptional()
  @IsString()
  telephone?: string;
}
