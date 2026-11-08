import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../../shared/dto/pagination.dto';
import { StatusOrdemServico } from '../../../domain/status-ordem-servico.enum';

export class ListarOrdensServicoQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: StatusOrdemServico })
  @IsOptional()
  @IsEnum(StatusOrdemServico)
  status?: StatusOrdemServico;
}
