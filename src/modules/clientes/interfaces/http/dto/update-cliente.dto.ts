import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClienteDto {
  @ApiPropertyOptional({ example: 'Maria da Silva' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nome?: string;

  @ApiPropertyOptional({ example: 'maria.silva@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '11987654321' })
  @IsOptional()
  @IsString()
  telefone?: string;
}
