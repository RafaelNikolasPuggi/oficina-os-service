import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, MinLength, ValidateNested } from 'class-validator';
import { ItemQuantidadeDto } from './item-quantidade.dto';

export class RegistrarDiagnosticoDto {
  @ApiProperty({
    example: 'Identificado desgaste nas pastilhas de freio dianteiras.',
  })
  @IsString()
  @MinLength(3)
  observacao: string;

  @ApiProperty({
    type: [ItemQuantidadeDto],
    description: 'Serviços adicionais identificados no diagnóstico',
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemQuantidadeDto)
  servicosAdicionais: ItemQuantidadeDto[] = [];

  @ApiProperty({
    type: [ItemQuantidadeDto],
    description: 'Peças adicionais identificadas no diagnóstico',
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemQuantidadeDto)
  pecasAdicionais: ItemQuantidadeDto[] = [];
}
