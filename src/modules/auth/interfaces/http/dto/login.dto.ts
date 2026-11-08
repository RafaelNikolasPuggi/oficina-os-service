import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@oficina.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaForte123' })
  @IsString()
  @MinLength(6)
  senha: string;
}
