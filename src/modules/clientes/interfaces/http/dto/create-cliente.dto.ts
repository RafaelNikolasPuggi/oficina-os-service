import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsCpfCnpj } from '../../../../../shared/validators/is-cpf-cnpj.decorator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({
    example: '123.456.789-09',
    description: 'CPF ou CNPJ do cliente',
  })
  @IsString()
  @IsCpfCnpj()
  documento: string;

  @ApiProperty({ example: 'maria.silva@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '11987654321' })
  @IsString()
  @IsNotEmpty()
  telefone: string;
}
