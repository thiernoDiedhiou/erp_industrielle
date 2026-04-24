import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangerMotDePasseDto {
  @ApiProperty()
  @IsString()
  motDePasseActuel!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  nouveauMotDePasse!: string;
}
