import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { IsPlaca } from '../../../../../shared/validators/is-placa.decorator';

export class CreateVeiculoDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  clienteId: string;

  @ApiProperty({
    example: 'ABC1D23',
    description: 'Formato antigo (AAA9999) ou Mercosul (AAA9A99)',
  })
  @IsString()
  @IsPlaca()
  placa: string;

  @ApiProperty({ example: 'Volkswagen' })
  @IsString()
  @MinLength(2)
  marca: string;

  @ApiProperty({ example: 'Gol' })
  @IsString()
  @MinLength(1)
  modelo: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @Min(1950)
  @Max(2100)
  ano: number;
}
