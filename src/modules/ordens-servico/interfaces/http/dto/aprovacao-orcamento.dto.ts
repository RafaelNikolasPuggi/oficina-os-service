import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AprovacaoOrcamentoDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  aprovado: boolean;
}
