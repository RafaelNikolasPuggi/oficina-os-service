import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ItemQuantidadeDto } from './item-quantidade.dto';

export class CreateOrdemServicoDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  clienteId: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  veiculoId: string;

  @ApiProperty({
    type: [ItemQuantidadeDto],
    description: 'Serviços solicitados pelo cliente na abertura da OS',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemQuantidadeDto)
  servicos: ItemQuantidadeDto[];

  @ApiProperty({
    type: [ItemQuantidadeDto],
    description: 'Peças/insumos já identificados como necessários',
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemQuantidadeDto)
  pecas: ItemQuantidadeDto[] = [];
}
