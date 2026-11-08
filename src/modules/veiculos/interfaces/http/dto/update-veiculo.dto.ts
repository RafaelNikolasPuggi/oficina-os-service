import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateVeiculoDto {
  @ApiPropertyOptional({ example: 'Volkswagen' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  marca?: string;

  @ApiPropertyOptional({ example: 'Gol' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  modelo?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  ano?: number;
}
